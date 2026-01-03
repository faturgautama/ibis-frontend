import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import {
    SyncResponse,
    CEISAResponse,
    CEISAStatus,
    CEISAStatusType,
    SyncQueue,
    SyncType,
    EntityType,
    SyncPriority,
    SyncStatus,
    ITInventoryPayload
} from '../models/customs-integration.model';

/**
 * Customs Integration Service
 * Requirements: 14.1, 14.2, 14.3, 14.6, 14.9, 15.1, 15.2
 */
@Injectable({
    providedIn: 'root'
})
export class CustomsIntegrationService {
    private localStorageService = inject(LocalStorageService);
    private readonly SYNC_QUEUE_KEY = 'sync_queue';
    private readonly CEISA_STATUS_KEY = 'ceisa_status';
    private readonly MAX_RETRIES = 3;
    private readonly BASE_RETRY_DELAY = 1000; // 1 second

    /**
     * Sync transaction to IT Inventory
     * Requirements: 14.1, 14.2
     */
    syncToITInventory(payload: ITInventoryPayload): Observable<SyncResponse> {
        // In demo mode, simulate successful sync
        const syncResponse: SyncResponse = {
            success: true,
            sync_id: `SYNC-${Date.now()}`,
            timestamp: new Date(),
            records_synced: payload.items.length,
            message: 'Successfully synced to IT Inventory (Demo Mode)'
        };

        // In production mode, this would make actual HTTP call to IT Inventory API
        return of(syncResponse).pipe(delay(500));
    }

    /**
     * Submit document to CEISA
     * Requirements: 15.1, 15.2
     */
    submitToCEISA(documentId: string, documentType: string, documentData: any): Observable<CEISAResponse> {
        // In demo mode, simulate successful submission
        const ceisaResponse: CEISAResponse = {
            success: true,
            ceisa_reference: `CEISA-${Date.now()}`,
            submission_date: new Date(),
            status: CEISAStatusType.SUBMITTED,
            message: 'Successfully submitted to CEISA (Demo Mode)'
        };

        // Save CEISA status
        const status: CEISAStatus = {
            ceisa_reference: ceisaResponse.ceisa_reference,
            document_number: documentId,
            document_type: documentType,
            status: CEISAStatusType.SUBMITTED,
            submission_date: new Date(),
            last_updated: new Date()
        };

        const statuses = this.localStorageService.getItem<CEISAStatus[]>(this.CEISA_STATUS_KEY) || [];
        statuses.push(status);
        this.localStorageService.setItem(this.CEISA_STATUS_KEY, statuses);

        // In production mode, this would make actual HTTP call to CEISA API
        return of(ceisaResponse).pipe(delay(800));
    }

    /**
     * Check CEISA submission status
     * Requirements: 15.2
     */
    checkCEISAStatus(ceisaReference: string): Observable<CEISAStatus | null> {
        const statuses = this.localStorageService.getItem<CEISAStatus[]>(this.CEISA_STATUS_KEY) || [];
        const status = statuses.find(s => s.ceisa_reference === ceisaReference);

        // In demo mode, simulate status progression
        if (status && status.status === CEISAStatusType.SUBMITTED) {
            // Randomly progress to APPROVED (80%) or REJECTED (20%)
            const isApproved = Math.random() > 0.2;
            status.status = isApproved ? CEISAStatusType.APPROVED : CEISAStatusType.REJECTED;
            status.last_updated = new Date();

            if (isApproved) {
                status.approval_date = new Date();
            } else {
                status.rejection_reason = 'Document validation failed (Demo)';
            }

            // Update storage
            const index = statuses.findIndex(s => s.ceisa_reference === ceisaReference);
            if (index !== -1) {
                statuses[index] = status;
                this.localStorageService.setItem(this.CEISA_STATUS_KEY, statuses);
            }
        }

        return of(status || null).pipe(delay(300));
    }

    /**
     * Get all CEISA statuses
     */
    getAllCEISAStatuses(): Observable<CEISAStatus[]> {
        const statuses = this.localStorageService.getItem<CEISAStatus[]>(this.CEISA_STATUS_KEY) || [];
        return of(statuses).pipe(delay(200));
    }

    /**
     * Add item to sync queue
     * Requirements: 14.6, 14.9
     */
    addToSyncQueue(
        syncType: SyncType,
        entityType: EntityType,
        entityId: string,
        entityData: any,
        priority: SyncPriority = SyncPriority.NORMAL,
        userId: string = 'system'
    ): Observable<SyncQueue> {
        const queue = this.localStorageService.getItem<SyncQueue[]>(this.SYNC_QUEUE_KEY) || [];

        const queueItem: SyncQueue = {
            id: Date.now().toString(),
            sync_type: syncType,
            entity_type: entityType,
            entity_id: entityId,
            entity_data: entityData,
            priority: priority,
            status: SyncStatus.PENDING,
            retry_count: 0,
            max_retries: this.MAX_RETRIES,
            created_at: new Date(),
            created_by: userId
        };

        queue.push(queueItem);
        this.localStorageService.setItem(this.SYNC_QUEUE_KEY, queue);

        return of(queueItem).pipe(delay(100));
    }

    /**
     * Process sync queue
     * Requirements: 14.6, 14.9
     */
    processSyncQueue(): Observable<{ processed: number; failed: number }> {
        const queue = this.localStorageService.getItem<SyncQueue[]>(this.SYNC_QUEUE_KEY) || [];
        const pendingItems = queue.filter(item =>
            item.status === SyncStatus.PENDING ||
            (item.status === SyncStatus.FAILED && item.retry_count < item.max_retries)
        );

        let processed = 0;
        let failed = 0;

        pendingItems.forEach(item => {
            const index = queue.findIndex(q => q.id === item.id);
            if (index === -1) return;

            // Update status to in progress
            queue[index].status = SyncStatus.IN_PROGRESS;
            queue[index].last_attempt = new Date();

            // Simulate sync attempt (80% success rate)
            const success = Math.random() > 0.2;

            if (success) {
                queue[index].status = SyncStatus.COMPLETED;
                processed++;
            } else {
                queue[index].retry_count++;

                if (queue[index].retry_count >= queue[index].max_retries) {
                    queue[index].status = SyncStatus.FAILED;
                    queue[index].error_message = 'Max retries exceeded';
                    failed++;
                } else {
                    queue[index].status = SyncStatus.PENDING;
                    queue[index].next_retry = this.calculateNextRetry(queue[index].retry_count);
                }
            }
        });

        this.localStorageService.setItem(this.SYNC_QUEUE_KEY, queue);

        return of({ processed, failed }).pipe(delay(500));
    }

    /**
     * Retry failed sync
     * Requirements: 14.6, 14.9
     */
    retryFailedSync(queueItemId: string): Observable<SyncResponse> {
        const queue = this.localStorageService.getItem<SyncQueue[]>(this.SYNC_QUEUE_KEY) || [];
        const index = queue.findIndex(item => item.id === queueItemId);

        if (index === -1) {
            return throwError(() => ({ error: { message: 'Queue item not found' } }));
        }

        const item = queue[index];

        if (item.retry_count >= item.max_retries) {
            return throwError(() => ({ error: { message: 'Max retries exceeded' } }));
        }

        // Reset status and increment retry count
        queue[index].status = SyncStatus.PENDING;
        queue[index].retry_count++;
        queue[index].last_attempt = new Date();
        queue[index].next_retry = this.calculateNextRetry(queue[index].retry_count);

        this.localStorageService.setItem(this.SYNC_QUEUE_KEY, queue);

        // Simulate retry (70% success rate)
        const success = Math.random() > 0.3;

        if (success) {
            queue[index].status = SyncStatus.COMPLETED;
            this.localStorageService.setItem(this.SYNC_QUEUE_KEY, queue);

            return of({
                success: true,
                sync_id: `RETRY-${Date.now()}`,
                timestamp: new Date(),
                records_synced: 1,
                message: 'Retry successful'
            }).pipe(delay(500));
        } else {
            queue[index].status = SyncStatus.FAILED;
            queue[index].error_message = 'Retry failed';
            this.localStorageService.setItem(this.SYNC_QUEUE_KEY, queue);

            return throwError(() => ({
                error: { message: 'Retry failed. Please try again later.' }
            })).pipe(delay(500));
        }
    }

    /**
     * Get sync queue
     */
    getSyncQueue(status?: SyncStatus): Observable<SyncQueue[]> {
        let queue = this.localStorageService.getItem<SyncQueue[]>(this.SYNC_QUEUE_KEY) || [];

        if (status) {
            queue = queue.filter(item => item.status === status);
        }

        // Sort by priority and created date
        queue.sort((a, b) => {
            const priorityOrder = { CRITICAL: 0, HIGH: 1, NORMAL: 2, LOW: 3 };
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (priorityDiff !== 0) return priorityDiff;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        return of(queue).pipe(delay(200));
    }

    /**
     * Clear completed queue items
     */
    clearCompletedQueue(): Observable<void> {
        const queue = this.localStorageService.getItem<SyncQueue[]>(this.SYNC_QUEUE_KEY) || [];
        const filtered = queue.filter(item => item.status !== SyncStatus.COMPLETED);
        this.localStorageService.setItem(this.SYNC_QUEUE_KEY, filtered);
        return of(void 0).pipe(delay(100));
    }

    /**
     * Calculate next retry time with exponential backoff
     * Requirements: 14.6
     */
    private calculateNextRetry(retryCount: number): Date {
        const delay = this.BASE_RETRY_DELAY * Math.pow(2, retryCount);
        return new Date(Date.now() + delay);
    }
}
