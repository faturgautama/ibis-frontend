/**
 * Alert Models
 * Requirements: 18.1-18.9
 */

export enum AlertType {
    LOW_STOCK = 'LOW_STOCK',
    OUT_OF_STOCK = 'OUT_OF_STOCK',
    EXPIRING_SOON = 'EXPIRING_SOON',
    EXPIRED = 'EXPIRED',
    LICENSE_EXPIRY = 'LICENSE_EXPIRY',
    PENDING_APPROVAL = 'PENDING_APPROVAL',
    SYNC_FAILED = 'SYNC_FAILED',
    CEISA_REJECTED = 'CEISA_REJECTED',
    SYSTEM = 'SYSTEM'
}

export enum AlertSeverity {
    INFO = 'INFO',
    WARNING = 'WARNING',
    CRITICAL = 'CRITICAL'
}

export interface Alert {
    id: string;
    type: AlertType;
    severity: AlertSeverity;
    title: string;
    message: string;
    entity_type?: string;
    entity_id?: string;
    is_read: boolean;
    is_acknowledged: boolean;
    created_at: Date;
    read_at?: Date;
    acknowledged_at?: Date;
    acknowledged_by?: string;
    action_url?: string;
    metadata?: any;
}

export interface NotificationPreferences {
    user_id: string;
    email_enabled: boolean;
    email_address?: string;
    sound_enabled: boolean;
    alert_types: AlertType[];
    severity_threshold: AlertSeverity;
}
