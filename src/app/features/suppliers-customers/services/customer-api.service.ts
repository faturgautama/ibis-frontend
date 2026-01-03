import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { DataProvider } from '../../../core/services/data-provider.service';
import { Customer } from '../models/customer.model';
import { environment } from '../../../../environments/environment';

/**
 * CustomerApiService
 * 
 * Production mode implementation of customer management using HTTP API.
 * Provides CRUD operations with error handling, retry logic, caching, and search/filtering.
 * 
 * Requirements: 4.1, 4.2
 */
@Injectable({
    providedIn: 'root'
})
export class CustomerApiService extends DataProvider<Customer> {
    private readonly apiUrl = `${environment.apiUrl}/customers`;
    private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes
    private cache: Map<string, { data: any; timestamp: number }> = new Map();

    constructor(private http: HttpClient) {
        super();
    }

    /**
     * Get all customers from API
     */
    getAll(): Observable<Customer[]> {
        const cacheKey = 'all_customers';
        const cached = this.getFromCache<Customer[]>(cacheKey);

        if (cached) {
            return of(cached);
        }

        return this.http.get<Customer[]>(this.apiUrl).pipe(
            retry({
                count: 3,
                delay: (error, retryCount) => {
                    return of(null).pipe(
                        tap(() => console.log(`Retry attempt ${retryCount} for getAll customers`))
                    );
                }
            }),
            tap(customers => this.setCache(cacheKey, customers)),
            catchError(this.handleError)
        );
    }

    /**
     * Get a single customer by ID
     */
    getById(id: string): Observable<Customer> {
        const cacheKey = `customer_${id}`;
        const cached = this.getFromCache<Customer>(cacheKey);

        if (cached) {
            return of(cached);
        }

        return this.http.get<Customer>(`${this.apiUrl}/${id}`).pipe(
            retry({
                count: 2,
                delay: 1000
            }),
            tap(customer => this.setCache(cacheKey, customer)),
            catchError(this.handleError)
        );
    }

    /**
     * Create a new customer
     */
    create(customer: Partial<Customer>): Observable<Customer> {
        return this.http.post<Customer>(this.apiUrl, customer).pipe(
            tap(() => this.invalidateCache()),
            catchError(this.handleError)
        );
    }

    /**
     * Update an existing customer
     */
    update(id: string, customer: Partial<Customer>): Observable<Customer> {
        return this.http.put<Customer>(`${this.apiUrl}/${id}`, customer).pipe(
            tap(() => {
                this.invalidateCache();
                this.cache.delete(`customer_${id}`);
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Delete a customer
     */
    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
            tap(() => {
                this.invalidateCache();
                this.cache.delete(`customer_${id}`);
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Get active customers only
     */
    getActiveCustomers(): Observable<Customer[]> {
        const params = new HttpParams().set('active', 'true');

        return this.http.get<Customer[]>(this.apiUrl, { params }).pipe(
            retry({
                count: 2,
                delay: 1000
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Search customers by query
     */
    search(query: string): Observable<Customer[]> {
        const params = new HttpParams().set('q', query);

        return this.http.get<Customer[]>(`${this.apiUrl}/search`, { params }).pipe(
            retry({
                count: 2,
                delay: 1000
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Filter customers by active status
     */
    filterByStatus(active: boolean): Observable<Customer[]> {
        const params = new HttpParams().set('active', active.toString());

        return this.http.get<Customer[]>(this.apiUrl, { params }).pipe(
            retry({
                count: 2,
                delay: 1000
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Toggle customer active status
     */
    toggleActive(id: string): Observable<Customer> {
        return this.http.patch<Customer>(`${this.apiUrl}/${id}/toggle-active`, {}).pipe(
            tap(() => {
                this.invalidateCache();
                this.cache.delete(`customer_${id}`);
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
                    errorMessage = error.error?.message || 'Customer not found';
                    break;
                case 409:
                    errorMessage = error.error?.message || 'Conflict - customer code or tax ID already exists';
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

        console.error('Customer API Error:', errorMessage, error);
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
