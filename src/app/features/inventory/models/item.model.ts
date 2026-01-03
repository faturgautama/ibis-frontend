/**
 * Item Type Enum
 * Defines the types of items in the inventory system
 */
export enum ItemType {
    RAW = 'RAW',     // Raw Material
    WIP = 'WIP',     // Work In Progress
    FG = 'FG',       // Finished Goods
    ASSET = 'ASSET'  // Asset
}

/**
 * Facility Status Enum
 * Indicates whether an item is under facility (bonded) or non-facility status
 */
export enum FacilityStatus {
    FASILITAS = 'FASILITAS',  // Under facility/bonded
    NON = 'NON'                // Non-facility
}

/**
 * Item Interface
 * Represents an inventory item with all required and optional fields
 */
export interface Item {
    // Required fields
    id: string;
    item_code: string;
    item_name: string;
    hs_code: string;              // 10-digit Harmonized System Code
    item_type: ItemType;
    unit: string;                 // e.g., pcs, kg, m, liter, box
    is_hazardous: boolean;
    facility_status: FacilityStatus;
    active: boolean;
    created_at: Date;
    updated_at: Date;

    // Optional fields
    description?: string;
    category_id?: string;
    brand?: string;
    min_stock?: number;           // Minimum stock level for alerts
    max_stock?: number;           // Maximum stock level
    reorder_point?: number;       // Reorder point for procurement
    lead_time_days?: number;      // Lead time in days
    price?: number;               // Unit price
    currency?: string;            // Currency code (e.g., IDR, USD)
    image_url?: string;           // URL to item image
    barcode?: string;             // Barcode for scanning
    rfid_tag?: string;            // RFID tag for tracking
    shelf_life_days?: number;     // Shelf life in days
    storage_condition?: string;   // Storage requirements
}

/**
 * Item Creation DTO
 * Used when creating a new item (without id and timestamps)
 */
export interface CreateItemDto {
    item_code: string;
    item_name: string;
    hs_code: string;
    item_type: ItemType;
    unit: string;
    is_hazardous: boolean;
    facility_status: FacilityStatus;
    active: boolean;
    description?: string;
    category_id?: string;
    brand?: string;
    min_stock?: number;
    max_stock?: number;
    reorder_point?: number;
    lead_time_days?: number;
    price?: number;
    currency?: string;
    image_url?: string;
    barcode?: string;
    rfid_tag?: string;
    shelf_life_days?: number;
    storage_condition?: string;
}

/**
 * Item Update DTO
 * Used when updating an existing item (all fields optional except those that shouldn't change)
 */
export interface UpdateItemDto {
    item_name?: string;
    hs_code?: string;
    item_type?: ItemType;
    unit?: string;
    is_hazardous?: boolean;
    facility_status?: FacilityStatus;
    active?: boolean;
    description?: string;
    category_id?: string;
    brand?: string;
    min_stock?: number;
    max_stock?: number;
    reorder_point?: number;
    lead_time_days?: number;
    price?: number;
    currency?: string;
    image_url?: string;
    barcode?: string;
    rfid_tag?: string;
    shelf_life_days?: number;
    storage_condition?: string;
}
