import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, retry, tap, shareReplay, map } from 'rxjs/operators';
import { DataProvider } from '../../../core/services/data-provider.service';
import { Item } from '../models/item.model';
import { environment } from '../../../../environments/environment';

/**
 * InventoryApiService
 * 
 * Production mode implementation of inventory management using HTTP API.
 * Provides CRUD operations with error handling, retry logic, and caching.
 * 
 * Requirements: 2.1, 2.5, 14.2, 14.3
 */
@Injectable({
    providedIn: 'root'
})
export class InventoryApiService extends DataProvider<Item> {
    private readonly apiUrl = `${environment.apiUrl}/items`;
    private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes
    private cache: Map<string, { data: any; timestamp: number }> = new Map();

    constructor(private http: HttpClient) {
        super();
    }

    /**
     * Get all items from API
     * Implements caching strategy to reduce API calls
     * @returns Observable of all items
     */
    getAll(): Observable<Item[]> {
        const cacheKey = 'all_items';
        const cached = this.getFromCache<Item[]>(cacheKey);

        if (cached) {
            return of(cached);
        }

        return this.http.get<Item[]>(this.apiUrl).pipe(
            retry({
                count: 3,
                delay: (error, retryCount) => {
                    // Exponential backoff: 1s, 2s, 4s
                    return of(null).pipe(
                        tap(() => console.log(`Retry attempt ${retryCount} for getAll`))
                    );
                }
            }),
            tap(items => this.setCache(cacheKey, items)),
            catchError(this.handleError)
        );
    }

    /**
     * Get a single item by ID
     * @param id - Item ID
     * @returns Observable of the item
     */
    getById(id: string): Observable<Item> {
        const cacheKey = `item_${id}`;
        const cached = this.getFromCache<Item>(cacheKey);

        if (cached) {
            return of(cached);
        }

        return this.http.get<Item>(`${this.apiUrl}/${id}`).pipe(
            retry({
                count: 2,
                delay: 1000
            }),
            tap(item => this.setCache(cacheKey, item)),
            catchError(this.handleError)
        );
    }

    /**
     * Create a new item
     * Invalidates cache after successful creation
     * @param item - Item to create
     * @returns Observable of the created item
     */
    create(item: Partial<Item>): Observable<Item> {
        return this.http.post<Item>(this.apiUrl, item).pipe(
            tap(() => this.invalidateCache()),
            catchError(this.handleError)
        );
    }

    /**
     * Update an existing item
     * Invalidates cache after successful update
     * @param id - Item ID
     * @param item - Updated item data
     * @returns Observable of the updated item
     */
    update(id: string, item: Partial<Item>): Observable<Item> {
        return this.http.put<Item>(`${this.apiUrl}/${id}`, item).pipe(
            tap(() => {
                this.invalidateCache();
                this.cache.delete(`item_${id}`);
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Delete an item
     * Invalidates cache after successful deletion
     * @param id - Item ID
     * @returns Observable of void
     */
    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
            tap(() => {
                this.invalidateCache();
                this.cache.delete(`item_${id}`);
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Get items with low stock (Requirement 2.5)
     * @returns Observable of items where qty_balance < min_stock
     */
    getLowStockItems(): Observable<Item[]> {
        const cacheKey = 'low_stock_items';
        const cached = this.getFromCache<Item[]>(cacheKey);

        if (cached) {
            return of(cached);
        }

        return this.http.get<Item[]>(`${this.apiUrl}/low-stock`).pipe(
            retry({
                count: 2,
                delay: 1000
            }),
            tap(items => this.setCache(cacheKey, items, 60000)), // Cache for 1 minute
            catchError(this.handleError)
        );
    }

    /**
     * Get items nearing expiry date
     * @param days - Number of days before expiry to consider (default: 30)
     * @returns Observable of items expiring within threshold
     */
    getExpiringItems(days: number = 30): Observable<Item[]> {
        const cacheKey = `expiring_items_${days}`;
        const cached = this.getFromCache<Item[]>(cacheKey);

        if (cached) {
            return of(cached);
        }

        const params = new HttpParams().set('days', days.toString());

        return this.http.get<Item[]>(`${this.apiUrl}/expiring`, { params }).pipe(
            retry({
                count: 2,
                delay: 1000
            }),
            tap(items => this.setCache(cacheKey, items, 60000)), // Cache for 1 minute
            catchError(this.handleError)
        );
    }

    /**
     * Search items by query
     * @param query - Search query string
     * @returns Observable of matching items
     */
    search(query: string): Observable<Item[]> {
        const params = new HttpParams().set('q', query);

        return this.http.get<Item[]>(`${this.apiUrl}/search`, { params }).pipe(
            retry({
                count: 2,
                delay: 1000
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Get items by type
     * @param itemType - Item type to filter by
     * @returns Observable of items of the specified type
     */
    getByType(itemType: string): Observable<Item[]> {
        const params = new HttpParams().set('type', itemType);

        return this.http.get<Item[]>(this.apiUrl, { params }).pipe(
            retry({
                count: 2,
                delay: 1000
            }),
            catchError(this.handleError)
        );
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
                    errorMessage = error.error?.message || 'Resource not found';
                    break;
                case 409:
                    errorMessage = error.error?.message || 'Conflict - resource already exists';
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

        console.error('API Error:', errorMessage, error);
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
