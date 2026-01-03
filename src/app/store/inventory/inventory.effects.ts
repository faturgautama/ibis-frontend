import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { InventoryActions } from './inventory.actions';
import { InventoryDemoService } from '../../features/inventory/services/inventory-demo.service';
import { InventoryApiService } from '../../features/inventory/services/inventory-api.service';
import { NotificationService } from '../../core/services/notification.service';
import { environment } from '../../../environments/environment';

/**
 * Inventory Effects
 * Handles side effects for inventory actions
 */
@Injectable()
export class InventoryEffects {
    private actions$ = inject(Actions);
    private notificationService = inject(NotificationService);

    // Inject the appropriate service based on environment
    private inventoryService = environment.demoMode
        ? inject(InventoryDemoService)
        : inject(InventoryApiService);

    /**
     * Load all items effect
     */
    loadItems$ = createEffect(() =>
        this.actions$.pipe(
            ofType(InventoryActions.loadItems),
            switchMap(() =>
                this.inventoryService.getAll().pipe(
                    map(items => InventoryActions.loadItemsSuccess({ items })),
                    catchError(error =>
                        of(InventoryActions.loadItemsFailure({ error: error.error?.message || 'Failed to load items' }))
                    )
                )
            )
        )
    );

    /**
     * Load single item effect
     */
    loadItem$ = createEffect(() =>
        this.actions$.pipe(
            ofType(InventoryActions.loadItem),
            switchMap(({ id }) =>
                this.inventoryService.getById(id).pipe(
                    map(item => InventoryActions.loadItemSuccess({ item })),
                    catchError(error =>
                        of(InventoryActions.loadItemFailure({ error: error.error?.message || 'Failed to load item' }))
                    )
                )
            )
        )
    );

    /**
     * Create item effect
     */
    createItem$ = createEffect(() =>
        this.actions$.pipe(
            ofType(InventoryActions.createItem),
            switchMap(({ item }) =>
                this.inventoryService.create(item).pipe(
                    map(createdItem => InventoryActions.createItemSuccess({ item: createdItem })),
                    catchError(error =>
                        of(InventoryActions.createItemFailure({ error: error.error?.message || 'Failed to create item' }))
                    )
                )
            )
        )
    );

    /**
     * Create item success notification
     */
    createItemSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(InventoryActions.createItemSuccess),
                tap(() => this.notificationService.success('Item created successfully'))
            ),
        { dispatch: false }
    );

    /**
     * Update item effect
     */
    updateItem$ = createEffect(() =>
        this.actions$.pipe(
            ofType(InventoryActions.updateItem),
            switchMap(({ id, item }) =>
                this.inventoryService.update(id, item).pipe(
                    map(updatedItem => InventoryActions.updateItemSuccess({ item: updatedItem })),
                    catchError(error =>
                        of(InventoryActions.updateItemFailure({ error: error.error?.message || 'Failed to update item' }))
                    )
                )
            )
        )
    );

    /**
     * Update item success notification
     */
    updateItemSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(InventoryActions.updateItemSuccess),
                tap(() => this.notificationService.success('Item updated successfully'))
            ),
        { dispatch: false }
    );

    /**
     * Delete item effect
     */
    deleteItem$ = createEffect(() =>
        this.actions$.pipe(
            ofType(InventoryActions.deleteItem),
            switchMap(({ id }) =>
                this.inventoryService.delete(id).pipe(
                    map(() => InventoryActions.deleteItemSuccess({ id })),
                    catchError(error =>
                        of(InventoryActions.deleteItemFailure({ error: error.error?.message || 'Failed to delete item' }))
                    )
                )
            )
        )
    );

    /**
     * Delete item success notification
     */
    deleteItemSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(InventoryActions.deleteItemSuccess),
                tap(() => this.notificationService.success('Item deleted successfully'))
            ),
        { dispatch: false }
    );

    /**
     * Load low stock items effect
     */
    loadLowStockItems$ = createEffect(() =>
        this.actions$.pipe(
            ofType(InventoryActions.loadLowStockItems),
            switchMap(() =>
                this.inventoryService.getLowStockItems().pipe(
                    map(items => InventoryActions.loadLowStockItemsSuccess({ items })),
                    catchError(error =>
                        of(InventoryActions.loadLowStockItemsFailure({ error: error.error?.message || 'Failed to load low stock items' }))
                    )
                )
            )
        )
    );

    /**
     * Load expiring items effect
     */
    loadExpiringItems$ = createEffect(() =>
        this.actions$.pipe(
            ofType(InventoryActions.loadExpiringItems),
            switchMap(({ days }) =>
                this.inventoryService.getExpiringItems(days).pipe(
                    map(items => InventoryActions.loadExpiringItemsSuccess({ items })),
                    catchError(error =>
                        of(InventoryActions.loadExpiringItemsFailure({ error: error.error?.message || 'Failed to load expiring items' }))
                    )
                )
            )
        )
    );

    /**
     * Error notification effect
     */
    errorNotification$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(
                    InventoryActions.loadItemsFailure,
                    InventoryActions.loadItemFailure,
                    InventoryActions.createItemFailure,
                    InventoryActions.updateItemFailure,
                    InventoryActions.deleteItemFailure,
                    InventoryActions.loadLowStockItemsFailure,
                    InventoryActions.loadExpiringItemsFailure
                ),
                tap(({ error }) => this.notificationService.error(error))
            ),
        { dispatch: false }
    );
}
