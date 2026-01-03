import { Item } from '../../features/inventory/models/item.model';

/**
 * Inventory State Interface
 * Defines the shape of the inventory state in the NgRx store
 */
export interface InventoryState {
    items: Item[];
    selectedItem: Item | null;
    loading: boolean;
    error: string | null;
    filters: InventoryFilters;
}

/**
 * Inventory Filters Interface
 * Defines available filters for inventory items
 */
export interface InventoryFilters {
    searchQuery?: string;
    itemType?: string;
    warehouseId?: string;
    isHazardous?: boolean;
    active?: boolean;
}

/**
 * Initial Inventory State
 */
export const initialInventoryState: InventoryState = {
    items: [],
    selectedItem: null,
    loading: false,
    error: null,
    filters: {}
};
