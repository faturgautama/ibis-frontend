import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DataProvider } from '../../../core/services/data-provider.service';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { Warehouse, WarehouseType } from '../models/warehouse.model';

/**
 * Warehouse Demo Service
 * 
 * Provides warehouse management functionality using localStorage for demo mode.
 * Implements CRUD operations with validation for bonded warehouse licenses.
 */
@Injectable({
    providedIn: 'root'
})
export class WarehouseDemoService extends DataProvider<Warehouse> {
    private readonly storageKey = 'warehouses';
    private readonly simulatedDelay = 300; // ms

    constructor(private localStorage: LocalStorageService) {
        super();
        this.initializeDemoData();
    }

    /**
     * Get all warehouses
     */
    getAll(): Observable<Warehouse[]> {
        const warehouses = this.localStorage.getItem<Warehouse[]>(this.storageKey) || [];
        return of(warehouses).pipe(delay(this.simulatedDelay));
    }

    /**
     * Alias for getAll() - for compatibility
     */
    getAllWarehouses(): Observable<Warehouse[]> {
        return this.getAll();
    }

    /**
     * Get warehouse by ID
     */
    getById(id: string): Observable<Warehouse> {
        const warehouses = this.localStorage.getItem<Warehouse[]>(this.storageKey) || [];
        const warehouse = warehouses.find(w => w.id === id);

        if (!warehouse) {
            return throwError(() => ({
                status: 404,
                error: { message: 'Warehouse not found' }
            })).pipe(delay(this.simulatedDelay));
        }

        return of(warehouse).pipe(delay(this.simulatedDelay));
    }

    /**
     * Create new warehouse
     */
    create(warehouse: Partial<Warehouse>): Observable<Warehouse> {
        // Validate required fields
        if (!warehouse.warehouse_code || !warehouse.warehouse_name || !warehouse.location) {
            return throwError(() => ({
                status: 400,
                error: { message: 'Missing required fields: warehouse_code, warehouse_name, location' }
            })).pipe(delay(this.simulatedDelay));
        }

        // Validate bonded warehouse license
        if (warehouse.is_bonded) {
            if (!warehouse.license_number || !warehouse.license_expiry) {
                return throwError(() => ({
                    status: 400,
                    error: { message: 'Bonded warehouse requires license_number and license_expiry' }
                })).pipe(delay(this.simulatedDelay));
            }
        }

        const warehouses = this.localStorage.getItem<Warehouse[]>(this.storageKey) || [];

        // Check for duplicate warehouse code
        if (warehouses.some(w => w.warehouse_code === warehouse.warehouse_code)) {
            return throwError(() => ({
                status: 409,
                error: { message: 'Warehouse code already exists' }
            })).pipe(delay(this.simulatedDelay));
        }

        const newWarehouse: Warehouse = {
            id: Date.now().toString(),
            warehouse_code: warehouse.warehouse_code,
            warehouse_name: warehouse.warehouse_name,
            location: warehouse.location,
            warehouse_type: warehouse.warehouse_type || WarehouseType.RAW_MATERIAL,
            capacity: warehouse.capacity,
            current_utilization: warehouse.current_utilization || 0,
            manager_id: warehouse.manager_id,
            address: warehouse.address,
            phone: warehouse.phone,
            is_bonded: warehouse.is_bonded || false,
            license_number: warehouse.license_number,
            license_expiry: warehouse.license_expiry,
            active: warehouse.active !== undefined ? warehouse.active : true,
            created_at: new Date(),
            updated_at: new Date()
        };

        warehouses.push(newWarehouse);
        this.localStorage.setItem(this.storageKey, warehouses);

        return of(newWarehouse).pipe(delay(this.simulatedDelay));
    }

    /**
     * Update warehouse
     */
    update(id: string, updates: Partial<Warehouse>): Observable<Warehouse> {
        const warehouses = this.localStorage.getItem<Warehouse[]>(this.storageKey) || [];
        const index = warehouses.findIndex(w => w.id === id);

        if (index === -1) {
            return throwError(() => ({
                status: 404,
                error: { message: 'Warehouse not found' }
            })).pipe(delay(this.simulatedDelay));
        }

        // Validate bonded warehouse license if updating is_bonded or license fields
        const updatedWarehouse = { ...warehouses[index], ...updates };
        if (updatedWarehouse.is_bonded) {
            if (!updatedWarehouse.license_number || !updatedWarehouse.license_expiry) {
                return throwError(() => ({
                    status: 400,
                    error: { message: 'Bonded warehouse requires license_number and license_expiry' }
                })).pipe(delay(this.simulatedDelay));
            }
        }

        updatedWarehouse.updated_at = new Date();
        warehouses[index] = updatedWarehouse;
        this.localStorage.setItem(this.storageKey, warehouses);

        return of(updatedWarehouse).pipe(delay(this.simulatedDelay));
    }

    /**
     * Delete warehouse
     */
    delete(id: string): Observable<void> {
        const warehouses = this.localStorage.getItem<Warehouse[]>(this.storageKey) || [];
        const index = warehouses.findIndex(w => w.id === id);

        if (index === -1) {
            return throwError(() => ({
                status: 404,
                error: { message: 'Warehouse not found' }
            })).pipe(delay(this.simulatedDelay));
        }

        warehouses.splice(index, 1);
        this.localStorage.setItem(this.storageKey, warehouses);

        return of(void 0).pipe(delay(this.simulatedDelay));
    }

    /**
     * Get warehouses with expiring licenses (within specified days)
     */
    getExpiringLicenses(days: number = 30): Observable<Warehouse[]> {
        const warehouses = this.localStorage.getItem<Warehouse[]>(this.storageKey) || [];
        const now = new Date();
        const thresholdDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

        const expiringWarehouses = warehouses.filter(w => {
            if (!w.is_bonded || !w.license_expiry) return false;
            const expiryDate = new Date(w.license_expiry);
            return expiryDate <= thresholdDate && expiryDate >= now;
        });

        return of(expiringWarehouses).pipe(delay(this.simulatedDelay));
    }

    /**
     * Initialize demo data
     */
    private initializeDemoData(): void {
        const existing = this.localStorage.getItem<Warehouse[]>(this.storageKey);
        if (!existing || existing.length === 0) {
            const demoWarehouses: Warehouse[] = [
                {
                    id: '1',
                    warehouse_code: 'WH-RAW-001',
                    warehouse_name: 'Raw Material Warehouse A',
                    location: 'Building A, Floor 1',
                    warehouse_type: WarehouseType.RAW_MATERIAL,
                    capacity: 10000,
                    current_utilization: 6500,
                    is_bonded: true,
                    license_number: 'KB-001-2024',
                    license_expiry: new Date('2025-12-31'),
                    active: true,
                    created_at: new Date(),
                    updated_at: new Date()
                },
                {
                    id: '2',
                    warehouse_code: 'WH-FG-001',
                    warehouse_name: 'Finished Goods Warehouse',
                    location: 'Building B, Floor 2',
                    warehouse_type: WarehouseType.FINISHED_GOODS,
                    capacity: 5000,
                    current_utilization: 3200,
                    is_bonded: true,
                    license_number: 'KB-002-2024',
                    license_expiry: new Date('2025-06-30'),
                    active: true,
                    created_at: new Date(),
                    updated_at: new Date()
                },
                {
                    id: '3',
                    warehouse_code: 'WH-QUA-001',
                    warehouse_name: 'Quarantine Warehouse',
                    location: 'Building C, Floor 1',
                    warehouse_type: WarehouseType.QUARANTINE,
                    capacity: 1000,
                    current_utilization: 150,
                    is_bonded: false,
                    active: true,
                    created_at: new Date(),
                    updated_at: new Date()
                }
            ];

            this.localStorage.setItem(this.storageKey, demoWarehouses);
        }
    }
}
