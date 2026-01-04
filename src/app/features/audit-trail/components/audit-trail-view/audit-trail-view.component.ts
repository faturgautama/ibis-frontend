import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { AuditLogService } from '../../services/audit-log.service';

/**
 * Audit Trail View Component
 * Requirements: 12.5, 12.6, 12.7
 */
@Component({
    selector: 'app-audit-trail-view',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        DatePickerModule,
        InputTextModule,
        SelectModule
    ],
    template: `
        <div class="main-layout">
            <!-- Page Header -->
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                        <i class="pi pi-history text-sky-600"></i>
                        Audit Trail
                    </h1>
                    <p class="text-sm text-gray-600 mt-1">Track and monitor all system changes</p>
                </div>
            </div>

            <!-- Table Card -->
            <div class="bg-white rounded-lg shadow-sm p-6" style="max-height: calc(100vh - 13rem); overflow-y: auto">
                <!-- Filters -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <p-datepicker 
                            [(ngModel)]="startDate"
                            dateFormat="dd/mm/yy"
                            [showIcon]="true"
                            class="w-full"
                        ></p-datepicker>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                        <p-datepicker 
                            [(ngModel)]="endDate"
                            dateFormat="dd/mm/yy"
                            [showIcon]="true"
                            class="w-full"
                        ></p-datepicker>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">User</label>
                        <input 
                            pInputText 
                            [(ngModel)]="userFilter"
                            placeholder="Filter by user"
                            class="w-full"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Action</label>
                        <p-select 
                            [(ngModel)]="actionFilter"
                            [options]="actionOptions"
                            placeholder="All Actions"
                            [showClear]="true"
                            class="w-full"
                        ></p-select>
                    </div>
                </div>

                <div class="flex gap-3 mb-6">
                    <button 
                        pButton 
                        label="Search" 
                        icon="pi pi-search"
                        (click)="loadAuditLogs()"
                        class="p-button-primary"
                    ></button>
                    <button 
                        pButton 
                        label="Export" 
                        icon="pi pi-download"
                        (click)="exportLogs()"
                        class="p-button-secondary"
                    ></button>
                </div>

                <!-- Audit Logs Table -->
                <p-table 
                    [value]="auditLogs" 
                    [paginator]="true" 
                    [rows]="20"
                    [showCurrentPageReport]="true"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                >
                    <ng-template pTemplate="header">
                        <tr>
                            <th>Timestamp</th>
                            <th>User</th>
                            <th>Action</th>
                            <th>Table</th>
                            <th>Record ID</th>
                            <th>Changes</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-log>
                        <tr>
                            <td>{{ log.timestamp | date:'short' }}</td>
                            <td>{{ log.user_name }}</td>
                            <td>
                                <span 
                                    class="px-2 py-1 rounded text-xs font-semibold"
                                    [class.bg-green-100]="log.action === 'INSERT'"
                                    [class.text-green-800]="log.action === 'INSERT'"
                                    [class.bg-blue-100]="log.action === 'UPDATE'"
                                    [class.text-blue-800]="log.action === 'UPDATE'"
                                    [class.bg-red-100]="log.action === 'DELETE'"
                                    [class.text-red-800]="log.action === 'DELETE'"
                                >
                                    {{ log.action }}
                                </span>
                            </td>
                            <td>{{ log.table_name }}</td>
                            <td>{{ log.record_id }}</td>
                            <td>
                                <button 
                                    pButton 
                                    icon="pi pi-eye"
                                    class="p-button-sm p-button-text"
                                    (click)="viewChanges(log)"
                                    pTooltip="View Changes"
                                ></button>
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="6" class="text-center text-gray-500 py-4">
                                No audit logs found
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>
    `
})
export class AuditTrailViewComponent implements OnInit {
    private auditLogService = inject(AuditLogService);

    auditLogs: any[] = [];
    startDate: Date | null = null;
    endDate: Date | null = null;
    userFilter = '';
    actionFilter = '';

    actionOptions = [
        { label: 'Insert', value: 'INSERT' },
        { label: 'Update', value: 'UPDATE' },
        { label: 'Delete', value: 'DELETE' }
    ];

    ngOnInit(): void {
        this.loadAuditLogs();
    }

    loadAuditLogs(): void {
        this.auditLogService.queryLogs({
            start_date: this.startDate || undefined,
            end_date: this.endDate || undefined,
            user_name: this.userFilter || undefined,
            action: this.actionFilter || undefined
        }).subscribe(logs => {
            this.auditLogs = logs;
        });
    }

    viewChanges(log: any): void {
        alert(`Old Data: ${log.old_data}\n\nNew Data: ${log.new_data}`);
    }

    exportLogs(): void {
        this.auditLogService.exportLogs({
            start_date: this.startDate || undefined,
            end_date: this.endDate || undefined
        }).subscribe(blob => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'audit_trail.csv';
            link.click();
            window.URL.revokeObjectURL(url);
        });
    }
}
