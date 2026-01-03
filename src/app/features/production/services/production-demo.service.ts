import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ProductionOrder, ProductionMaterial, WOStatus, calculateYieldPercentage } from '../models/production.model';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { StockBalanceService } from '../../stock-balance/services/stock-balance.service';
import { StockMovementType, StockReferenceType } from '../../stock-balance/models/stock-balance.model';

/**
 * Production Demo Service
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.8, 9.9
 */
@Injectable({
    providedIn: 'root'
})
export class ProductionDemoService {
    private localStorageService = inject(LocalStorageService);
    private stockBalanceService = inject(StockBalanceService);
    private readonly ORDER_KEY = 'production_orders';
    private readonly MATERIAL_KEY = 'production_materials';

    constructor() {
        this.initializeDemoData();
    }

    private initializeDemoData(): void {
        const existing = this.localStorageService.getItem<ProductionOrder[]>(this.ORDER_KEY);
        if (!existing || existing.length === 0) {
            const demoOrders: ProductionOrder[] = [
                {
                    id: '1',
                    wo_number: 'WO-2024-001',
                    wo_date: new Date('2024-01-20'),
                    status: WOStatus.COMPLETED,
                    output_item_id: '3',
                    output_item_code: 'FG-001',
                    output_item_name: 'Finished Product A',
                    planned_quantity: 100,
                    actual_quantity: 98,
                    unit: 'PCS',
                    warehouse_id: '3',
                    warehouse_code: 'WH-FG',
                    warehouse_name: 'Finished Goods Warehouse',
                    yield_percentage: 98,
                    scrap_quantity: 2,
                    scrap_reason: 'Quality defects',
                    start_date: new Date('2024-01-20'),
                    completion_date: new Date('2024-01-21'),
                    it_inventory_synced: true,
                    it_inventory_sync_date: new Date('2024-01-21'),
                    created_at: new Date('2024-01-20'),
                    created_by: 'admin'
                }
            ];
            this.localStorageService.setItem(this.ORDER_KEY, demoOrders);

            const demoMaterials: ProductionMaterial[] = [
                {
                    id: '1',
                    production_order_id: '1',
                    material_item_id: '1',
                    material_item_code: 'RM-001',
                    material_item_name: 'Raw Material A',
                    required_quantity: 200,
                    consumed_quantity: 200,
                    unit: 'KG',
                    batch_number: 'BATCH-2024-001',
                    warehouse_id: '1',
                    warehouse_code: 'WH-RM',
                    warehouse_name: 'Raw Material Warehouse'
                }
            ];
            this.localStorageService.setItem(this.MATERIAL_KEY, demoMaterials);
        }
    }

    getAll(): Observable<ProductionOrder[]> {
        const orders = this.localStorageService.getItem<ProductionOrder[]>(this.ORDER_KEY) || [];
        return of(orders).pipe(delay(300));
    }

    getById(id: string): Observable<ProductionOrder> {
        const orders = this.localStorageService.getItem<ProductionOrder[]>(this.ORDER_KEY) || [];
        const order = orders.find(o => o.id === id);
        if (!order) {
            return throwError(() => ({ error: { message: 'Production order not found' } }));
        }
        return of(order).pipe(delay(300));
    }

    /**
     * Create work order with validation
     * Requirements: 9.2, 9.3, 9.4, 9.5
     */
    create(order: Partial<ProductionOrder>, materials: Partial<ProductionMaterial>[]): Observable<ProductionOrder> {
        // Validation
        if (!order.output_item_id || !order.planned_quantity || !order.warehouse_id) {
            return throwError(() => ({ error: { message: 'Required fields missing' } }));
        }

        // Requirement 9.6: Must produce finished goods
        // This would be validated by checking item type in real implementation

        const orders = this.localStorageService.getItem<ProductionOrder[]>(this.ORDER_KEY) || [];
        const existingMaterials = this.localStorageService.getItem<ProductionMaterial[]>(this.MATERIAL_KEY) || [];

        const newOrder: ProductionOrder = {
            id: Date.now().toString(),
            wo_number: order.wo_number || `WO-${Date.now()}`,
            wo_date: new Date(order.wo_date || new Date()),
            status: WOStatus.PLANNED,
            output_item_id: order.output_item_id,
            output_item_code: order.output_item_code || '',
            output_item_name: order.output_item_name || '',
            planned_quantity: order.planned_quantity,
            actual_quantity: 0,
            unit: order.unit || '',
            warehouse_id: order.warehouse_id,
            warehouse_code: order.warehouse_code || '',
            warehouse_name: order.warehouse_name || '',
            yield_percentage: 0,
            scrap_quantity: 0,
            it_inventory_synced: false,
            created_at: new Date(),
            created_by: order.created_by || 'system',
            notes: order.notes
        };

        orders.push(newOrder);
        this.localStorageService.setItem(this.ORDER_KEY, orders);

        // Save materials
        materials.forEach(material => {
            const newMaterial: ProductionMaterial = {
                id: `${newOrder.id}-${Date.now()}`,
                production_order_id: newOrder.id,
                material_item_id: material.material_item_id!,
                material_item_code: material.material_item_code!,
                material_item_name: material.material_item_name!,
                required_quantity: material.required_quantity!,
                consumed_quantity: 0,
                unit: material.unit!,
                batch_number: material.batch_number,
                warehouse_id: material.warehouse_id!,
                warehouse_code: material.warehouse_code!,
                warehouse_name: material.warehouse_name!
            };
            existingMaterials.push(newMaterial);
        });

        this.localStorageService.setItem(this.MATERIAL_KEY, existingMaterials);

        return of(newOrder).pipe(delay(300));
    }

    /**
     * Complete production order
     * Requirements: 9.4, 9.5, 9.8, 9.9
     */
    complete(id: string, actualQuantity: number, scrapQuantity: number, scrapReason: string, userId: string): Observable<ProductionOrder> {
        const orders = this.localStorageService.getItem<ProductionOrder[]>(this.ORDER_KEY) || [];
        const index = orders.findIndex(o => o.id === id);

        if (index === -1) {
            return throwError(() => ({ error: { message: 'Production order not found' } }));
        }

        // Requirement 9.9: Scrap reason required if scrap > 0
        if (scrapQuantity > 0 && !scrapReason) {
            return throwError(() => ({ error: { message: 'Scrap reason is required' } }));
        }

        const order = orders[index];
        const yieldPercentage = calculateYieldPercentage(order.planned_quantity, actualQuantity);

        orders[index] = {
            ...order,
            status: WOStatus.COMPLETED,
            actual_quantity: actualQuantity,
            yield_percentage: yieldPercentage,
            scrap_quantity: scrapQuantity,
            scrap_reason: scrapReason,
            completion_date: new Date(),
            updated_at: new Date(),
            updated_by: userId
        };

        this.localStorageService.setItem(this.ORDER_KEY, orders);

        // Update stock balances
        // Decrease raw materials (Requirement 9.4)
        const materials = this.localStorageService.getItem<ProductionMaterial[]>(this.MATERIAL_KEY) || [];
        const orderMaterials = materials.filter(m => m.production_order_id === id);

        orderMaterials.forEach(material => {
            this.stockBalanceService.updateBalance(
                material.material_item_id,
                material.warehouse_id,
                -material.required_quantity,
                StockMovementType.PRODUCTION_CONSUME,
                order.wo_number,
                StockReferenceType.PRODUCTION_ORDER,
                0,
                material.batch_number,
                userId
            ).subscribe();
        });

        // Increase finished goods (Requirement 9.4)
        this.stockBalanceService.updateBalance(
            order.output_item_id,
            order.warehouse_id,
            actualQuantity,
            StockMovementType.PRODUCTION_OUTPUT,
            order.wo_number,
            StockReferenceType.PRODUCTION_ORDER,
            0,
            undefined,
            userId
        ).subscribe();

        return of(orders[index]).pipe(delay(300));
    }

    getMaterials(orderId: string): Observable<ProductionMaterial[]> {
        const materials = this.localStorageService.getItem<ProductionMaterial[]>(this.MATERIAL_KEY) || [];
        const filtered = materials.filter(m => m.production_order_id === orderId);
        return of(filtered).pipe(delay(300));
    }

    delete(id: string): Observable<void> {
        const orders = this.localStorageService.getItem<ProductionOrder[]>(this.ORDER_KEY) || [];
        const filtered = orders.filter(o => o.id !== id);
        this.localStorageService.setItem(this.ORDER_KEY, filtered);

        const materials = this.localStorageService.getItem<ProductionMaterial[]>(this.MATERIAL_KEY) || [];
        const filteredMaterials = materials.filter(m => m.production_order_id !== id);
        this.localStorageService.setItem(this.MATERIAL_KEY, filteredMaterials);

        return of(void 0).pipe(delay(300));
    }

    /**
     * Get all work orders
     */
    getAllWorkOrders(): Observable<ProductionOrder[]> {
        const orders = this.localStorageService.getItem<ProductionOrder[]>(this.ORDER_KEY) || [];
        return of(orders).pipe(delay(200));
    }
}
