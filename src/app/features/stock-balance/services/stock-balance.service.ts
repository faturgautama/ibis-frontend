import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import {
    StockBalance,
    StockHistory,
    StockMovementType,
    StockReferenceType,
    StockAlert,
    StockAlertType,
    AlertSeverity,
    StockAgingReport,
    calculateAvailableQuantity,
    isLowStock,
    isExpiringSoon,
    isExpired,
    calculateStockAge
} from '../models/stock-balance.model';
import { LocalStorageService } from '../../../core/services/local-storage.service';

/**
 * Stock Balance Service
 * Requirements: 7.1, 7.2, 7.3, 7.8
 */
@Injectable({
    providedIn: 'root'
})
export class StockBalanceService {
    private localStorageService = inject(LocalStorageService);
    private readonly BALANCE_KEY = 'stock_balances';
    private readonly HISTORY_KEY = 'stock_history';
    private readonly ALERTS_KEY = 'stock_alerts';

    // Real-time balance updates subject
    private balanceUpdates$ = new BehaviorSubject<StockBalance | null>(null);

    constructor() {
        this.initializeDemoData();
    }

    /**
     * Initialize demo data
     */
    private initializeDemoData(): void {
        const existingBalances = this.localStorageService.getItem<StockBalance[]>(this.BALANCE_KEY);
        if (!existingBalances || existingBalances.length === 0) {
            const demoBalances: StockBalance[] = [
                {
                    id: '1',
                    item_id: '1',
                    item_code: 'RM-001',
                    item_name: 'Raw Material A',
                    warehouse_id: '1',
                    warehouse_code: 'WH-RM',
                    warehouse_name: 'Raw Material Warehouse',
                    quantity: 1000,
                    reserved_quantity: 100,
                    available_quantity: 900,
                    unit: 'KG',
                    unit_cost: 50000,
                    total_value: 50000000,
                    batch_number: 'BATCH-2024-001',
                    expiry_date: new Date('2024-12-31'),
                    manufacturing_date: new Date('2024-01-15'),
                    location_code: 'A-01-01',
                    stock_age_days: 15,
                    last_movement_date: new Date('2024-01-20'),
                    last_updated: new Date(),
                    updated_by: 'system'
                },
                {
                    id: '2',
                    item_id: '2',
                    item_code: 'WIP-001',
                    item_name: 'Work in Progress A',
                    warehouse_id: '2',
                    warehouse_code: 'WH-WIP',
                    warehouse_name: 'WIP Warehouse',
                    quantity: 500,
                    reserved_quantity: 50,
                    available_quantity: 450,
                    unit: 'PCS',
                    unit_cost: 75000,
                    total_value: 37500000,
                    batch_number: 'BATCH-2024-002',
                    location_code: 'B-01-01',
                    stock_age_days: 10,
                    last_movement_date: new Date('2024-01-25'),
                    last_updated: new Date(),
                    updated_by: 'system'
                },
                {
                    id: '3',
                    item_id: '3',
                    item_code: 'FG-001',
                    item_name: 'Finished Product A',
                    warehouse_id: '3',
                    warehouse_code: 'WH-FG',
                    warehouse_name: 'Finished Goods Warehouse',
                    quantity: 200,
                    reserved_quantity: 150,
                    available_quantity: 50,
                    unit: 'PCS',
                    unit_cost: 150000,
                    total_value: 30000000,
                    batch_number: 'BATCH-2024-003',
                    expiry_date: new Date('2025-06-30'),
                    manufacturing_date: new Date('2024-01-10'),
                    location_code: 'C-01-01',
                    rfid_tag: 'RFID-FG-001',
                    stock_age_days: 25,
                    last_movement_date: new Date('2024-01-10'),
                    last_updated: new Date(),
                    updated_by: 'system'
                }
            ];
            this.localStorageService.setItem(this.BALANCE_KEY, demoBalances);

            // Initialize demo history
            const demoHistory: StockHistory[] = [
                {
                    id: '1',
                    item_id: '1',
                    item_code: 'RM-001',
                    item_name: 'Raw Material A',
                    warehouse_id: '1',
                    warehouse_code: 'WH-RM',
                    warehouse_name: 'Raw Material Warehouse',
                    movement_type: StockMovementType.INBOUND,
                    movement_date: new Date('2024-01-15'),
                    reference_number: 'INB-2024-001',
                    reference_type: StockReferenceType.INBOUND_RECEIPT,
                    quantity_before: 0,
                    quantity_change: 1000,
                    quantity_after: 1000,
                    unit: 'KG',
                    unit_cost: 50000,
                    total_cost: 50000000,
                    batch_number: 'BATCH-2024-001',
                    created_by: 'admin',
                    created_at: new Date('2024-01-15')
                }
            ];
            this.localStorageService.setItem(this.HISTORY_KEY, demoHistory);
        }
    }

    /**
     * Get balance for specific item and warehouse
     * Requirement: 7.1
     */
    getBalance(itemId: string, warehouseId: string): Observable<StockBalance | null> {
        const balances = this.localStorageService.getItem<StockBalance[]>(this.BALANCE_KEY) || [];
        const balance = balances.find(b => b.item_id === itemId && b.warehouse_id === warehouseId);
        return of(balance || null).pipe(delay(200));
    }

    /**
     * Get all balances
     */
    getAllBalances(): Observable<StockBalance[]> {
        const balances = this.localStorageService.getItem<StockBalance[]>(this.BALANCE_KEY) || [];
        return of(balances).pipe(delay(200));
    }

    /**
     * Get balances by warehouse
     */
    getBalancesByWarehouse(warehouseId: string): Observable<StockBalance[]> {
        const balances = this.localStorageService.getItem<StockBalance[]>(this.BALANCE_KEY) || [];
        const filtered = balances.filter(b => b.warehouse_id === warehouseId);
        return of(filtered).pipe(delay(200));
    }

    /**
     * Get balances by item
     */
    getBalancesByItem(itemId: string): Observable<StockBalance[]> {
        const balances = this.localStorageService.getItem<StockBalance[]>(this.BALANCE_KEY) || [];
        const filtered = balances.filter(b => b.item_id === itemId);
        return of(filtered).pipe(delay(200));
    }

    /**
     * Update balance
     * Requirements: 7.2, 7.3
     */
    updateBalance(
        itemId: string,
        warehouseId: string,
        quantityChange: number,
        movementType: StockMovementType,
        referenceNumber: string,
        referenceType: StockReferenceType,
        unitCost: number,
        batchNumber?: string,
        userId: string = 'system'
    ): Observable<StockBalance> {
        const balances = this.localStorageService.getItem<StockBalance[]>(this.BALANCE_KEY) || [];
        const index = balances.findIndex(b => b.item_id === itemId && b.warehouse_id === warehouseId);

        let updatedBalance: StockBalance;

        if (index === -1) {
            // Create new balance
            updatedBalance = {
                id: Date.now().toString(),
                item_id: itemId,
                item_code: '', // Should be populated from item data
                item_name: '',
                warehouse_id: warehouseId,
                warehouse_code: '',
                warehouse_name: '',
                quantity: quantityChange,
                reserved_quantity: 0,
                available_quantity: quantityChange,
                unit: '',
                unit_cost: unitCost,
                total_value: quantityChange * unitCost,
                batch_number: batchNumber,
                stock_age_days: 0,
                last_movement_date: new Date(),
                last_updated: new Date(),
                updated_by: userId
            };
            balances.push(updatedBalance);
        } else {
            // Update existing balance
            const currentBalance = balances[index];
            const newQuantity = currentBalance.quantity + quantityChange;

            if (newQuantity < 0) {
                return throwError(() => ({ error: { message: 'Insufficient stock' } }));
            }

            updatedBalance = {
                ...currentBalance,
                quantity: newQuantity,
                available_quantity: newQuantity - currentBalance.reserved_quantity,
                total_value: newQuantity * unitCost,
                last_movement_date: new Date(),
                last_updated: new Date(),
                updated_by: userId
            };
            balances[index] = updatedBalance;
        }

        this.localStorageService.setItem(this.BALANCE_KEY, balances);

        // Record history
        this.recordHistory(
            itemId,
            warehouseId,
            movementType,
            referenceNumber,
            referenceType,
            index === -1 ? 0 : balances[index].quantity - quantityChange,
            quantityChange,
            updatedBalance.quantity,
            unitCost,
            batchNumber,
            userId
        );

        // Emit real-time update
        this.balanceUpdates$.next(updatedBalance);

        // Check and generate alerts
        this.checkAndGenerateAlerts(updatedBalance);

        return of(updatedBalance).pipe(delay(200));
    }

    /**
     * Record stock history
     * Requirement: 7.3
     */
    private recordHistory(
        itemId: string,
        warehouseId: string,
        movementType: StockMovementType,
        referenceNumber: string,
        referenceType: StockReferenceType,
        quantityBefore: number,
        quantityChange: number,
        quantityAfter: number,
        unitCost: number,
        batchNumber?: string,
        userId: string = 'system'
    ): void {
        const history = this.localStorageService.getItem<StockHistory[]>(this.HISTORY_KEY) || [];

        const newHistory: StockHistory = {
            id: Date.now().toString(),
            item_id: itemId,
            item_code: '',
            item_name: '',
            warehouse_id: warehouseId,
            warehouse_code: '',
            warehouse_name: '',
            movement_type: movementType,
            movement_date: new Date(),
            reference_number: referenceNumber,
            reference_type: referenceType,
            quantity_before: quantityBefore,
            quantity_change: quantityChange,
            quantity_after: quantityAfter,
            unit: '',
            unit_cost: unitCost,
            total_cost: Math.abs(quantityChange) * unitCost,
            batch_number: batchNumber,
            created_by: userId,
            created_at: new Date()
        };

        history.push(newHistory);
        this.localStorageService.setItem(this.HISTORY_KEY, history);
    }

    /**
     * Get stock history
     */
    getHistory(itemId?: string, warehouseId?: string, limit?: number): Observable<StockHistory[]> {
        let history = this.localStorageService.getItem<StockHistory[]>(this.HISTORY_KEY) || [];

        if (itemId) {
            history = history.filter(h => h.item_id === itemId);
        }

        if (warehouseId) {
            history = history.filter(h => h.warehouse_id === warehouseId);
        }

        // Sort by date descending
        history.sort((a, b) => new Date(b.movement_date).getTime() - new Date(a.movement_date).getTime());

        if (limit) {
            history = history.slice(0, limit);
        }

        return of(history).pipe(delay(200));
    }

    /**
     * Get low stock items
     * Requirement: 7.4
     */
    getLowStockItems(minStockLevel: number = 100): Observable<StockBalance[]> {
        const balances = this.localStorageService.getItem<StockBalance[]>(this.BALANCE_KEY) || [];
        const lowStock = balances.filter(b => isLowStock(b, minStockLevel));
        return of(lowStock).pipe(delay(200));
    }

    /**
     * Get expiring items
     * Requirement: 7.7
     */
    getExpiringItems(daysThreshold: number = 30): Observable<StockBalance[]> {
        const balances = this.localStorageService.getItem<StockBalance[]>(this.BALANCE_KEY) || [];
        const expiring = balances.filter(b =>
            b.expiry_date && isExpiringSoon(b.expiry_date, daysThreshold)
        );
        return of(expiring).pipe(delay(200));
    }

    /**
     * Get expired items
     */
    getExpiredItems(): Observable<StockBalance[]> {
        const balances = this.localStorageService.getItem<StockBalance[]>(this.BALANCE_KEY) || [];
        const expired = balances.filter(b => b.expiry_date && isExpired(b.expiry_date));
        return of(expired).pipe(delay(200));
    }

    /**
     * Get stock aging report
     * Requirement: 7.6
     */
    getStockAgingReport(): Observable<StockAgingReport[]> {
        const balances = this.localStorageService.getItem<StockBalance[]>(this.BALANCE_KEY) || [];

        const reports: StockAgingReport[] = balances.map(balance => {
            const age = balance.stock_age_days || 0;

            const agingBuckets = {
                '0-30_days': { quantity: 0, value: 0 },
                '31-60_days': { quantity: 0, value: 0 },
                '61-90_days': { quantity: 0, value: 0 },
                '91-180_days': { quantity: 0, value: 0 },
                'over_180_days': { quantity: 0, value: 0 }
            };

            if (age <= 30) {
                agingBuckets['0-30_days'] = { quantity: balance.quantity, value: balance.total_value };
            } else if (age <= 60) {
                agingBuckets['31-60_days'] = { quantity: balance.quantity, value: balance.total_value };
            } else if (age <= 90) {
                agingBuckets['61-90_days'] = { quantity: balance.quantity, value: balance.total_value };
            } else if (age <= 180) {
                agingBuckets['91-180_days'] = { quantity: balance.quantity, value: balance.total_value };
            } else {
                agingBuckets['over_180_days'] = { quantity: balance.quantity, value: balance.total_value };
            }

            return {
                item_id: balance.item_id,
                item_code: balance.item_code,
                item_name: balance.item_name,
                warehouse_id: balance.warehouse_id,
                warehouse_code: balance.warehouse_code,
                warehouse_name: balance.warehouse_name,
                total_quantity: balance.quantity,
                total_value: balance.total_value,
                aging_buckets: agingBuckets,
                oldest_stock_date: balance.last_movement_date || new Date(),
                average_age_days: age
            };
        });

        return of(reports).pipe(delay(200));
    }

    /**
     * Check and generate alerts
     */
    private checkAndGenerateAlerts(balance: StockBalance): void {
        const alerts = this.localStorageService.getItem<StockAlert[]>(this.ALERTS_KEY) || [];

        // Check low stock
        if (isLowStock(balance, 100)) {
            const alert: StockAlert = {
                id: Date.now().toString(),
                alert_type: balance.available_quantity === 0 ? StockAlertType.OUT_OF_STOCK : StockAlertType.LOW_STOCK,
                severity: balance.available_quantity === 0 ? AlertSeverity.CRITICAL : AlertSeverity.WARNING,
                item_id: balance.item_id,
                item_code: balance.item_code,
                item_name: balance.item_name,
                warehouse_id: balance.warehouse_id,
                warehouse_code: balance.warehouse_code,
                warehouse_name: balance.warehouse_name,
                current_quantity: balance.available_quantity,
                threshold_quantity: 100,
                message: balance.available_quantity === 0
                    ? `${balance.item_name} is out of stock in ${balance.warehouse_name}`
                    : `${balance.item_name} is running low in ${balance.warehouse_name}`,
                is_acknowledged: false,
                created_at: new Date()
            };
            alerts.push(alert);
        }

        // Check expiring items
        if (balance.expiry_date) {
            if (isExpired(balance.expiry_date)) {
                const alert: StockAlert = {
                    id: Date.now().toString(),
                    alert_type: StockAlertType.EXPIRED,
                    severity: AlertSeverity.CRITICAL,
                    item_id: balance.item_id,
                    item_code: balance.item_code,
                    item_name: balance.item_name,
                    warehouse_id: balance.warehouse_id,
                    warehouse_code: balance.warehouse_code,
                    warehouse_name: balance.warehouse_name,
                    current_quantity: balance.quantity,
                    expiry_date: balance.expiry_date,
                    message: `${balance.item_name} has expired in ${balance.warehouse_name}`,
                    is_acknowledged: false,
                    created_at: new Date()
                };
                alerts.push(alert);
            } else if (isExpiringSoon(balance.expiry_date, 30)) {
                const daysUntilExpiry = Math.ceil(
                    (new Date(balance.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                const alert: StockAlert = {
                    id: Date.now().toString(),
                    alert_type: StockAlertType.EXPIRING_SOON,
                    severity: daysUntilExpiry <= 7 ? AlertSeverity.CRITICAL : AlertSeverity.WARNING,
                    item_id: balance.item_id,
                    item_code: balance.item_code,
                    item_name: balance.item_name,
                    warehouse_id: balance.warehouse_id,
                    warehouse_code: balance.warehouse_code,
                    warehouse_name: balance.warehouse_name,
                    current_quantity: balance.quantity,
                    expiry_date: balance.expiry_date,
                    days_until_expiry: daysUntilExpiry,
                    message: `${balance.item_name} will expire in ${daysUntilExpiry} days`,
                    is_acknowledged: false,
                    created_at: new Date()
                };
                alerts.push(alert);
            }
        }

        this.localStorageService.setItem(this.ALERTS_KEY, alerts);
    }

    /**
     * Get all alerts
     */
    getAlerts(acknowledged?: boolean): Observable<StockAlert[]> {
        let alerts = this.localStorageService.getItem<StockAlert[]>(this.ALERTS_KEY) || [];

        if (acknowledged !== undefined) {
            alerts = alerts.filter(a => a.is_acknowledged === acknowledged);
        }

        return of(alerts).pipe(delay(200));
    }

    /**
     * Acknowledge alert
     */
    acknowledgeAlert(alertId: string, userId: string): Observable<void> {
        const alerts = this.localStorageService.getItem<StockAlert[]>(this.ALERTS_KEY) || [];
        const index = alerts.findIndex(a => a.id === alertId);

        if (index !== -1) {
            alerts[index] = {
                ...alerts[index],
                is_acknowledged: true,
                acknowledged_by: userId,
                acknowledged_at: new Date()
            };
            this.localStorageService.setItem(this.ALERTS_KEY, alerts);
        }

        return of(void 0).pipe(delay(200));
    }

    /**
     * Get real-time balance updates observable
     * Requirement: 7.2
     */
    getBalanceUpdates(): Observable<StockBalance | null> {
        return this.balanceUpdates$.asObservable();
    }

    /**
     * Search balances by RFID tag
     * Requirement: 7.8
     */
    searchByRFID(rfidTag: string): Observable<StockBalance | null> {
        const balances = this.localStorageService.getItem<StockBalance[]>(this.BALANCE_KEY) || [];
        const balance = balances.find(b => b.rfid_tag === rfidTag);
        return of(balance || null).pipe(delay(200));
    }
}
