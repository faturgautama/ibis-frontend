import { TestBed } from '@angular/core/testing';
import * as fc from 'fast-check';
import { InventoryDemoService } from './inventory-demo.service';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { Item, ItemType, FacilityStatus } from '../models/item.model';
import { firstValueFrom } from 'rxjs';

/**
 * Property-Based Tests for Inventory Demo Service
 * 
 * Feature: kek-inventory-traceability
 * Validates: Requirements 2.1, 2.2, 2.3, 2.5, 2.9, 2.10
 */
describe('InventoryDemoService - Property Tests', () => {
    let service: InventoryDemoService;
    let localStorage: LocalStorageService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [InventoryDemoService, LocalStorageService]
        });
        service = TestBed.inject(InventoryDemoService);
        localStorage = TestBed.inject(LocalStorageService);

        // Clear localStorage before each test
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    /**
     * Feature: kek-inventory-traceability
     * Property 4: Item CRUD Operations
     * Validates: Requirements 2.1
     * 
     * For any valid item data, create, read, update, and delete operations should work correctly.
     */
    describe('Property 4: Item CRUD Operations', () => {
        it('should create and retrieve any valid item', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.record({
                        item_code: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
                        item_name: fc.string({ minLength: 3, maxLength: 100 }).filter(s => s.trim().length > 0),
                        hs_code: fc.string({ minLength: 10, maxLength: 10 }).map(s => s.replace(/\D/g, '0').slice(0, 10)),
                        item_type: fc.constantFrom(ItemType.RAW, ItemType.WIP, ItemType.FG, ItemType.ASSET),
                        unit: fc.constantFrom('pcs', 'kg', 'm', 'liter', 'box'),
                        is_hazardous: fc.boolean(),
                        facility_status: fc.constantFrom(FacilityStatus.FASILITAS, FacilityStatus.NON),
                        active: fc.boolean()
                    }),
                    async (itemData) => {
                        // Create item
                        const created = await firstValueFrom(service.create(itemData));

                        // Verify item was created with ID
                        expect(created.id).toBeDefined();
                        expect(created.item_code).toBe(itemData.item_code);
                        expect(created.item_name).toBe(itemData.item_name);

                        // Retrieve item by ID
                        const retrieved = await firstValueFrom(service.getById(created.id));
                        expect(retrieved.id).toBe(created.id);
                        expect(retrieved.item_code).toBe(itemData.item_code);

                        // Update item
                        const updatedName = itemData.item_name + ' Updated';
                        const updated = await firstValueFrom(service.update(created.id, { item_name: updatedName }));
                        expect(updated.item_name).toBe(updatedName);

                        // Delete item (no transaction history)
                        await firstValueFrom(service.delete(created.id));

                        // Verify deletion
                        try {
                            await firstValueFrom(service.getById(created.id));
                            fail('Should have thrown 404 error');
                        } catch (error: any) {
                            expect(error.status).toBe(404);
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    /**
     * Feature: kek-inventory-traceability
     * Property 5: Item Required Fields Validation
     * Validates: Requirements 2.2
     * 
     * For any item creation attempt without required fields, the system should reject the operation.
     */
    describe('Property 5: Item Required Fields Validation', () => {
        it('should reject item creation without required fields', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.record({
                        item_code: fc.option(fc.string({ minLength: 3, maxLength: 20 }), { nil: undefined }),
                        item_name: fc.option(fc.string({ minLength: 3, maxLength: 100 }), { nil: undefined }),
                        hs_code: fc.option(fc.string({ minLength: 10, maxLength: 10 }), { nil: undefined }),
                        item_type: fc.option(fc.constantFrom(ItemType.RAW, ItemType.WIP, ItemType.FG, ItemType.ASSET), { nil: undefined }),
                        unit: fc.option(fc.constantFrom('pcs', 'kg', 'm', 'liter', 'box'), { nil: undefined })
                    }).filter(item => {
                        // Ensure at least one required field is missing
                        return !item.item_code || !item.item_name || !item.hs_code || !item.item_type || !item.unit;
                    }),
                    async (invalidItem) => {
                        try {
                            await firstValueFrom(service.create({
                                ...invalidItem,
                                is_hazardous: false,
                                facility_status: FacilityStatus.FASILITAS,
                                active: true
                            } as any));
                            fail('Should have thrown validation error');
                        } catch (error: any) {
                            expect(error.status).toBe(400);
                            expect(error.error.message).toContain('Missing required fields');
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    /**
     * Feature: kek-inventory-traceability
     * Property 6: HS Code Format Validation
     * Validates: Requirements 2.3
     * 
     * For any HS code input, only 10-digit codes should be accepted.
     */
    describe('Property 6: HS Code Format Validation', () => {
        it('should accept only 10-digit HS codes', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.string({ minLength: 1, maxLength: 20 }).filter(s => !/^\d{10}$/.test(s)),
                    async (invalidHsCode) => {
                        const itemData = {
                            item_code: 'TEST-001',
                            item_name: 'Test Item',
                            hs_code: invalidHsCode,
                            item_type: ItemType.RAW,
                            unit: 'pcs',
                            is_hazardous: false,
                            facility_status: FacilityStatus.FASILITAS,
                            active: true
                        };

                        try {
                            await firstValueFrom(service.create(itemData));
                            fail('Should have thrown HS Code validation error');
                        } catch (error: any) {
                            expect(error.status).toBe(400);
                            expect(error.error.message).toContain('HS Code must be exactly 10 digits');
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should accept valid 10-digit HS codes', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.integer({ min: 1000000000, max: 9999999999 }).map(n => n.toString()),
                    async (validHsCode) => {
                        const itemData = {
                            item_code: `TEST-${Date.now()}-${Math.random()}`,
                            item_name: 'Test Item',
                            hs_code: validHsCode,
                            item_type: ItemType.RAW,
                            unit: 'pcs',
                            is_hazardous: false,
                            facility_status: FacilityStatus.FASILITAS,
                            active: true
                        };

                        const created = await firstValueFrom(service.create(itemData));
                        expect(created.hs_code).toBe(validHsCode);
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    /**
     * Feature: kek-inventory-traceability
     * Property 7: Low Stock Alert Generation
     * Validates: Requirements 2.5
     * 
     * For any item where qty_balance < min_stock, a low stock alert should be generated.
     */
    describe('Property 7: Low Stock Alert Generation', () => {
        it('should identify items with stock below minimum threshold', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.record({
                        min_stock: fc.integer({ min: 10, max: 100 }),
                        current_stock: fc.integer({ min: 0, max: 9 })
                    }),
                    async ({ min_stock, current_stock }) => {
                        // Create item with min_stock
                        const item = await firstValueFrom(service.create({
                            item_code: `LOW-${Date.now()}-${Math.random()}`,
                            item_name: 'Low Stock Item',
                            hs_code: '1234567890',
                            item_type: ItemType.RAW,
                            unit: 'pcs',
                            min_stock: min_stock,
                            is_hazardous: false,
                            facility_status: FacilityStatus.FASILITAS,
                            active: true
                        }));

                        // Set stock balance below minimum
                        const stockBalances = localStorage.getItem<any[]>('stock_balances') || [];
                        stockBalances.push({
                            item_id: item.id,
                            warehouse_id: 'wh-001',
                            qty_balance: current_stock
                        });
                        localStorage.setItem('stock_balances', stockBalances);

                        // Get low stock items
                        const lowStockItems = await firstValueFrom(service.getLowStockItems());

                        // Verify item appears in low stock list
                        const foundItem = lowStockItems.find(i => i.id === item.id);
                        expect(foundItem).toBeDefined();
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    /**
     * Feature: kek-inventory-traceability
     * Property 8: Hazardous Item Warning Display
     * Validates: Requirements 2.9
     * 
     * For any item where is_hazardous = true, warning indicators should be displayed.
     */
    describe('Property 8: Hazardous Item Warning Display', () => {
        it('should mark hazardous items correctly', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.boolean(),
                    async (isHazardous) => {
                        const item = await firstValueFrom(service.create({
                            item_code: `HAZ-${Date.now()}-${Math.random()}`,
                            item_name: 'Test Item',
                            hs_code: '1234567890',
                            item_type: ItemType.RAW,
                            unit: 'pcs',
                            is_hazardous: isHazardous,
                            facility_status: FacilityStatus.FASILITAS,
                            active: true
                        }));

                        expect(item.is_hazardous).toBe(isHazardous);

                        // Retrieve and verify
                        const retrieved = await firstValueFrom(service.getById(item.id));
                        expect(retrieved.is_hazardous).toBe(isHazardous);
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    /**
     * Feature: kek-inventory-traceability
     * Property 9: Item Deletion Prevention with History
     * Validates: Requirements 2.10
     * 
     * For any item that appears in transaction tables, deletion should be rejected.
     */
    describe('Property 9: Item Deletion Prevention with History', () => {
        it('should prevent deletion of items with transaction history', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.record({
                        item_code: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
                        item_name: fc.string({ minLength: 3, maxLength: 100 }).filter(s => s.trim().length > 0)
                    }),
                    async (itemData) => {
                        // Create item
                        const item = await firstValueFrom(service.create({
                            ...itemData,
                            hs_code: '1234567890',
                            item_type: ItemType.RAW,
                            unit: 'pcs',
                            is_hazardous: false,
                            facility_status: FacilityStatus.FASILITAS,
                            active: true
                        }));

                        // Add transaction history
                        const transactions = localStorage.getItem<any[]>('inventory_transactions') || [];
                        transactions.push({
                            id: `txn-${Date.now()}`,
                            item_id: item.id,
                            type: 'inbound',
                            qty: 100
                        });
                        localStorage.setItem('inventory_transactions', transactions);

                        // Attempt to delete
                        try {
                            await firstValueFrom(service.delete(item.id));
                            fail('Should have thrown error preventing deletion');
                        } catch (error: any) {
                            expect(error.status).toBe(422);
                            expect(error.error.message).toContain('Cannot delete item with transaction history');
                        }

                        // Verify item still exists
                        const retrieved = await firstValueFrom(service.getById(item.id));
                        expect(retrieved.id).toBe(item.id);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should allow deletion of items without transaction history', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.record({
                        item_code: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
                        item_name: fc.string({ minLength: 3, maxLength: 100 }).filter(s => s.trim().length > 0)
                    }),
                    async (itemData) => {
                        // Create item
                        const item = await firstValueFrom(service.create({
                            ...itemData,
                            hs_code: '1234567890',
                            item_type: ItemType.RAW,
                            unit: 'pcs',
                            is_hazardous: false,
                            facility_status: FacilityStatus.FASILITAS,
                            active: true
                        }));

                        // Ensure no transaction history
                        localStorage.setItem('inventory_transactions', []);

                        // Delete should succeed
                        await firstValueFrom(service.delete(item.id));

                        // Verify deletion
                        try {
                            await firstValueFrom(service.getById(item.id));
                            fail('Should have thrown 404 error');
                        } catch (error: any) {
                            expect(error.status).toBe(404);
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });
    });
});
