import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';
import { StockMutation } from '../models/stock-mutation.model';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { StockBalanceService } from '../../stock-balance/services/stock-balance.service';
import { StockMovementType, StockReferenceType } from '../../stock-balance/models/stock-balance.model';

/**
 * Stock Mutation Service
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */
@Injectable({
    providedIn: 'root'
})
export class StockMutationService {
    private localStorageService = inject(LocalStorageService);
    private stockBalanceService = inject(StockBalanceService);
    private readonly STORAGE_KEY = 'stock_mutations';

    constructor() {
        this.initializeDemoData();
    }

    private initializeDemoData(): void {
        const existing = this.localStorageService.getItem<StockMutation[]>(this.STORAGE_KEY);
        if (!existing || existing.length === 0) {
            const demoMutations: StockMutation[] = [
                {
                    id: '1',
                    mutation_number: 'MUT-2024-001',
                    mutation_date: new Date('2024-01-20'),
                    item_id: '1',
                    item_code: 'RM-001',
                    item_name: 'Raw Material A',
                    from_warehouse_id: '1',
                    from_warehouse_code: 'WH-RM',
                    from_warehouse_name: 'Raw Material Warehouse',
                    to_warehouse_id: '2',
                    to_warehouse_code: 'WH-WIP',
                    to_warehouse_name: 'WIP Warehouse',
                    quantity: 100,
                    unit: 'KG',
                    reason: 'Transfer for production',
                    created_at: new Date('2024-01-20'),
                    created_by: 'admin'
                }
            ];
            this.localStorageService.setItem(this.STORAGE_KEY, demoMutations);
        }
    }

    getAll(): Observable<StockMutation[]> {
        const mutations = this.localStorageService.getItem<StockMutation[]>(this.STORAGE_KEY) || [];
        return of(mutations).pipe(delay(300));
    }

    getById(id: string): Observable<StockMutation> {
        const mutations = this.localStorageService.getItem<StockMutation[]>(this.STORAGE_KEY) || [];
        const mutation = mutations.find(m => m.id === id);
        if (!mutation) {
            return throwError(() => ({ error: { message: 'Mutation not found' } }));
        }
        return of(mutation).pipe(delay(300));
    }

    /**
     * Create mutation with validation
     * Requirements: 8.2, 8.3, 8.4, 8.5
     */
    create(mutation: Partial<StockMutation>): Observable<StockMutation> {
        // Validation
        if (!mutation.item_id || !mutation.from_warehouse_id || !mutation.to_warehouse_id || !mutation.quantity || !mutation.reason) {
            return throwError(() => ({ error: { message: 'Required fields missing' } }));
        }

        // Same warehouse prevention (Requirement 8.5)
        if (mutation.from_warehouse_id === mutation.to_warehouse_id) {
            return throwError(() => ({ error: { message: 'Cannot transfer to the same warehouse' } }));
        }

        // Check sufficient stock (Requirement 8.3)
        return this.stockBalanceService.getBalance(mutation.item_id, mutation.from_warehouse_id).pipe(
            switchMap(balance => {
                if (!balance || balance.available_quantity < (mutation.quantity || 0)) {
                    return throwError(() => ({ error: { message: 'Insufficient stock' } }));
                }

                const mutations = this.localStorageService.getItem<StockMutation[]>(this.STORAGE_KEY) || [];

                const newMutation: StockMutation = {
                    id: Date.now().toString(),
                    mutation_number: mutation.mutation_number || `MUT-${Date.now()}`,
                    mutation_date: new Date(mutation.mutation_date || new Date()),
                    item_id: mutation.item_id!,
                    item_code: mutation.item_code || '',
                    item_name: mutation.item_name || '',
                    from_warehouse_id: mutation.from_warehouse_id!,
                    from_warehouse_code: mutation.from_warehouse_code || '',
                    from_warehouse_name: mutation.from_warehouse_name || '',
                    to_warehouse_id: mutation.to_warehouse_id!,
                    to_warehouse_code: mutation.to_warehouse_code || '',
                    to_warehouse_name: mutation.to_warehouse_name || '',
                    quantity: mutation.quantity!,
                    unit: mutation.unit || '',
                    reason: mutation.reason!,
                    created_at: new Date(),
                    created_by: mutation.created_by || 'system',
                    notes: mutation.notes
                };

                mutations.push(newMutation);
                this.localStorageService.setItem(this.STORAGE_KEY, mutations);

                // Update stock balances (Requirement 8.4)
                // Decrease from source warehouse
                this.stockBalanceService.updateBalance(
                    newMutation.item_id,
                    newMutation.from_warehouse_id,
                    -newMutation.quantity,
                    StockMovementType.TRANSFER_OUT,
                    newMutation.mutation_number,
                    StockReferenceType.STOCK_TRANSFER,
                    balance.unit_cost,
                    undefined,
                    newMutation.created_by
                ).subscribe();

                // Increase in destination warehouse
                this.stockBalanceService.updateBalance(
                    newMutation.item_id,
                    newMutation.to_warehouse_id,
                    newMutation.quantity,
                    StockMovementType.TRANSFER_IN,
                    newMutation.mutation_number,
                    StockReferenceType.STOCK_TRANSFER,
                    balance.unit_cost,
                    undefined,
                    newMutation.created_by
                ).subscribe();

                return of(newMutation).pipe(delay(300));
            })
        );
    }

    delete(id: string): Observable<void> {
        const mutations = this.localStorageService.getItem<StockMutation[]>(this.STORAGE_KEY) || [];
        const filtered = mutations.filter(m => m.id !== id);
        this.localStorageService.setItem(this.STORAGE_KEY, filtered);
        return of(void 0).pipe(delay(300));
    }

    /**
     * Create mutation (simplified method for form)
     */
    createMutation(
        itemId: string,
        fromWarehouseId: string,
        toWarehouseId: string,
        quantity: number,
        reason: string,
        userId: string
    ): Observable<StockMutation> {
        return this.create({
            item_id: itemId,
            from_warehouse_id: fromWarehouseId,
            to_warehouse_id: toWarehouseId,
            quantity: quantity,
            reason: reason,
            created_by: userId
        });
    }
}
