/**
 * Audit Log Models
 * Requirements: 12.1, 12.2
 */

export enum AuditAction {
    INSERT = 'INSERT',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE'
}

export interface AuditLog {
    id: string;
    table_name: string;
    record_id: string;
    action: AuditAction;
    old_data?: any;
    new_data?: any;
    changed_fields?: string[];
    user_id: string;
    user_name: string;
    timestamp: Date;
    ip_address?: string;
    user_agent?: string;
}

export function getAuditActionLabel(action: AuditAction): string {
    const labels: Record<AuditAction, string> = {
        [AuditAction.INSERT]: 'Created',
        [AuditAction.UPDATE]: 'Updated',
        [AuditAction.DELETE]: 'Deleted'
    };
    return labels[action];
}
