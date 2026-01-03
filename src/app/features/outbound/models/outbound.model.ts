/**
 * Outbound Models
 * Requirements: 10.2, 10.7
 */

export enum OutboundStatus {
    PENDING = 'PENDING',
    PREPARED = 'PREPARED',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED'
}

export enum OutboundType {
    EXPORT = 'EXPORT',
    LOCAL = 'LOCAL',
    RETURN = 'RETURN',
    SAMPLE = 'SAMPLE'
}

export interface OutboundHeader {
    id: string;
    outbound_number: string;
    outbound_date: Date;
    status: OutboundStatus;
    outbound_type: OutboundType;

    // BC Document reference
    bc_document_id: string;
    bc_document_number: string;

    // Customer info
    customer_id: string;
    customer_code: string;
    customer_name: string;

    // Warehouse
    warehouse_id: string;
    warehouse_code: string;
    warehouse_name: string;

    // Delivery info
    delivery_number?: string;
    delivery_date?: Date;
    vehicle_number?: string;
    driver_name?: string;

    // Totals
    total_items: number;
    total_quantity: number;
    total_value: number;

    // IT Inventory sync
    it_inventory_synced: boolean;
    it_inventory_sync_date?: Date;
    it_inventory_sync_status?: string;

    // Audit
    created_at: Date;
    created_by: string;
    updated_at?: Date;
    updated_by?: string;

    notes?: string;
}

export interface OutboundDetail {
    id: string;
    outbound_header_id: string;
    line_number: number;

    // Item info
    item_id: string;
    item_code: string;
    item_name: string;
    hs_code: string;

    // Quantities
    ordered_quantity: number;
    shipped_quantity: number;

    // Unit
    unit: string;

    // Cost
    unit_price: number;
    total_price: number;

    // Batch/Lot
    batch_number?: string;
    lot_number?: string;
    serial_numbers?: string[];

    // Location
    location_code?: string;

    notes?: string;
}

export function getOutboundStatusLabel(status: OutboundStatus): string {
    const labels: Record<OutboundStatus, string> = {
        [OutboundStatus.PENDING]: 'Pending',
        [OutboundStatus.PREPARED]: 'Prepared',
        [OutboundStatus.SHIPPED]: 'Shipped',
        [OutboundStatus.DELIVERED]: 'Delivered'
    };
    return labels[status];
}

export function getOutboundTypeLabel(type: OutboundType): string {
    const labels: Record<OutboundType, string> = {
        [OutboundType.EXPORT]: 'Export',
        [OutboundType.LOCAL]: 'Local',
        [OutboundType.RETURN]: 'Return',
        [OutboundType.SAMPLE]: 'Sample'
    };
    return labels[type];
}
