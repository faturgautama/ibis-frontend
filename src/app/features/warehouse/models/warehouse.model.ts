/**
 * Warehouse Model
 * 
 * Represents a warehouse/storage location in the KEK system
 */

export interface Warehouse {
    id: string;
    warehouse_code: string;
    warehouse_name: string;
    location: string;
    warehouse_type: WarehouseType;
    capacity?: number;
    current_utilization?: number;
    manager_id?: string;
    address?: string;
    phone?: string;
    is_bonded: boolean;
    license_number?: string;
    license_expiry?: Date;
    active: boolean;
    created_at: Date;
    updated_at: Date;
}

export enum WarehouseType {
    RAW_MATERIAL = 'RAW_MATERIAL',
    WIP = 'WIP',
    FINISHED_GOODS = 'FINISHED_GOODS',
    QUARANTINE = 'QUARANTINE'
}
