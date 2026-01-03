import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { DataProvider } from '../../../core/services/data-provider.service';
import { Supplier } from '../models/supplier.model';
import { environment } from '../../../../environments/environment';

/**
 * SupplierApiService
 * 
 * Production mode implementation of supplier management using HTTP API.
 * Provides CRUD operations with error handling, retry logic, caching, and search/filtering.
 * 
 * Requirements: 4.1, 4.2
 */
@Injectable({
    providedIn: 'root'
})
export class SupplierApiService extends DataProvider<Supplier> {
    private readonly apiUrl = `${environment.apiUrl}/suppliers`;
    private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes
    private cache: Map<string, { data: any; timestamp: number }> = new Map();

    constructor(private http: HttpClient) {
        super();
    }

    /**
     * Get all suppliers from API
     */
    getAll(): Observable<Supplier[]> {
        const cacheKey = 'all_suppliers';
        const cached = this.getFromCache<Supplier[]>(cacheKey);

        if (cached) {
            return of(cached);
        }

        return this.http.get<Supplier[]>(this.apiUrl).pipe(
            retry({
                count: 3,
                delay: (error, retryCount) => {
                    return of(null).pipe(
                        tap(() => console.log(`Retry attempt ${retryCount} for getAll suppliers`))
                    );
                }
            }),
            tap(suppliers => this.setCache(cacheKey, suppliers)),
            catchError(this.handleError)
        );
    }

    /**
     * Get a single supplier by ID
     */
    getById(id: string): Observable<Supplier> {
        const cacheKey = `supplier_${id}`;
        const cached = this.getFromCache<Supplier>(cacheKey);

        if (cached) {
            return of(cached);
        }

        return this.http.get<Supplier>(`${this.apiUrl}/${id}`).pipe(
            retry({
                count: 2,
                delay: 1000
            }),
            tap(supplier => this.setCache(cacheKey, supplier)),
            catchError(this.handleError)
        );
    }

    /**
     * Create a new supplier
     */
    create(supplier: Partial<Supplier>): Observable<Supplier> {
        return this.http.post<Supplier>(this.apiUrl, supplier).pipe(
            tap(() => this.invalidateCache()),
            catchError(this.handleError)
        );
    }

    /**
     * Update an existing supplier
     */
    update(id: string, supplier: Partial<Supplier>): Observable<Supplier> {
        return this.http.put<Supplier>(`${this.apiUrl}/${id}`, supplier).pipe(
            tap(() => {
                this.invalidateCache();
                this.cache.delete(`supplier_${id}`);
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Delete a supplier
     */
    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
            tap(() => {
                this.invalidateCache();
                this.cache.delete(`supplier_${id}`);
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Get active suppliers only
     */
    getActiveSuppliers(): Observable<Supplier[]> {
        const params = new HttpParams().set('active', 'true');

        return this.http.get<Supplier[]>(this.apiUrl, { params }).pipe(
            retry({
                count: 2,
                delay: 1000
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Search suppliers by query
     */
    search(query: string): Observable<Supplier[]> {
        const params = new HttpParams().set('q', query);

        return this.http.get<Supplier[]>(`${this.apiUrl}/search`, { params }).pipe(
            retry({
                count: 2,
                delay: 1000
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Filter suppliers by active status
     */
    filterByStatus(active: boolean): Observable<Supplier[]> {
        const params = new HttpParams().set('active', active.toString());

        return this.http.get<Supplier[]>(this.apiUrl, { params }).pipe(
            retry({
                count: 2,
                delay: 1000
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Toggle supplier active status
     */
    toggleActive(id: string): Observable<Supplier> {
        return this.http.patch<Supplier>(`${this.apiUrl}/${id}/toggle-active`, {}).pipe(
            tap(() => {
                this.invalidateCache();
                this.cache.delete(`supplier_${id}`);
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Handle HTTP errors
     */
    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'An error occurred';

        if (error.error instanceof ErrorEvent) {
            errorMessage = `Client Error: ${error.error.message}`;
        } else {
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
                    errorMessage = error.error?.message || 'Supplier not found';
                    break;
                case 409:
                    errorMessage = error.error?.message || 'Conflict - supplier code or tax ID already exists';
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

        console.error('Supplier API Error:', errorMessage, error);
        return throwError(() => ({
            status: error.status,
            error: { message: errorMessage }
        }));
    }

    /**
     * Get data from cache if not expired
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
     */
    private setCache(key: string, data: any, timeout?: number): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });

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
     */
    clearCache(key?: string): void {
        if (key) {
            this.cache.delete(key);
        } else {
            this.invalidateCache();
        }
    }
}
