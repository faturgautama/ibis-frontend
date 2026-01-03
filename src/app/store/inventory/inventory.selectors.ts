import { createFeatureSelector, createSelector } from '@ngrx/store';
import { InventoryState } from './inventory.state';
import { ItemType } from '../../features/inventory/models/item.model';

/**
 * Inventory Selectors
 * Provides memoized selectors for accessing inventory state
 */

// Feature selector
export const selectInventoryState = createFeatureSelector<InventoryState>('inventory');

// Basic selectors
export const selectAllItems = createSelector(
    selectInventoryState,
    (state) => state.items
);

export const selectSelectedItem = createSelector(
    selectInventoryState,
    (state) => state.selectedItem
);

export const selectInventoryLoading = createSelector(
    selectInventoryState,
    (state) => state.loading
);

export const selectInventoryError = createSelector(
    selectInventoryState,
    (state) => state.error
);

export const selectInventoryFilters = createSelector(
    selectInventoryState,
    (state) => state.filters
);

// Derived selectors
export const selectFilteredItems = createSelector(
    selectAllItems,
    selectInventoryFilters,
    (items, filters) => {
        let filtered = items;

        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter(
                item =>
                    item.item_code.toLowerCase().includes(query) ||
                    item.item_name.toLowerCase().includes(query) ||
                    item.hs_code.includes(query)
            );
        }

        if (filters.itemType) {
            filtered = filtered.filter(item => item.item_type === filters.itemType);
        }

        if (filters.isHazardous !== undefined) {
            filtered = filtered.filter(item => item.is_hazardous === filters.isHazardous);
        }

        if (filters.active !== undefined) {
            filtered = filtered.filter(item => item.active === filters.active);
        }

        return filtered;
    }
);

export const selectLowStockItems = createSelector(
    selectAllItems,
    (items) => items.filter(item => item.min_stock && item.min_stock > 0)
);

export const selectHazardousItems = createSelector(
    selectAllItems,
    (items) => items.filter(item => item.is_hazardous)
);

export const selectItemsByType = (itemType: ItemType) =>
    createSelector(selectAllItems, (items) => items.filter(item => item.item_type === itemType));

export const selectRawMaterials = createSelector(
    selectAllItems,
    (items) => items.filter(item => item.item_type === ItemType.RAW)
);

export const selectWIPItems = createSelector(
    selectAllItems,
    (items) => items.filter(item => item.item_type === ItemType.WIP)
);

export const selectFinishedGoods = createSelector(
    selectAllItems,
    (items) => items.filter(item => item.item_type === ItemType.FG)
);

export const selectAssets = createSelector(
    selectAllItems,
    (items) => items.filter(item => item.item_type === ItemType.ASSET)
);

export const selectActiveItems = createSelector(
    selectAllItems,
    (items) => items.filter(item => item.active)
);

export const selectInactiveItems = createSelector(
    selectAllItems,
    (items) => items.filter(item => !item.active)
);

export const selectItemById = (id: string) =>
    createSelector(selectAllItems, (items) => items.find(item => item.id === id));

export const selectItemByCode = (code: string) =>
    createSelector(selectAllItems, (items) => items.find(item => item.item_code === code));

export const selectItemsCount = createSelector(
    selectAllItems,
    (items) => items.length
);

export const selectHasItems = createSelector(
    selectItemsCount,
    (count) => count > 0
);
