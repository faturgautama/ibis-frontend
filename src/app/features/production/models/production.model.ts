/**
 * Production Models
 * Requirements: 9.2, 9.10
 */

export enum WOStatus {
    PLANNED = 'PLANNED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export interface ProductionOrder {
    id: string;
    wo_number: string;
    wo_date: Date;
    status: WOStatus;

    // Output item (Finished Goods)
    output_item_id: string;
    output_item_code: string;
    output_item_name: string;
    planned_quantity: number;
    actual_quantity: number;
    unit: string;

    // Warehouse
    warehouse_id: string;
    warehouse_code: string;
    warehouse_name: string;

    // Yield and scrap
    yield_percentage: number;
    scrap_quantity: number;
    scrap_reason?: string;

    // Dates
    start_date?: Date;
    completion_date?: Date;

    // IT Inventory sync
    it_inventory_synced: boolean;
    it_inventory_sync_date?: Date;

    // Audit
    created_at: Date;
    created_by: string;
    updated_at?: Date;
    updated_by?: string;

    notes?: string;
}

export interface ProductionMaterial {
    id: string;
    production_order_id: string;

    // Material item (Raw Material)
    material_item_id: string;
    material_item_code: string;
    material_item_name: string;

    // Quantities
    required_quantity: number;
    consumed_quantity: number;
    unit: string;

    // Batch
    batch_number?: string;

    // Warehouse
    warehouse_id: string;
    warehouse_code: string;
    warehouse_name: string;
}

export function getWOStatusLabel(status: WOStatus): string {
    const labels: Record<WOStatus, string> = {
        [WOStatus.PLANNED]: 'Planned',
        [WOStatus.IN_PROGRESS]: 'In Progress',
        [WOStatus.COMPLETED]: 'Completed',
        [WOStatus.CANCELLED]: 'Cancelled'
    };
    return labels[status];
}

export function calculateYieldPercentage(planned: number, actual: number): number {
    if (planned === 0) return 0;
    return (actual / planned) * 100;
}
