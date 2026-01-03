/**
 * Stock Opname Models
 * Requirements: 11.2, 11.6
 */

export enum OpnameType {
    PERIODIC = 'PERIODIC',
    SPOT_CHECK = 'SPOT_CHECK',
    YEAR_END = 'YEAR_END'
}

export interface StockOpname {
    id: string;
    opname_number: string;
    opname_date: Date;
    opname_type: OpnameType;
    warehouse_id: string;
    warehouse_code: string;
    warehouse_name: string;
    status: 'DRAFT' | 'APPROVED' | 'COMPLETED';
    approved_by?: string;
    approved_date?: Date;
    created_at: Date;
    created_by: string;
    notes?: string;
}

export interface StockOpnameDetail {
    id: string;
    opname_id: string;
    item_id: string;
    item_code: string;
    item_name: string;
    system_quantity: number;
    physical_quantity: number;
    difference: number;
    unit: string;
    adjustment_reason?: string;
    batch_number?: string;
}

export function calculateDifference(system: number, physical: number): number {
    return physical - system;
}
