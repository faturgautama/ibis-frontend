import { createReducer, on } from '@ngrx/store';
import { InventoryActions } from './inventory.actions';
import { InventoryState, initialInventoryState } from './inventory.state';

/**
 * Inventory Reducer
 * Handles state changes for inventory management
 */
export const inventoryReducer = createReducer(
    initialInventoryState,

    // Load Items
    on(InventoryActions.loadItems, (state): InventoryState => ({
        ...state,
        loading: true,
        error: null
    })),
    on(InventoryActions.loadItemsSuccess, (state, { items }): InventoryState => ({
        ...state,
        items,
        loading: false,
        error: null
    })),
    on(InventoryActions.loadItemsFailure, (state, { error }): InventoryState => ({
        ...state,
        loading: false,
        error
    })),

    // Load Single Item
    on(InventoryActions.loadItem, (state): InventoryState => ({
        ...state,
        loading: true,
        error: null
    })),
    on(InventoryActions.loadItemSuccess, (state, { item }): InventoryState => ({
        ...state,
        selectedItem: item,
        loading: false,
        error: null
    })),
    on(InventoryActions.loadItemFailure, (state, { error }): InventoryState => ({
        ...state,
        loading: false,
        error
    })),

    // Create Item
    on(InventoryActions.createItem, (state): InventoryState => {
        console.log('Reducer: createItem action received');
        return {
            ...state,
            loading: true,
            error: null
        };
    }),
    on(InventoryActions.createItemSuccess, (state, { item }): InventoryState => {
        console.log('Reducer: createItemSuccess action received', item);
        console.log('Current items count:', state.items.length);
        const newState = {
            ...state,
            items: [...state.items, item],
            loading: false,
            error: null
        };
        console.log('New items count:', newState.items.length);
        return newState;
    }),
    on(InventoryActions.createItemFailure, (state, { error }): InventoryState => {
        console.log('Reducer: createItemFailure action received', error);
        return {
            ...state,
            loading: false,
            error
        };
    }),

    // Update Item
    on(InventoryActions.updateItem, (state): InventoryState => ({
        ...state,
        loading: true,
        error: null
    })),
    on(InventoryActions.updateItemSuccess, (state, { item }): InventoryState => ({
        ...state,
        items: state.items.map(i => i.id === item.id ? item : i),
        selectedItem: state.selectedItem?.id === item.id ? item : state.selectedItem,
        loading: false,
        error: null
    })),
    on(InventoryActions.updateItemFailure, (state, { error }): InventoryState => ({
        ...state,
        loading: false,
        error
    })),

    // Delete Item
    on(InventoryActions.deleteItem, (state): InventoryState => ({
        ...state,
        loading: true,
        error: null
    })),
    on(InventoryActions.deleteItemSuccess, (state, { id }): InventoryState => ({
        ...state,
        items: state.items.filter(i => i.id !== id),
        selectedItem: state.selectedItem?.id === id ? null : state.selectedItem,
        loading: false,
        error: null
    })),
    on(InventoryActions.deleteItemFailure, (state, { error }): InventoryState => ({
        ...state,
        loading: false,
        error
    })),

    // Load Low Stock Items
    on(InventoryActions.loadLowStockItems, (state): InventoryState => ({
        ...state,
        loading: true,
        error: null
    })),
    on(InventoryActions.loadLowStockItemsSuccess, (state, { items }): InventoryState => ({
        ...state,
        items,
        loading: false,
        error: null
    })),
    on(InventoryActions.loadLowStockItemsFailure, (state, { error }): InventoryState => ({
        ...state,
        loading: false,
        error
    })),

    // Load Expiring Items
    on(InventoryActions.loadExpiringItems, (state): InventoryState => ({
        ...state,
        loading: true,
        error: null
    })),
    on(InventoryActions.loadExpiringItemsSuccess, (state, { items }): InventoryState => ({
        ...state,
        items,
        loading: false,
        error: null
    })),
    on(InventoryActions.loadExpiringItemsFailure, (state, { error }): InventoryState => ({
        ...state,
        loading: false,
        error
    })),

    // Select Item
    on(InventoryActions.selectItem, (state, { item }): InventoryState => ({
        ...state,
        selectedItem: item
    })),

    // Set Filters
    on(InventoryActions.setFilters, (state, { filters }): InventoryState => ({
        ...state,
        filters: { ...state.filters, ...filters }
    })),
    on(InventoryActions.clearFilters, (state): InventoryState => ({
        ...state,
        filters: {}
    })),

    // Clear Error
    on(InventoryActions.clearError, (state): InventoryState => ({
        ...state,
        error: null
    }))
);
