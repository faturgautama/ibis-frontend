import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { StockHistory } from '../../stock-balance/models/stock-balance.model';

/**
 * Traceability Service
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.7
 */
@Injectable({
    providedIn: 'root'
})
export class TraceabilityService {
    private localStorageService = inject(LocalStorageService);

    /**
     * Trace forward: Raw Material → FG → Outbound (Requirement 13.2)
     */
    traceForward(itemId: string, batchNumber?: string): Observable<any[]> {
        const history = this.localStorageService.getItem<StockHistory[]>('stock_history') || [];

        // Find all movements related to this item/batch
        let chain = history.filter(h => h.item_id === itemId);
        if (batchNumber) {
            chain = chain.filter(h => h.batch_number === batchNumber);
        }

        // Sort by date
        chain.sort((a, b) => new Date(a.movement_date).getTime() - new Date(b.movement_date).getTime());

        return of(chain).pipe(delay(300));
    }

    /**
     * Trace backward: Outbound → FG → Raw Material (Requirement 13.3)
     */
    traceBackward(itemId: string, batchNumber?: string): Observable<any[]> {
        const history = this.localStorageService.getItem<StockHistory[]>('stock_history') || [];

        // Find all movements related to this item/batch
        let chain = history.filter(h => h.item_id === itemId);
        if (batchNumber) {
            chain = chain.filter(h => h.batch_number === batchNumber);
        }

        // Sort by date descending (backward)
        chain.sort((a, b) => new Date(b.movement_date).getTime() - new Date(a.movement_date).getTime());

        return of(chain).pipe(delay(300));
    }

    /**
     * Get production history (Requirement 13.4)
     */
    getProductionHistory(itemId: string): Observable<any[]> {
        const productionOrders = this.localStorageService.getItem<any[]>('production_orders') || [];
        const materials = this.localStorageService.getItem<any[]>('production_materials') || [];

        // Find production orders that produced this item
        const orders = productionOrders.filter(o => o.output_item_id === itemId);

        // Enrich with materials used
        const enriched = orders.map(order => ({
            ...order,
            materials: materials.filter(m => m.production_order_id === order.id)
        }));

        return of(enriched).pipe(delay(300));
    }

    /**
     * Get raw material usage (Requirement 13.5)
     */
    getRawMaterialUsage(materialId: string, startDate?: Date, endDate?: Date): Observable<any[]> {
        const materials = this.localStorageService.getItem<any[]>('production_materials') || [];
        const productionOrders = this.localStorageService.getItem<any[]>('production_orders') || [];

        // Find all usage of this material
        let usage = materials.filter(m => m.material_item_id === materialId);

        // Filter by date if provided
        if (startDate || endDate) {
            const orderIds = usage.map(u => u.production_order_id);
            const filteredOrders = productionOrders.filter(o => {
                const orderDate = new Date(o.wo_date);
                if (startDate && orderDate < startDate) return false;
                if (endDate && orderDate > endDate) return false;
                return orderIds.includes(o.id);
            });
            const filteredOrderIds = filteredOrders.map(o => o.id);
            usage = usage.filter(u => filteredOrderIds.includes(u.production_order_id));
        }

        // Enrich with production order info
        const enriched = usage.map(u => ({
            ...u,
            production_order: productionOrders.find(o => o.id === u.production_order_id)
        }));

        return of(enriched).pipe(delay(300));
    }

    /**
     * Search by RFID (Requirement 13.7)
     */
    searchByRFID(rfidTag: string): Observable<any> {
        const balances = this.localStorageService.getItem<any[]>('stock_balances') || [];
        const balance = balances.find(b => b.rfid_tag === rfidTag);

        if (balance) {
            // Get full traceability chain
            return this.traceForward(balance.item_id, balance.batch_number);
        }

        return of(null).pipe(delay(300));
    }
}
