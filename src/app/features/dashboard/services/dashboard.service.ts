import { Injectable, inject } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { StockBalanceService } from '../../stock-balance/services/stock-balance.service';

/**
 * Dashboard Service
 * Requirements: 16.1, 16.2, 16.3, 16.6
 */

export interface DashboardMetrics {
    total_stock_value: number;
    total_items: number;
    total_warehouses: number;
    low_stock_count: number;
    expiring_items_count: number;
    pending_inbound: number;
    pending_outbound: number;
    pending_production: number;
}

export interface StockMovementTrend {
    date: Date;
    inbound: number;
    outbound: number;
    production: number;
}

export interface WarehouseUtilization {
    warehouse_id: string;
    warehouse_name: string;
    capacity: number;
    current_stock: number;
    utilization_percentage: number;
}

export interface ProductionEfficiency {
    period: string;
    planned_quantity: number;
    actual_quantity: number;
    efficiency_percentage: number;
    scrap_percentage: number;
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private localStorageService = inject(LocalStorageService);
    private stockBalanceService = inject(StockBalanceService);

    /**
     * Get dashboard metrics
     * Requirement: 16.1
     */
    getDashboardMetrics(): Observable<DashboardMetrics> {
        const balances = this.localStorageService.getItem<any[]>('stock_balances') || [];
        const warehouses = this.localStorageService.getItem<any[]>('warehouses') || [];
        const inbounds = this.localStorageService.getItem<any[]>('inbound_headers') || [];
        const outbounds = this.localStorageService.getItem<any[]>('outbound_headers') || [];
        const productions = this.localStorageService.getItem<any[]>('production_orders') || [];

        const metrics: DashboardMetrics = {
            total_stock_value: balances.reduce((sum, b) => sum + (b.total_value || 0), 0),
            total_items: balances.length,
            total_warehouses: warehouses.length,
            low_stock_count: balances.filter(b => b.available_quantity < 100).length,
            expiring_items_count: balances.filter(b => {
                if (!b.expiry_date) return false;
                const daysUntilExpiry = Math.ceil(
                    (new Date(b.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
            }).length,
            pending_inbound: inbounds.filter(i => i.status === 'PENDING').length,
            pending_outbound: outbounds.filter(o => o.status === 'PENDING').length,
            pending_production: productions.filter(p => p.status === 'PLANNED').length
        };

        return of(metrics).pipe(delay(300));
    }

    /**
     * Get stock movement trends
     * Requirement: 16.2
     */
    getStockMovementTrends(days: number = 30): Observable<StockMovementTrend[]> {
        const history = this.localStorageService.getItem<any[]>('stock_history') || [];

        // Group by date
        const trendMap = new Map<string, StockMovementTrend>();

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        history.forEach(h => {
            const movementDate = new Date(h.movement_date);
            if (movementDate < startDate) return;

            const dateKey = movementDate.toISOString().split('T')[0];

            if (!trendMap.has(dateKey)) {
                trendMap.set(dateKey, {
                    date: new Date(dateKey),
                    inbound: 0,
                    outbound: 0,
                    production: 0
                });
            }

            const trend = trendMap.get(dateKey)!;

            if (h.movement_type === 'INBOUND') {
                trend.inbound += Math.abs(h.quantity_change);
            } else if (h.movement_type === 'OUTBOUND') {
                trend.outbound += Math.abs(h.quantity_change);
            } else if (h.movement_type === 'PRODUCTION_OUTPUT') {
                trend.production += Math.abs(h.quantity_change);
            }
        });

        const trends = Array.from(trendMap.values()).sort((a, b) =>
            a.date.getTime() - b.date.getTime()
        );

        return of(trends).pipe(delay(300));
    }

    /**
     * Get warehouse utilization
     * Requirement: 16.3
     */
    getWarehouseUtilization(): Observable<WarehouseUtilization[]> {
        const warehouses = this.localStorageService.getItem<any[]>('warehouses') || [];
        const balances = this.localStorageService.getItem<any[]>('stock_balances') || [];

        const utilization: WarehouseUtilization[] = warehouses.map(wh => {
            const warehouseBalances = balances.filter(b => b.warehouse_id === wh.id);
            const currentStock = warehouseBalances.reduce((sum, b) => sum + (b.quantity || 0), 0);
            const capacity = wh.capacity || 10000;

            return {
                warehouse_id: wh.id,
                warehouse_name: wh.name,
                capacity: capacity,
                current_stock: currentStock,
                utilization_percentage: (currentStock / capacity) * 100
            };
        });

        return of(utilization).pipe(delay(300));
    }

    /**
     * Get production efficiency
     * Requirement: 16.6
     */
    getProductionEfficiency(months: number = 6): Observable<ProductionEfficiency[]> {
        const productions = this.localStorageService.getItem<any[]>('production_orders') || [];

        // Group by month
        const efficiencyMap = new Map<string, ProductionEfficiency>();

        productions.forEach(p => {
            if (p.status !== 'COMPLETED') return;

            const date = new Date(p.wo_date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!efficiencyMap.has(monthKey)) {
                efficiencyMap.set(monthKey, {
                    period: monthKey,
                    planned_quantity: 0,
                    actual_quantity: 0,
                    efficiency_percentage: 0,
                    scrap_percentage: 0
                });
            }

            const efficiency = efficiencyMap.get(monthKey)!;
            efficiency.planned_quantity += p.planned_quantity || 0;
            efficiency.actual_quantity += p.actual_quantity || 0;
        });

        // Calculate percentages
        efficiencyMap.forEach(efficiency => {
            if (efficiency.planned_quantity > 0) {
                efficiency.efficiency_percentage =
                    (efficiency.actual_quantity / efficiency.planned_quantity) * 100;
                efficiency.scrap_percentage =
                    ((efficiency.planned_quantity - efficiency.actual_quantity) / efficiency.planned_quantity) * 100;
            }
        });

        const efficiencies = Array.from(efficiencyMap.values())
            .sort((a, b) => a.period.localeCompare(b.period))
            .slice(-months);

        return of(efficiencies).pipe(delay(300));
    }

    /**
     * Get recent activities
     */
    getRecentActivities(limit: number = 10): Observable<any[]> {
        const history = this.localStorageService.getItem<any[]>('stock_history') || [];

        const recent = history
            .sort((a, b) => new Date(b.movement_date).getTime() - new Date(a.movement_date).getTime())
            .slice(0, limit);

        return of(recent).pipe(delay(200));
    }

    /**
     * Get pending transactions summary
     */
    getPendingTransactions(): Observable<any> {
        const inbounds = this.localStorageService.getItem<any[]>('inbound_headers') || [];
        const outbounds = this.localStorageService.getItem<any[]>('outbound_headers') || [];
        const productions = this.localStorageService.getItem<any[]>('production_orders') || [];
        const bcDocs = this.localStorageService.getItem<any[]>('bc_documents') || [];

        return of({
            pending_inbound: inbounds.filter(i => i.status === 'PENDING'),
            pending_outbound: outbounds.filter(o => o.status === 'PENDING'),
            pending_production: productions.filter(p => p.status === 'PLANNED'),
            pending_bc_documents: bcDocs.filter(d => d.status === 'DRAFT')
        }).pipe(delay(200));
    }
}
