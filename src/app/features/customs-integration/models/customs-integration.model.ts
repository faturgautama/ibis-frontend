/**
 * Customs Integration Models
 * Requirements: 14.1, 14.7, 15.3
 */

export interface SyncResponse {
    success: boolean;
    sync_id: string;
    timestamp: Date;
    records_synced: number;
    errors?: string[];
    message?: string;
}

export interface CEISAResponse {
    success: boolean;
    ceisa_reference: string;
    submission_date: Date;
    status: CEISAStatusType;
    message?: string;
    errors?: string[];
}

export enum CEISAStatusType {
    PENDING = 'PENDING',
    SUBMITTED = 'SUBMITTED',
    PROCESSING = 'PROCESSING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    FAILED = 'FAILED'
}

export interface CEISAStatus {
    ceisa_reference: string;
    document_number: string;
    document_type: string;
    status: CEISAStatusType;
    submission_date: Date;
    last_updated: Date;
    approval_date?: Date;
    rejection_reason?: string;
    response_data?: any;
}

export interface SyncQueue {
    id: string;
    sync_type: SyncType;
    entity_type: EntityType;
    entity_id: string;
    entity_data: any;
    priority: SyncPriority;
    status: SyncStatus;
    retry_count: number;
    max_retries: number;
    last_attempt?: Date;
    next_retry?: Date;
    error_message?: string;
    created_at: Date;
    created_by: string;
}

export enum SyncType {
    IT_INVENTORY = 'IT_INVENTORY',
    CEISA = 'CEISA'
}

export enum EntityType {
    INBOUND = 'INBOUND',
    OUTBOUND = 'OUTBOUND',
    PRODUCTION = 'PRODUCTION',
    STOCK_MUTATION = 'STOCK_MUTATION',
    BC_DOCUMENT = 'BC_DOCUMENT'
}

export enum SyncPriority {
    LOW = 'LOW',
    NORMAL = 'NORMAL',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL'
}

export enum SyncStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED'
}

export interface ITInventoryPayload {
    transaction_type: string;
    transaction_number: string;
    transaction_date: Date;
    warehouse_code: string;
    items: ITInventoryItem[];
    bc_document_number?: string;
    notes?: string;
}

export interface ITInventoryItem {
    item_code: string;
    item_name: string;
    hs_code: string;
    quantity: number;
    unit: string;
    unit_price: number;
    total_value: number;
    batch_number?: string;
}
