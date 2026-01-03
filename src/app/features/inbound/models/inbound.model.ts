/**
 * Inbound Models and Enums
 * Requirements: 6.4, 6.7
 */

/**
 * Inbound Status Enum
 */
export enum InboundStatus {
    PENDING = 'PENDING',
    RECEIVED = 'RECEIVED',
    QUALITY_CHECK = 'QUALITY_CHECK',
    COMPLETED = 'COMPLETED'
}

/**
 * Quality Status Enum
 */
export enum QualityStatus {
    PASS = 'PASS',
    FAIL = 'FAIL',
    QUARANTINE = 'QUARANTINE'
}

/**
 * Inbound Header Interface
 */
export interface InboundHeader {
    id: string;
    inbound_number: string;
    inbound_date: Date;
    status: InboundStatus;

    // BC Document reference
    bc_document_id: string;
    bc_document_number: string;

    // Supplier info
    supplier_id: string;
    supplier_code: string;
    supplier_name: string;

    // Warehouse
    warehouse_id: string;
    warehouse_code: string;
    warehouse_name: string;

    // Receipt info
    receipt_number?: string;
    receipt_date?: Date;

    // Vehicle info
    vehicle_number?: string;
    driver_name?: string;

    // Totals
    total_items: number;
    total_quantity: number;
    total_value: number;

    // Quality inspection
    quality_inspector?: string;
    quality_inspection_date?: Date;
    quality_notes?: string;

    // IT Inventory sync
    it_inventory_synced: boolean;
    it_inventory_sync_date?: Date;
    it_inventory_sync_status?: string;
    it_inventory_response?: string;

    // Audit fields
    created_at: Date;
    created_by: string;
    updated_at?: Date;
    updated_by?: string;

    // Notes
    notes?: string;
}

/**
 * Inbound Detail Interface
 */
export interface InboundDetail {
    id: string;
    inbound_header_id: string;
    line_number: number;

    // Item info
    item_id: string;
    item_code: string;
    item_name: string;
    hs_code: string;

    // Quantities
    ordered_quantity: number;
    received_quantity: number;
    accepted_quantity: number;
    rejected_quantity: number;

    // Unit
    unit: string;

    // Cost
    unit_cost: number;
    total_cost: number;

    // Batch/Lot tracking
    batch_number?: string;
    lot_number?: string;
    serial_numbers?: string[];

    // Expiry
    manufacturing_date?: Date;
    expiry_date?: Date;

    // Quality
    quality_status: QualityStatus;
    quality_notes?: string;

    // Warehouse location
    location_code?: string;
    bin_location?: string;

    // RFID
    rfid_tags?: string[];

    // Quarantine
    quarantine_warehouse_id?: string;
    quarantine_reason?: string;

    // Notes
    notes?: string;
}

/**
 * Helper function to get inbound status label
 */
export function getInboundStatusLabel(status: InboundStatus): string {
    const labels: Record<InboundStatus, string> = {
        [InboundStatus.PENDING]: 'Pending',
        [InboundStatus.RECEIVED]: 'Received',
        [InboundStatus.QUALITY_CHECK]: 'Quality Check',
        [InboundStatus.COMPLETED]: 'Completed'
    };
    return labels[status];
}

/**
 * Helper function to get quality status label
 */
export function getQualityStatusLabel(status: QualityStatus): string {
    const labels: Record<QualityStatus, string> = {
        [QualityStatus.PASS]: 'Pass',
        [QualityStatus.FAIL]: 'Fail',
        [QualityStatus.QUARANTINE]: 'Quarantine'
    };
    return labels[status];
}

/**
 * Helper function to get status color
 */
export function getInboundStatusColor(status: InboundStatus): string {
    const colors: Record<InboundStatus, string> = {
        [InboundStatus.PENDING]: 'gray',
        [InboundStatus.RECEIVED]: 'blue',
        [InboundStatus.QUALITY_CHECK]: 'orange',
        [InboundStatus.COMPLETED]: 'green'
    };
    return colors[status];
}

/**
 * Helper function to get quality status color
 */
export function getQualityStatusColor(status: QualityStatus): string {
    const colors: Record<QualityStatus, string> = {
        [QualityStatus.PASS]: 'green',
        [QualityStatus.FAIL]: 'red',
        [QualityStatus.QUARANTINE]: 'orange'
    };
    return colors[status];
}

/**
 * Helper function to validate HS Code format
 */
export function validateHSCode(hsCode: string): boolean {
    // HS Code format: XXXX.XX.XX (10 digits with dots)
    const hsCodePattern = /^\d{4}\.\d{2}\.\d{2}$/;
    return hsCodePattern.test(hsCode);
}

/**
 * Helper function to calculate acceptance rate
 */
export function calculateAcceptanceRate(detail: InboundDetail): number {
    if (detail.received_quantity === 0) return 0;
    return (detail.accepted_quantity / detail.received_quantity) * 100;
}
