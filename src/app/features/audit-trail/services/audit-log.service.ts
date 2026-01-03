import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { AuditLog, AuditAction } from '../models/audit-log.model';
import { LocalStorageService } from '../../../core/services/local-storage.service';

/**
 * Audit Log Service
 * Requirements: 12.1, 12.2, 12.3, 12.5, 12.7
 */
@Injectable({
    providedIn: 'root'
})
export class AuditLogService {
    private localStorageService = inject(LocalStorageService);
    private readonly STORAGE_KEY = 'audit_logs';

    /**
     * Log a change (Requirement 12.1, 12.2)
     */
    logChange(
        tableName: string,
        recordId: string,
        action: AuditAction,
        oldData: any,
        newData: any,
        userId: string,
        userName: string
    ): void {
        const logs = this.localStorageService.getItem<AuditLog[]>(this.STORAGE_KEY) || [];

        // Determine changed fields
        const changedFields: string[] = [];
        if (action === AuditAction.UPDATE && oldData && newData) {
            Object.keys(newData).forEach(key => {
                if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
                    changedFields.push(key);
                }
            });
        }

        const log: AuditLog = {
            id: Date.now().toString(),
            table_name: tableName,
            record_id: recordId,
            action,
            old_data: oldData ? JSON.parse(JSON.stringify(oldData)) : undefined,
            new_data: newData ? JSON.parse(JSON.stringify(newData)) : undefined,
            changed_fields: changedFields,
            user_id: userId,
            user_name: userName,
            timestamp: new Date(),
            ip_address: '127.0.0.1',
            user_agent: navigator.userAgent
        };

        logs.push(log);
        this.localStorageService.setItem(this.STORAGE_KEY, logs);
    }

    /**
     * Query audit logs with filters (Requirement 12.5)
     */
    query(filters?: {
        tableName?: string;
        recordId?: string;
        action?: AuditAction;
        userId?: string;
        startDate?: Date;
        endDate?: Date;
    }): Observable<AuditLog[]> {
        let logs = this.localStorageService.getItem<AuditLog[]>(this.STORAGE_KEY) || [];

        if (filters) {
            if (filters.tableName) {
                logs = logs.filter(l => l.table_name === filters.tableName);
            }
            if (filters.recordId) {
                logs = logs.filter(l => l.record_id === filters.recordId);
            }
            if (filters.action) {
                logs = logs.filter(l => l.action === filters.action);
            }
            if (filters.userId) {
                logs = logs.filter(l => l.user_id === filters.userId);
            }
            if (filters.startDate) {
                logs = logs.filter(l => new Date(l.timestamp) >= filters.startDate!);
            }
            if (filters.endDate) {
                logs = logs.filter(l => new Date(l.timestamp) <= filters.endDate!);
            }
        }

        // Sort by timestamp descending
        logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return of(logs).pipe(delay(300));
    }

    /**
     * Export audit logs (Requirement 12.7)
     */
    export(format: 'json' | 'csv', filters?: any): Observable<Blob> {
        return this.query(filters).pipe(
            delay(300),
            map((logs: AuditLog[]) => {
                if (format === 'csv') {
                    const csv = this.convertToCSV(logs);
                    return new Blob([csv], { type: 'text/csv' });
                } else {
                    const json = JSON.stringify(logs, null, 2);
                    return new Blob([json], { type: 'application/json' });
                }
            })
        );
    }

    /**
     * Get audit trail for specific record
     */
    getRecordHistory(tableName: string, recordId: string): Observable<AuditLog[]> {
        return this.query({ tableName, recordId });
    }

    /**
     * Query logs with filters
     */
    queryLogs(filters: {
        start_date?: Date;
        end_date?: Date;
        user_name?: string;
        action?: string;
        table_name?: string;
    }): Observable<AuditLog[]> {
        return this.query({
            startDate: filters.start_date,
            endDate: filters.end_date,
            tableName: filters.table_name
        });
    }

    /**
     * Export logs to CSV
     */
    exportLogs(filters: {
        start_date?: Date;
        end_date?: Date;
    }): Observable<Blob> {
        return this.query({
            startDate: filters.start_date,
            endDate: filters.end_date
        }).pipe(
            map((logs: AuditLog[]) => {
                const csv = this.convertToCSV(logs);
                return new Blob([csv], { type: 'text/csv' });
            })
        );
    }

    /**
     * Convert logs to CSV
     */
    private convertToCSV(logs: AuditLog[]): string {
        if (logs.length === 0) return '';

        const headers = ['timestamp', 'user_name', 'action', 'table_name', 'record_id', 'old_data', 'new_data'];
        const csvRows = [headers.join(',')];

        logs.forEach(log => {
            const values = headers.map(header => {
                const value = (log as any)[header];
                if (value === null || value === undefined) return '';
                const stringValue = String(value);
                return stringValue.includes(',') ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
            });
            csvRows.push(values.join(','));
        });

        return csvRows.join('\n');
    }
}
