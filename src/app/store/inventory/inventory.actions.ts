import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Item, CreateItemDto, UpdateItemDto } from '../../features/inventory/models/item.model';
import { InventoryFilters } from './inventory.state';

/**
 * Inventory Actions
 * Defines all actions for inventory management
 */
export const InventoryActions = createActionGroup({
    source: 'Inventory',
    events: {
        // Load Items
        'Load Items': emptyProps(),
        'Load Items Success': props<{ items: Item[] }>(),
        'Load Items Failure': props<{ error: string }>(),

        // Load Single Item
        'Load Item': props<{ id: string }>(),
        'Load Item Success': props<{ item: Item }>(),
        'Load Item Failure': props<{ error: string }>(),

        // Create Item
        'Create Item': props<{ item: CreateItemDto }>(),
        'Create Item Success': props<{ item: Item }>(),
        'Create Item Failure': props<{ error: string }>(),

        // Update Item
        'Update Item': props<{ id: string; item: UpdateItemDto }>(),
        'Update Item Success': props<{ item: Item }>(),
        'Update Item Failure': props<{ error: string }>(),

        // Delete Item
        'Delete Item': props<{ id: string }>(),
        'Delete Item Success': props<{ id: string }>(),
        'Delete Item Failure': props<{ error: string }>(),

        // Load Low Stock Items
        'Load Low Stock Items': emptyProps(),
        'Load Low Stock Items Success': props<{ items: Item[] }>(),
        'Load Low Stock Items Failure': props<{ error: string }>(),

        // Load Expiring Items
        'Load Expiring Items': props<{ days?: number }>(),
        'Load Expiring Items Success': props<{ items: Item[] }>(),
        'Load Expiring Items Failure': props<{ error: string }>(),

        // Select Item
        'Select Item': props<{ item: Item | null }>(),

        // Set Filters
        'Set Filters': props<{ filters: InventoryFilters }>(),
        'Clear Filters': emptyProps(),

        // Clear Error
        'Clear Error': emptyProps()
    }
});
