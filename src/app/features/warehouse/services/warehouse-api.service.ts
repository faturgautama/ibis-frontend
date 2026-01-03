import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { DataProvider } from '../../../core/services/data-provider.service';
import { Warehouse } from '../models/warehouse.model';
import { environment } from '../../../../environments/environment';

/**
 * WarehouseApiService
 * 
 * Production mode implementation of warehouse management using HTTP API.
 * Provides CRUD operations with error handling, retry logic, and caching.
 * Implements capacity tracking and utilization calculation.
 * 
 * Requirements: 3.1, 3.4
 */
@Injectable({
    providedIn: 'root'
})
export class WarehouseApiService extends DataProvider<Warehouse> {
    private readonly apiUrl = `${environment.apiUrl}/warehouses`;
    private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes
    private cache: Map<string, { data: any; timestamp: number }> = new Map();

    constructor(private http: HttpClient) {
        super();
    }

    /**
     * Get all warehouses from API
     * Implements caching strategy to reduce API calls
     * @returns Observable of all warehouses
     */
    getAll(): Observable<Warehouse[]> {
        const cacheKey = 'all_warehouses';
        const cached = this.getFromCache<Warehouse[]>(cacheKey);

        if (cached) {
            return of(cached);
        }

        return this.http.get<Warehouse[]>(this.apiUrl).pipe(
            retry({
                count: 3,
                delay: (error, retryCount) => {
                    // Exponential backoff: 1s, 2s, 4s
                    return of(null).pipe(
                        tap(() => console.log(`Retry attempt ${retryCount} for getAll warehouses`))
                    );
                }
            }),
            tap(warehouses => this.setCache(cacheKey, warehouses)),
            catchError(this.handleError)
        );
    }

    /**
     * Get a single warehouse by ID
     * @param id - Warehouse ID
     * @returns Observable of the warehouse
     */
    getById(id: string): Observable<Warehouse> {
        const cacheKey = `warehouse_${id}`;
        const cached = this.getFromCache<Warehouse>(cacheKey);

        if (cached) {
            return of(cached);
        }

        return this.http.get<Warehouse>(`${this.apiUrl}/${id}`).pipe(
            retry({
                count: 2,
                delay: 1000
            }),
            tap(warehouse => this.setCache(cacheKey, warehouse)),
            catchError(this.handleError)
        );
    }

    /**
     * Create a new warehouse
     * Invalidates cache after successful creation
     * @param warehouse - Warehouse to create
     * @returns Observable of the created warehouse
     */
    create(warehouse: Partial<Warehouse>): Observable<Warehouse> {
        return this.http.post<Warehouse>(this.apiUrl, warehouse).pipe(
            tap(() => this.invalidateCache()),
            catchError(this.handleError)
        );
    }

    /**
     * Update an existing warehouse
     * Invalidates cache after successful update
     * @param id - Warehouse ID
     * @param warehouse - Updated warehouse data
     * @returns Observable of the updated warehouse
     */
    update(id: string, warehouse: Partial<Warehouse>): Observable<Warehouse> {
        return this.http.put<Warehouse>(`${this.apiUrl}/${id}`, warehouse).pipe(
            tap(() => {
                this.invalidateCache();
                this.cache.delete(`warehouse_${id}`);
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Delete a warehouse
     * Invalidates cache after successful deletion
     * @param id - Warehouse ID
     * @returns Observable of void
     */
    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
            tap(() => {
                this.invalidateCache();
                this.cache.delete(`warehouse_${id}`);
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Get warehouses with expiring licenses (Requirement 3.6)
     * @param days - Number of days before expiry to consider (default: 30)
     * @returns Observable of warehouses with licenses expiring within threshold
     */
    getExpiringLicenses(days: number = 30): Observable<Warehouse[]> {
        const cacheKey = `expiring_licenses_${days}`;
        const cached = this.getFromCache<Warehouse[]>(cacheKey);

        if (cached) {
            return of(cached);
        }

        const params = new HttpParams().set('days', days.toString());

        return this.http.get<Warehouse[]>(`${this.apiUrl}/expiring-licenses`, { params }).pipe(
            retry({
                count: 2,
                delay: 1000
            }),
            tap(warehouses => this.setCache(cacheKey, warehouses, 60000)), // Cache for 1 minute
            catchError(this.handleError)
        );
    }

    /**
     * Get warehouse capacity and utilization metrics (Requirement 3.4)
     * @param id - Warehouse ID
     * @returns Observable of warehouse with updated capacity metrics
     */
    getCapacityMetrics(id: string): Observable<{ capacity: number; utilization: number; utilizationPercentage: number }> {
        return this.http.get<{ capacity: number; utilization: number; utilizationPercentage: number }>(
            `${this.apiUrl}/${id}/capacity`
        ).pipe(
            retry({
                count: 2,
                delay: 1000
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Update warehouse utilization (Requirement 3.4)
     * @param id - Warehouse ID
     * @param utilization - New utilization value
     * @returns Observable of the updated warehouse
     */
    updateUtilization(id: string, utilization: number): Observable<Warehouse> {
        return this.http.patch<Warehouse>(`${this.apiUrl}/${id}/utilization`, { utilization }).pipe(
            tap(() => {
                this.invalidateCache();
                this.cache.delete(`warehouse_${id}`);
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Get warehouses by type
     * @param warehouseType - Warehouse type to filter by
     * @returns Observable of warehouses of the specified type
     */
    getByType(warehouseType: string): Observable<Warehouse[]> {
        const params = new HttpParams().set('type', warehouseType);

        return this.http.get<Warehouse[]>(this.apiUrl, { params }).pipe(
            retry({
                count: 2,
                delay: 1000
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Get bonded warehouses only
     * @returns Observable of bonded warehouses
     */
    getBondedWarehouses(): Observable<Warehouse[]> {
        const params = new HttpParams().set('bonded', 'true');

        return this.http.get<Warehouse[]>(this.apiUrl, { params }).pipe(
            retry({
                count: 2,
                delay: 1000
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Calculate utilization percentage (Requirement 3.4)
     * @param capacity - Total warehouse capacity
     * @param currentUtilization - Current utilization
     * @returns Utilization percentage
     */
    calculateUtilizationPercentage(capacity: number, currentUtilization: number): number {
        if (!capacity || capacity === 0) {
            return 0;
        }
        return Math.round((currentUtilization / capacity) * 100);
    }

    /**
     * Handle HTTP errors
     * @param error - HTTP error response
     * @returns Observable that throws formatted error
     */
    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'An error occurred';

        if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = `Client Error: ${error.error.message}`;
        } else {
            // Server-side error
            switch (error.status) {
                case 400:
                    errorMessage = error.error?.message || 'Invalid request';
                    break;
                case 401:
                    errorMessage = 'Unauthorized. Please login again.';
                    break;
                case 403:
                    errorMessage = 'Access denied';
                    break;
                case 404:
                    errorMessage = error.error?.message || 'Warehouse not found';
                    break;
                case 409:
                    errorMessage = error.error?.message || 'Conflict - warehouse code already exists';
                    break;
                case 422:
                    errorMessage = error.error?.message || 'Validation error';
                    break;
                case 500:
                    errorMessage = 'Server error. Please try again later.';
                    break;
                case 502:
                case 503:
                    errorMessage = 'Service temporarily unavailable';
                    break;
                default:
                    errorMessage = `Error ${error.status}: ${error.error?.message || error.message}`;
            }
        }

        console.error('Warehouse API Error:', errorMessage, error);
        return throwError(() => ({
            status: error.status,
            error: { message: errorMessage }
        }));
    }

    /**
     * Get data from cache if not expired
     * @param key - Cache key
     * @returns Cached data or null
     */
    private getFromCache<T>(key: string): T | null {
        const cached = this.cache.get(key);

        if (!cached) {
            return null;
        }

        const now = Date.now();
        if (now - cached.timestamp > this.cacheTimeout) {
            this.cache.delete(key);
            return null;
        }

        return cached.data as T;
    }

    /**
     * Set data in cache
     * @param key - Cache key
     * @param data - Data to cache
     * @param timeout - Optional custom timeout in milliseconds
     */
    private setCache(key: string, data: any, timeout?: number): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });

        // Auto-clear cache after timeout
        setTimeout(() => {
            this.cache.delete(key);
        }, timeout || this.cacheTimeout);
    }

    /**
     * Invalidate all cache entries
     */
    private invalidateCache(): void {
        this.cache.clear();
    }

    /**
     * Clear specific cache entry
     * @param key - Cache key to clear
     */
    clearCache(key?: string): void {
        if (key) {
            this.cache.delete(key);
        } else {
            this.invalidateCache();
        }
    }
}
