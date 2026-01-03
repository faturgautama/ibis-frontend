import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { DataProvider } from '../../../core/services/data-provider.service';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { Item, ItemType, FacilityStatus } from '../models/item.model';

/**
 * InventoryDemoService
 * 
 * Demo mode implementation of inventory management using localStorage.
 * Provides CRUD operations, validation, and demo data initialization.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.5
 */
@Injectable({
    providedIn: 'root'
})
export class InventoryDemoService extends DataProvider<Item> {
    private readonly storageKey = 'inventory_items';
    private readonly transactionStorageKey = 'inventory_transactions';
    private readonly simulatedDelayMs = 300;

    constructor(private localStorage: LocalStorageService) {
        super();
        this.initializeDemoData();
    }

    /**
     * Get all items from localStorage
     * @returns Observable of all items
     */
    getAll(): Observable<Item[]> {
        const items = this.localStorage.getItem<Item[]>(this.storageKey) || [];
        return of(items).pipe(delay(this.simulatedDelayMs));
    }

    /**
     * Get a single item by ID
     * @param id - Item ID
     * @returns Observable of the item
     */
    getById(id: string): Observable<Item> {
        const items = this.localStorage.getItem<Item[]>(this.storageKey) || [];
        const item = items.find(i => i.id === id);

        if (!item) {
            return throwError(() => ({
                status: 404,
                error: { message: `Item with ID ${id} not found` }
            })).pipe(delay(this.simulatedDelayMs));
        }

        return of(item).pipe(delay(this.simulatedDelayMs));
    }

    /**
     * Create a new item
     * Validates required fields and HS Code format
     * @param item - Item to create
     * @returns Observable of the created item
     */
    create(item: Partial<Item>): Observable<Item> {
        // Validate required fields (Requirement 2.2)
        const validationError = this.validateRequiredFields(item);
        if (validationError) {
            return throwError(() => ({
                status: 400,
                error: { message: validationError }
            })).pipe(delay(this.simulatedDelayMs));
        }

        // Validate HS Code format (Requirement 2.3)
        const hsCodeError = this.validateHSCode(item.hs_code!);
        if (hsCodeError) {
            return throwError(() => ({
                status: 400,
                error: { message: hsCodeError }
            })).pipe(delay(this.simulatedDelayMs));
        }

        // Check for duplicate item_code
        const items = this.localStorage.getItem<Item[]>(this.storageKey) || [];
        if (items.some(i => i.item_code === item.item_code)) {
            return throwError(() => ({
                status: 409,
                error: { message: `Item with code ${item.item_code} already exists` }
            })).pipe(delay(this.simulatedDelayMs));
        }

        // Create new item with generated ID and timestamps
        const newItem: Item = {
            ...item as Item,
            id: this.generateId(),
            created_at: new Date(),
            updated_at: new Date()
        };

        items.push(newItem);
        this.localStorage.setItem(this.storageKey, items);

        return of(newItem).pipe(delay(this.simulatedDelayMs));
    }

    /**
     * Update an existing item
     * @param id - Item ID
     * @param item - Updated item data
     * @returns Observable of the updated item
     */
    update(id: string, item: Partial<Item>): Observable<Item> {
        const items = this.localStorage.getItem<Item[]>(this.storageKey) || [];
        const index = items.findIndex(i => i.id === id);

        if (index === -1) {
            return throwError(() => ({
                status: 404,
                error: { message: `Item with ID ${id} not found` }
            })).pipe(delay(this.simulatedDelayMs));
        }

        // Validate HS Code if provided
        if (item.hs_code) {
            const hsCodeError = this.validateHSCode(item.hs_code);
            if (hsCodeError) {
                return throwError(() => ({
                    status: 400,
                    error: { message: hsCodeError }
                })).pipe(delay(this.simulatedDelayMs));
            }
        }

        // Check for duplicate item_code if it's being changed
        if (item.item_code && item.item_code !== items[index].item_code) {
            if (items.some(i => i.item_code === item.item_code && i.id !== id)) {
                return throwError(() => ({
                    status: 409,
                    error: { message: `Item with code ${item.item_code} already exists` }
                })).pipe(delay(this.simulatedDelayMs));
            }
        }

        // Update item
        const updatedItem: Item = {
            ...items[index],
            ...item,
            id, // Ensure ID doesn't change
            updated_at: new Date()
        };

        items[index] = updatedItem;
        this.localStorage.setItem(this.storageKey, items);

        return of(updatedItem).pipe(delay(this.simulatedDelayMs));
    }

    /**
     * Delete an item
     * Prevents deletion if item has transaction history (Requirement 2.10)
     * @param id - Item ID
     * @returns Observable of void
     */
    delete(id: string): Observable<void> {
        const items = this.localStorage.getItem<Item[]>(this.storageKey) || [];
        const index = items.findIndex(i => i.id === id);

        if (index === -1) {
            return throwError(() => ({
                status: 404,
                error: { message: `Item with ID ${id} not found` }
            })).pipe(delay(this.simulatedDelayMs));
        }

        // Check if item has transaction history
        if (this.hasTransactionHistory(id)) {
            return throwError(() => ({
                status: 422,
                error: { message: 'Cannot delete item with transaction history' }
            })).pipe(delay(this.simulatedDelayMs));
        }

        items.splice(index, 1);
        this.localStorage.setItem(this.storageKey, items);

        return of(void 0).pipe(delay(this.simulatedDelayMs));
    }

    /**
     * Get items with low stock (Requirement 2.5)
     * @returns Observable of items where qty_balance < min_stock
     */
    getLowStockItems(): Observable<Item[]> {
        const items = this.localStorage.getItem<Item[]>(this.storageKey) || [];
        const stockBalances = this.localStorage.getItem<any[]>('stock_balances') || [];

        const lowStockItems = items.filter(item => {
            if (!item.min_stock) return false;

            // Calculate total stock across all warehouses
            const totalStock = stockBalances
                .filter(sb => sb.item_id === item.id)
                .reduce((sum, sb) => sum + (sb.qty_balance || 0), 0);

            return totalStock < item.min_stock;
        });

        return of(lowStockItems).pipe(delay(this.simulatedDelayMs));
    }

    /**
     * Get items nearing expiry date
     * @param daysThreshold - Number of days before expiry to consider (default: 30)
     * @returns Observable of items expiring within threshold
     */
    getExpiringItems(daysThreshold: number = 30): Observable<Item[]> {
        const items = this.localStorage.getItem<Item[]>(this.storageKey) || [];
        const inboundDetails = this.localStorage.getItem<any[]>('inbound_details') || [];
        const now = new Date();
        const thresholdDate = new Date(now.getTime() + (daysThreshold * 24 * 60 * 60 * 1000));

        const expiringItemIds = new Set(
            inboundDetails
                .filter(detail => {
                    if (!detail.expiry_date) return false;
                    const expiryDate = new Date(detail.expiry_date);
                    return expiryDate <= thresholdDate && expiryDate > now;
                })
                .map(detail => detail.item_id)
        );

        const expiringItems = items.filter(item => expiringItemIds.has(item.id));
        return of(expiringItems).pipe(delay(this.simulatedDelayMs));
    }

    /**
     * Validate required fields for item creation
     * @param item - Item to validate
     * @returns Error message or null if valid
     */
    private validateRequiredFields(item: Partial<Item>): string | null {
        const requiredFields: (keyof Item)[] = ['item_code', 'item_name', 'hs_code', 'item_type', 'unit'];
        const missingFields = requiredFields.filter(field => !item[field]);

        if (missingFields.length > 0) {
            return `Missing required fields: ${missingFields.join(', ')}`;
        }

        return null;
    }

    /**
     * Validate HS Code format (must be 10 digits)
     * @param hsCode - HS Code to validate
     * @returns Error message or null if valid
     */
    private validateHSCode(hsCode: string): string | null {
        const hsCodeRegex = /^\d{10}$/;
        if (!hsCodeRegex.test(hsCode)) {
            return 'HS Code must be exactly 10 digits';
        }
        return null;
    }

    /**
     * Check if item has transaction history
     * @param itemId - Item ID to check
     * @returns true if item has transactions
     */
    private hasTransactionHistory(itemId: string): boolean {
        const transactions = this.localStorage.getItem<any[]>(this.transactionStorageKey) || [];
        return transactions.some(t => t.item_id === itemId);
    }

    /**
     * Generate a unique ID for new items
     * @returns Unique ID string
     */
    private generateId(): string {
        return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Initialize demo data on first load
     * Creates sample items if storage is empty
     */
    private initializeDemoData(): void {
        const existingItems = this.localStorage.getItem<Item[]>(this.storageKey);

        if (!existingItems || existingItems.length === 0) {
            const demoItems: Item[] = [
                {
                    id: 'item_demo_001',
                    item_code: 'RM-001',
                    item_name: 'Steel Plate A36',
                    description: 'Carbon steel plate for structural applications',
                    hs_code: '7208390000',
                    item_type: ItemType.RAW,
                    unit: 'kg',
                    category_id: 'cat_steel',
                    brand: 'Krakatau Steel',
                    min_stock: 1000,
                    max_stock: 5000,
                    reorder_point: 1500,
                    lead_time_days: 14,
                    price: 15000,
                    currency: 'IDR',
                    shelf_life_days: 365,
                    storage_condition: 'Dry, covered area',
                    is_hazardous: false,
                    facility_status: FacilityStatus.FASILITAS,
                    active: true,
                    created_at: new Date('2024-01-01'),
                    updated_at: new Date('2024-01-01')
                },
                {
                    id: 'item_demo_002',
                    item_code: 'RM-002',
                    item_name: 'Aluminum Sheet 6061',
                    description: 'Aluminum alloy sheet for manufacturing',
                    hs_code: '7606129000',
                    item_type: ItemType.RAW,
                    unit: 'kg',
                    category_id: 'cat_aluminum',
                    brand: 'Inalum',
                    min_stock: 500,
                    max_stock: 2000,
                    reorder_point: 750,
                    lead_time_days: 10,
                    price: 45000,
                    currency: 'IDR',
                    shelf_life_days: 730,
                    storage_condition: 'Dry, indoor storage',
                    is_hazardous: false,
                    facility_status: FacilityStatus.FASILITAS,
                    active: true,
                    created_at: new Date('2024-01-01'),
                    updated_at: new Date('2024-01-01')
                },
                {
                    id: 'item_demo_003',
                    item_code: 'WIP-001',
                    item_name: 'Semi-Finished Frame',
                    description: 'Frame assembly in progress',
                    hs_code: '7308900000',
                    item_type: ItemType.WIP,
                    unit: 'pcs',
                    min_stock: 50,
                    max_stock: 200,
                    price: 250000,
                    currency: 'IDR',
                    is_hazardous: false,
                    facility_status: FacilityStatus.FASILITAS,
                    active: true,
                    created_at: new Date('2024-01-01'),
                    updated_at: new Date('2024-01-01')
                },
                {
                    id: 'item_demo_004',
                    item_code: 'FG-001',
                    item_name: 'Industrial Frame Assembly',
                    description: 'Complete frame assembly ready for export',
                    hs_code: '7308900000',
                    item_type: ItemType.FG,
                    unit: 'pcs',
                    brand: 'KEK Manufacturing',
                    min_stock: 20,
                    max_stock: 100,
                    reorder_point: 30,
                    price: 500000,
                    currency: 'IDR',
                    shelf_life_days: 1825,
                    storage_condition: 'Indoor, protected from moisture',
                    is_hazardous: false,
                    facility_status: FacilityStatus.FASILITAS,
                    active: true,
                    created_at: new Date('2024-01-01'),
                    updated_at: new Date('2024-01-01')
                },
                {
                    id: 'item_demo_005',
                    item_code: 'RM-003',
                    item_name: 'Industrial Paint - Red',
                    description: 'Hazardous industrial coating paint',
                    hs_code: '3208100000',
                    item_type: ItemType.RAW,
                    unit: 'liter',
                    brand: 'Nippon Paint',
                    min_stock: 100,
                    max_stock: 500,
                    reorder_point: 150,
                    lead_time_days: 7,
                    price: 85000,
                    currency: 'IDR',
                    shelf_life_days: 365,
                    storage_condition: 'Cool, dry, well-ventilated area. Keep away from heat and flames.',
                    is_hazardous: true,
                    facility_status: FacilityStatus.FASILITAS,
                    active: true,
                    created_at: new Date('2024-01-01'),
                    updated_at: new Date('2024-01-01')
                }
            ];

            this.localStorage.setItem(this.storageKey, demoItems);
            console.log('Demo inventory data initialized');
        }
    }
}
