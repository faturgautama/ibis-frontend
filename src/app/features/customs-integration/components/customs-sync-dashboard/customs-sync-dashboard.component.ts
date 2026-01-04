import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';
import { LucideAngularModule, RefreshCw, Play, Trash2, RotateCcw } from 'lucide-angular';
import { CustomsIntegrationService } from '../../services/customs-integration.service';
import { SyncQueue, CEISAStatus, SyncStatus } from '../../models/customs-integration.model';

/**
 * Customs Sync Dashboard Component
 * Requirements: 14.8, 14.9, 15.2, 15.6
 */
@Component({
    selector: 'app-customs-sync-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        ButtonModule,
        CardModule,
        TagModule,
        TabsModule,
        LucideAngularModule
    ],
    template: `
        <div class="main-layout">
            <!-- Page Header -->
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                        <lucide-icon [img]="RefreshCwIcon" class="w-6 h-6 text-sky-600"></lucide-icon>
                        Customs Integration Dashboard
                    </h1>
                    <p class="text-sm text-gray-600 mt-1">Monitor and manage customs synchronization</p>
                </div>
            </div>

            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div class="text-sm text-blue-600 font-medium">Pending Sync</div>
                    <div class="text-2xl font-bold text-blue-900">{{ pendingCount }}</div>
                </div>
                <div class="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div class="text-sm text-green-600 font-medium">Completed</div>
                    <div class="text-2xl font-bold text-green-900">{{ completedCount }}</div>
                </div>
                <div class="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div class="text-sm text-red-600 font-medium">Failed</div>
                    <div class="text-2xl font-bold text-red-900">{{ failedCount }}</div>
                </div>
                <div class="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <div class="text-sm text-yellow-600 font-medium">In Progress</div>
                    <div class="text-2xl font-bold text-yellow-900">{{ inProgressCount }}</div>
                </div>
            </div>

            <!-- Action Buttons Card -->
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div class="flex gap-3">
                    <button 
                        pButton 
                        label="Process Queue" 
                        (click)="processQueue()"
                        class="p-button-primary"
                    >
                        <lucide-icon [img]="PlayIcon" class="w-4 h-4"></lucide-icon>
                    </button>
                    <button 
                        pButton 
                        label="Refresh" 
                        (click)="loadData()"
                        class="p-button-secondary"
                    >
                        <lucide-icon [img]="RefreshCwIcon" class="w-4 h-4"></lucide-icon>
                    </button>
                    <button 
                        pButton 
                        label="Clear Completed" 
                        (click)="clearCompleted()"
                        class="p-button-warning"
                    >
                        <lucide-icon [img]="Trash2Icon" class="w-4 h-4"></lucide-icon>
                    </button>
                </div>
            </div>

            <!-- Tables Card -->
            <div class="bg-white rounded-lg shadow-sm p-6">
                <p-tabs>
                <p-tabpanel header="Sync Queue">
                    <div class="py-4">
                        <p-table [value]="syncQueue" [paginator]="true" [rows]="10">
                            <ng-template pTemplate="header">
                                <tr>
                                    <th>ID</th>
                                    <th>Type</th>
                                    <th>Entity</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Retry Count</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="body" let-item>
                                <tr>
                                    <td>{{ item.id }}</td>
                                    <td>
                                        <p-tag [value]="item.sync_type" severity="info"></p-tag>
                                    </td>
                                    <td>{{ item.entity_type }}</td>
                                    <td>
                                        <p-tag 
                                            [value]="item.priority" 
                                            [severity]="getPrioritySeverity(item.priority)"
                                        ></p-tag>
                                    </td>
                                    <td>
                                        <p-tag 
                                            [value]="item.status" 
                                            [severity]="getStatusSeverity(item.status)"
                                        ></p-tag>
                                    </td>
                                    <td>{{ item.retry_count }} / {{ item.max_retries }}</td>
                                    <td>{{ item.created_at | date:'short' }}</td>
                                    <td>
                                        <button 
                                            pButton 
                                            icon="pi pi-replay"
                                            class="p-button-sm p-button-text"
                                            (click)="retrySync(item.id)"
                                            [disabled]="item.status !== 'FAILED'"
                                            pTooltip="Retry"
                                        ></button>
                                    </td>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="emptymessage">
                                <tr>
                                    <td colspan="8" class="text-center text-gray-500 py-4">
                                        No items in sync queue
                                    </td>
                                </tr>
                            </ng-template>
                        </p-table>
                    </div>
                </p-tabpanel>

                <p-tabpanel header="CEISA Status">
                    <div class="py-4">
                        <p-table [value]="ceisaStatuses" [paginator]="true" [rows]="10">
                            <ng-template pTemplate="header">
                                <tr>
                                    <th>CEISA Reference</th>
                                    <th>Document Number</th>
                                    <th>Document Type</th>
                                    <th>Status</th>
                                    <th>Submission Date</th>
                                    <th>Last Updated</th>
                                    <th>Actions</th>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="body" let-status>
                                <tr>
                                    <td>{{ status.ceisa_reference }}</td>
                                    <td>{{ status.document_number }}</td>
                                    <td>{{ status.document_type }}</td>
                                    <td>
                                        <p-tag 
                                            [value]="status.status" 
                                            [severity]="getCEISAStatusSeverity(status.status)"
                                        ></p-tag>
                                    </td>
                                    <td>{{ status.submission_date | date:'short' }}</td>
                                    <td>{{ status.last_updated | date:'short' }}</td>
                                    <td>
                                        <button 
                                            pButton 
                                            icon="pi pi-refresh"
                                            class="p-button-sm p-button-text"
                                            (click)="checkStatus(status.ceisa_reference)"
                                            pTooltip="Check Status"
                                        ></button>
                                    </td>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="emptymessage">
                                <tr>
                                    <td colspan="7" class="text-center text-gray-500 py-4">
                                        No CEISA submissions found
                                    </td>
                                </tr>
                            </ng-template>
                        </p-table>
                    </div>
                </p-tabpanel>
            </p-tabs>
            </div>
        </div>
    `
})
export class CustomsSyncDashboardComponent implements OnInit {
    private customsService = inject(CustomsIntegrationService);

    // Lucide Icons
    RefreshCwIcon = RefreshCw;
    PlayIcon = Play;
    Trash2Icon = Trash2;
    RotateCcwIcon = RotateCcw;

    syncQueue: SyncQueue[] = [];
    ceisaStatuses: CEISAStatus[] = [];

    pendingCount = 0;
    completedCount = 0;
    failedCount = 0;
    inProgressCount = 0;

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.customsService.getSyncQueue().subscribe(queue => {
            this.syncQueue = queue;
            this.updateCounts();
        });

        this.customsService.getAllCEISAStatuses().subscribe(statuses => {
            this.ceisaStatuses = statuses;
        });
    }

    updateCounts(): void {
        this.pendingCount = this.syncQueue.filter(q => q.status === SyncStatus.PENDING).length;
        this.completedCount = this.syncQueue.filter(q => q.status === SyncStatus.COMPLETED).length;
        this.failedCount = this.syncQueue.filter(q => q.status === SyncStatus.FAILED).length;
        this.inProgressCount = this.syncQueue.filter(q => q.status === SyncStatus.IN_PROGRESS).length;
    }

    processQueue(): void {
        this.customsService.processSyncQueue().subscribe(result => {
            console.log(`Processed: ${result.processed}, Failed: ${result.failed}`);
            this.loadData();
        });
    }

    retrySync(queueItemId: string): void {
        this.customsService.retryFailedSync(queueItemId).subscribe({
            next: () => {
                console.log('Retry successful');
                this.loadData();
            },
            error: (err) => {
                console.error('Retry failed:', err);
                this.loadData();
            }
        });
    }

    checkStatus(ceisaReference: string): void {
        this.customsService.checkCEISAStatus(ceisaReference).subscribe(status => {
            if (status) {
                const index = this.ceisaStatuses.findIndex(s => s.ceisa_reference === ceisaReference);
                if (index !== -1) {
                    this.ceisaStatuses[index] = status;
                }
            }
        });
    }

    clearCompleted(): void {
        this.customsService.clearCompletedQueue().subscribe(() => {
            this.loadData();
        });
    }

    getPrioritySeverity(priority: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
        const map: Record<string, 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast'> = {
            'CRITICAL': 'danger',
            'HIGH': 'warn',
            'NORMAL': 'info',
            'LOW': 'secondary'
        };
        return map[priority] || 'info';
    }

    getStatusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
        const map: Record<string, 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast'> = {
            'COMPLETED': 'success',
            'IN_PROGRESS': 'warn',
            'PENDING': 'info',
            'FAILED': 'danger',
            'CANCELLED': 'secondary'
        };
        return map[status] || 'info';
    }

    getCEISAStatusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
        const map: Record<string, 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast'> = {
            'APPROVED': 'success',
            'SUBMITTED': 'info',
            'PROCESSING': 'warn',
            'REJECTED': 'danger',
            'FAILED': 'danger',
            'PENDING': 'secondary'
        };
        return map[status] || 'info';
    }
}
