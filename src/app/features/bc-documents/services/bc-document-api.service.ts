import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, retry, shareReplay, tap } from 'rxjs/operators';
import { BCDocument, BCDocumentDetail, BCDocType, BCDocStatus } from '../models/bc-document.model';
import { environment } from '../../../../environments/environment';

/**
 * BC Document API Service (Production Mode)
 * Requirements: 5.1, 5.4, 15.1, 15.2
 */
@Injectable({
    providedIn: 'root'
})
export class BCDocumentApiService {
    private http = inject(HttpClient);
    private readonly API_URL = `${environment.apiUrl}/bc-documents`;
    private readonly CEISA_API_URL = `${environment.ceisaApiUrl}`;

    // Cache for documents
    private cache = new Map<string, { data: Observable<any>, timestamp: number }>();
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    /**
     * Get all BC documents
     */
    getAll(): Observable<BCDocument[]> {
        const cacheKey = 'all_documents';
        return this.getCachedOrFetch(cacheKey, () =>
            this.http.get<BCDocument[]>(this.API_URL).pipe(
                retry(2),
                catchError(this.handleError)
            )
        );
    }

    /**
     * Get BC document by ID
     */
    getById(id: string): Observable<BCDocument> {
        const cacheKey = `document_${id}`;
        return this.getCachedOrFetch(cacheKey, () =>
            this.http.get<BCDocument>(`${this.API_URL}/${id}`).pipe(
                retry(2),
                catchError(this.handleError)
            )
        );
    }

    /**
     * Create new BC document
     */
    create(document: Partial<BCDocument>): Observable<BCDocument> {
        this.clearCache();
        return this.http.post<BCDocument>(this.API_URL, document).pipe(
            retry(1),
            catchError(this.handleError)
        );
    }

    /**
     * Update BC document
     */
    update(id: string, updates: Partial<BCDocument>): Observable<BCDocument> {
        this.clearCache();
        return this.http.put<BCDocument>(`${this.API_URL}/${id}`, updates).pipe(
            retry(1),
            catchError(this.handleError)
        );
    }

    /**
     * Delete BC document
     */
    delete(id: string): Observable<void> {
        this.clearCache();
        return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
            retry(1),
            catchError(this.handleError)
        );
    }

    /**
     * Upload document file to server
     * Requirement: 5.4
     */
    uploadFile(documentId: string, file: File): Observable<{ fileName: string; url: string }> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentId', documentId);

        return this.http.post<{ fileName: string; url: string }>(
            `${this.API_URL}/${documentId}/upload`,
            formData
        ).pipe(
            retry(1),
            catchError(this.handleError)
        );
    }

    /**
     * Delete uploaded file
     */
    deleteFile(documentId: string, fileName: string): Observable<void> {
        return this.http.delete<void>(
            `${this.API_URL}/${documentId}/files/${fileName}`
        ).pipe(
            retry(1),
            catchError(this.handleError)
        );
    }

    /**
     * Submit document to CEISA
     * Requirements: 15.1, 15.2
     */
    submitToCEISA(documentId: string): Observable<{
        success: boolean;
        responseNumber?: string;
        message: string;
    }> {
        return this.http.post<{
            success: boolean;
            responseNumber?: string;
            message: string;
        }>(`${this.API_URL}/${documentId}/submit-ceisa`, {}).pipe(
            retry(1),
            tap(response => {
                if (response.success) {
                    this.clearCache();
                }
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Check CEISA submission status
     * Requirement: 15.2
     */
    checkCEISAStatus(documentId: string): Observable<{
        status: string;
        responseNumber?: string;
        lastChecked: Date;
    }> {
        return this.http.get<{
            status: string;
            responseNumber?: string;
            lastChecked: Date;
        }>(`${this.API_URL}/${documentId}/ceisa-status`).pipe(
            retry(2),
            catchError(this.handleError)
        );
    }

    /**
     * Submit document (change status to SUBMITTED)
     */
    submitDocument(id: string, submittedBy: string): Observable<BCDocument> {
        this.clearCache();
        return this.http.post<BCDocument>(`${this.API_URL}/${id}/submit`, { submittedBy }).pipe(
            retry(1),
            catchError(this.handleError)
        );
    }

    /**
     * Approve document
     */
    approveDocument(id: string, approvedBy: string): Observable<BCDocument> {
        this.clearCache();
        return this.http.post<BCDocument>(`${this.API_URL}/${id}/approve`, { approvedBy }).pipe(
            retry(1),
            catchError(this.handleError)
        );
    }

    /**
     * Reject document
     */
    rejectDocument(id: string, rejectedBy: string, reason: string): Observable<BCDocument> {
        this.clearCache();
        return this.http.post<BCDocument>(`${this.API_URL}/${id}/reject`, {
            rejectedBy,
            reason
        }).pipe(
            retry(1),
            catchError(this.handleError)
        );
    }

    /**
     * Get documents by status
     */
    getByStatus(status: BCDocStatus): Observable<BCDocument[]> {
        const cacheKey = `documents_status_${status}`;
        return this.getCachedOrFetch(cacheKey, () =>
            this.http.get<BCDocument[]>(`${this.API_URL}/status/${status}`).pipe(
                retry(2),
                catchError(this.handleError)
            )
        );
    }

    /**
     * Get documents by type
     */
    getByType(type: BCDocType): Observable<BCDocument[]> {
        const cacheKey = `documents_type_${type}`;
        return this.getCachedOrFetch(cacheKey, () =>
            this.http.get<BCDocument[]>(`${this.API_URL}/type/${type}`).pipe(
                retry(2),
                catchError(this.handleError)
            )
        );
    }

    /**
     * Get document details
     */
    getDetails(documentId: string): Observable<BCDocumentDetail[]> {
        const cacheKey = `details_${documentId}`;
        return this.getCachedOrFetch(cacheKey, () =>
            this.http.get<BCDocumentDetail[]>(`${this.API_URL}/${documentId}/details`).pipe(
                retry(2),
                catchError(this.handleError)
            )
        );
    }

    /**
     * Add document detail
     */
    addDetail(detail: Partial<BCDocumentDetail>): Observable<BCDocumentDetail> {
        this.clearCache();
        return this.http.post<BCDocumentDetail>(
            `${this.API_URL}/${detail.bc_document_id}/details`,
            detail
        ).pipe(
            retry(1),
            catchError(this.handleError)
        );
    }

    /**
     * Delete document detail
     */
    deleteDetail(documentId: string, detailId: string): Observable<void> {
        this.clearCache();
        return this.http.delete<void>(
            `${this.API_URL}/${documentId}/details/${detailId}`
        ).pipe(
            retry(1),
            catchError(this.handleError)
        );
    }

    /**
     * Search documents
     */
    search(query: string): Observable<BCDocument[]> {
        return this.http.get<BCDocument[]>(`${this.API_URL}/search`, {
            params: { q: query }
        }).pipe(
            retry(2),
            catchError(this.handleError)
        );
    }

    /**
     * Get cached data or fetch from API
     */
    private getCachedOrFetch<T>(key: string, fetchFn: () => Observable<T>): Observable<T> {
        const cached = this.cache.get(key);
        const now = Date.now();

        if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
            return cached.data as Observable<T>;
        }

        const data$ = fetchFn().pipe(shareReplay(1));
        this.cache.set(key, { data: data$, timestamp: now });
        return data$;
    }

    /**
     * Clear cache
     */
    private clearCache(): void {
        this.cache.clear();
    }

    /**
     * Handle HTTP errors
     */
    private handleError(error: any): Observable<never> {
        let errorMessage = 'An error occurred';

        if (error.error instanceof ErrorEvent) {
            errorMessage = `Error: ${error.error.message}`;
        } else {
            errorMessage = error.error?.message || `Server error: ${error.status}`;
        }

        return throwError(() => ({ error: { message: errorMessage } }));
    }
}
