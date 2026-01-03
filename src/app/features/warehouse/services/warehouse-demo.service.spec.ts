import { TestBed } from '@angular/core/testing';
import * as fc from 'fast-check';
import { WarehouseDemoService } from './warehouse-demo.service';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { Warehouse, WarehouseType } from '../models/warehouse.model';
import { firstValueFrom } from 'rxjs';

/**
 * Property-Based Tests for Warehouse Demo Service
 * 
 * Feature: kek-inventory-traceability
 * Validates: Requirements 3.2, 3.5, 3.6
 */
describe('WarehouseDemoService - Property Tests', () => {
    let service: WarehouseDemoService;
    let localStorage: LocalStorageService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [WarehouseDemoService, LocalStorageService]
        });
        service = TestBed.inject(WarehouseDemoService);
        localStorage = TestBed.inject(LocalStorageService);

        // Clear localStorage before each test
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    /**
     * Feature: kek-inventory-traceability
     * Property 10: Warehouse Required Fields Validation
     * Validates: Requirements 3.2
     * 
     * For any warehouse creation attempt without required fields (warehouse_code, warehouse_name, location),
     * the system should reject the operation.
     */
    describe('Property 10: Warehouse Required Fields Validation', () => {
        it('should reject warehouse creation without required fields', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.record({
                        warehouse_code: fc.option(
                            fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
                            { nil: undefined }
                        ),
                        warehouse_name: fc.option(
                            fc.string({ minLength: 3, maxLength: 100 }).filter(s => s.trim().length > 0),
                            { nil: undefined }
                        ),
                        location: fc.option(
                            fc.string({ minLength: 3, maxLength: 200 }).filter(s => s.trim().length > 0),
                            { nil: undefined }
                        ),
                        warehouse_type: fc.constantFrom(
                            WarehouseType.RAW_MATERIAL,
                            WarehouseType.WIP,
                            WarehouseType.FINISHED_GOODS,
                            WarehouseType.QUARANTINE
                        ),
                        is_bonded: fc.boolean()
                    }).filter(warehouse => {
                        // Ensure at least one required field is missing
                        return !warehouse.warehouse_code || !warehouse.warehouse_name || !warehouse.location;
                    }),
                    async (invalidWarehouse) => {
                        try {
                            await firstValueFrom(service.create(invalidWarehouse as any));
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

        it('should accept warehouse creation with all required fields', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.record({
                        warehouse_code: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
                        warehouse_name: fc.string({ minLength: 3, maxLength: 100 }).filter(s => s.trim().length > 0),
                        location: fc.string({ minLength: 3, maxLength: 200 }).filter(s => s.trim().length > 0),
                        warehouse_type: fc.constantFrom(
                            WarehouseType.RAW_MATERIAL,
                            WarehouseType.WIP,
                            WarehouseType.FINISHED_GOODS,
                            WarehouseType.QUARANTINE
                        ),
                        is_bonded: fc.constant(false), // Not bonded to avoid license requirements
                        active: fc.boolean()
                    }),
                    async (validWarehouse) => {
                        const created = await firstValueFrom(service.create(validWarehouse));

                        expect(created.id).toBeDefined();
                        expect(created.warehouse_code).toBe(validWarehouse.warehouse_code);
                        expect(created.warehouse_name).toBe(validWarehouse.warehouse_name);
                        expect(created.location).toBe(validWarehouse.location);
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    /**
     * Feature: kek-inventory-traceability
     * Property 11: Bonded Warehouse License Validation
     * Validates: Requirements 3.5
     * 
     * For any warehouse where is_bonded = true, license_number and license_expiry must be present.
     */
    describe('Property 11: Bonded Warehouse License Validation', () => {
        it('should reject bonded warehouse without license information', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.record({
                        warehouse_code: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
                        warehouse_name: fc.string({ minLength: 3, maxLength: 100 }).filter(s => s.trim().length > 0),
                        location: fc.string({ minLength: 3, maxLength: 200 }).filter(s => s.trim().length > 0),
                        warehouse_type: fc.constantFrom(
                            WarehouseType.RAW_MATERIAL,
                            WarehouseType.WIP,
                            WarehouseType.FINISHED_GOODS,
                            WarehouseType.QUARANTINE
                        ),
                        is_bonded: fc.constant(true),
                        license_number: fc.option(fc.string({ minLength: 5, maxLength: 50 }), { nil: undefined }),
                        license_expiry: fc.option(fc.date({ min: new Date() }), { nil: undefined })
                    }).filter(warehouse => {
                        // Ensure at least one license field is missing when bonded
                        return !warehouse.license_number || !warehouse.license_expiry;
                    }),
                    async (invalidBondedWarehouse) => {
                        try {
                            await firstValueFrom(service.create(invalidBondedWarehouse as any));
                            fail('Should have thrown validation error for bonded warehouse without license');
                        } catch (error: any) {
                            expect(error.status).toBe(400);
                            expect(error.error.message).toContain('Bonded warehouse requires license_number and license_expiry');
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should accept bonded warehouse with complete license information', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.record({
                        warehouse_code: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
                        warehouse_name: fc.string({ minLength: 3, maxLength: 100 }).filter(s => s.trim().length > 0),
                        location: fc.string({ minLength: 3, maxLength: 200 }).filter(s => s.trim().length > 0),
                        warehouse_type: fc.constantFrom(
                            WarehouseType.RAW_MATERIAL,
                            WarehouseType.WIP,
                            WarehouseType.FINISHED_GOODS,
                            WarehouseType.QUARANTINE
                        ),
                        is_bonded: fc.constant(true),
                        license_number: fc.string({ minLength: 5, maxLength: 50 }),
                        license_expiry: fc.date({ min: new Date(), max: new Date('2030-12-31') })
                    }),
                    async (validBondedWarehouse) => {
                        const created = await firstValueFrom(service.create(validBondedWarehouse));

                        expect(created.id).toBeDefined();
                        expect(created.is_bonded).toBe(true);
                        expect(created.license_number).toBe(validBondedWarehouse.license_number);
                        expect(created.license_expiry).toEqual(validBondedWarehouse.license_expiry);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should reject updating warehouse to bonded without license information', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.record({
                        warehouse_code: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
                        warehouse_name: fc.string({ minLength: 3, maxLength: 100 }).filter(s => s.trim().length > 0),
                        location: fc.string({ minLength: 3, maxLength: 200 }).filter(s => s.trim().length > 0)
                    }),
                    async (warehouseData) => {
                        // Create non-bonded warehouse
                        const created = await firstValueFrom(service.create({
                            ...warehouseData,
                            warehouse_type: WarehouseType.RAW_MATERIAL,
                            is_bonded: false
                        }));

                        // Try to update to bonded without license info
                        try {
                            await firstValueFrom(service.update(created.id, {
                                is_bonded: true
                                // Missing license_number and license_expiry
                            }));
                            fail('Should have thrown validation error');
                        } catch (error: any) {
                            expect(error.status).toBe(400);
                            expect(error.error.message).toContain('Bonded warehouse requires license_number and license_expiry');
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    /**
     * Feature: kek-inventory-traceability
     * Property 12: Warehouse License Expiry Alert
     * Validates: Requirements 3.6
     * 
     * For any bonded warehouse where license_expiry is within 30 days, an alert should be generated.
     */
    describe('Property 12: Warehouse License Expiry Alert', () => {
        it('should identify warehouses with licenses expiring within threshold', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.record({
                        daysUntilExpiry: fc.integer({ min: 1, max: 29 }), // Within 30 days
                        warehouse_code: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0)
                    }),
                    async ({ daysUntilExpiry, warehouse_code }) => {
                        // Calculate expiry date within threshold
                        const expiryDate = new Date();
                        expiryDate.setDate(expiryDate.getDate() + daysUntilExpiry);

                        // Create bonded warehouse with expiring license
                        const warehouse = await firstValueFrom(service.create({
                            warehouse_code: warehouse_code,
                            warehouse_name: 'Expiring License Warehouse',
                            location: 'Test Location',
                            warehouse_type: WarehouseType.RAW_MATERIAL,
                            is_bonded: true,
                            license_number: 'TEST-LICENSE',
                            license_expiry: expiryDate
                        }));

                        // Get warehouses with expiring licenses
                        const expiringWarehouses = await firstValueFrom(service.getExpiringLicenses(30));

                        // Verify warehouse appears in expiring list
                        const foundWarehouse = expiringWarehouses.find(w => w.id === warehouse.id);
                        expect(foundWarehouse).toBeDefined();
                        expect(foundWarehouse?.license_expiry).toEqual(expiryDate);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should not include warehouses with licenses expiring beyond threshold', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.record({
                        daysUntilExpiry: fc.integer({ min: 31, max: 365 }), // Beyond 30 days
                        warehouse_code: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0)
                    }),
                    async ({ daysUntilExpiry, warehouse_code }) => {
                        // Calculate expiry date beyond threshold
                        const expiryDate = new Date();
                        expiryDate.setDate(expiryDate.getDate() + daysUntilExpiry);

                        // Create bonded warehouse with license expiring later
                        const warehouse = await firstValueFrom(service.create({
                            warehouse_code: warehouse_code,
                            warehouse_name: 'Future Expiry Warehouse',
                            location: 'Test Location',
                            warehouse_type: WarehouseType.RAW_MATERIAL,
                            is_bonded: true,
                            license_number: 'TEST-LICENSE',
                            license_expiry: expiryDate
                        }));

                        // Get warehouses with expiring licenses (30 days threshold)
                        const expiringWarehouses = await firstValueFrom(service.getExpiringLicenses(30));

                        // Verify warehouse does NOT appear in expiring list
                        const foundWarehouse = expiringWarehouses.find(w => w.id === warehouse.id);
                        expect(foundWarehouse).toBeUndefined();
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should not include non-bonded warehouses in expiring licenses', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.record({
                        warehouse_code: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
                        warehouse_name: fc.string({ minLength: 3, maxLength: 100 }).filter(s => s.trim().length > 0)
                    }),
                    async (warehouseData) => {
                        // Create non-bonded warehouse
                        const warehouse = await firstValueFrom(service.create({
                            ...warehouseData,
                            location: 'Test Location',
                            warehouse_type: WarehouseType.RAW_MATERIAL,
                            is_bonded: false
                        }));

                        // Get warehouses with expiring licenses
                        const expiringWarehouses = await firstValueFrom(service.getExpiringLicenses(30));

                        // Verify non-bonded warehouse does NOT appear in list
                        const foundWarehouse = expiringWarehouses.find(w => w.id === warehouse.id);
                        expect(foundWarehouse).toBeUndefined();
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should not include warehouses with expired licenses (past expiry)', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.record({
                        daysExpired: fc.integer({ min: 1, max: 365 }), // Already expired
                        warehouse_code: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0)
                    }),
                    async ({ daysExpired, warehouse_code }) => {
                        // Calculate past expiry date
                        const expiryDate = new Date();
                        expiryDate.setDate(expiryDate.getDate() - daysExpired);

                        // Create bonded warehouse with expired license
                        const warehouse = await firstValueFrom(service.create({
                            warehouse_code: warehouse_code,
                            warehouse_name: 'Expired License Warehouse',
                            location: 'Test Location',
                            warehouse_type: WarehouseType.RAW_MATERIAL,
                            is_bonded: true,
                            license_number: 'TEST-LICENSE',
                            license_expiry: expiryDate
                        }));

                        // Get warehouses with expiring licenses (should not include already expired)
                        const expiringWarehouses = await firstValueFrom(service.getExpiringLicenses(30));

                        // Verify expired warehouse does NOT appear in expiring list
                        const foundWarehouse = expiringWarehouses.find(w => w.id === warehouse.id);
                        expect(foundWarehouse).toBeUndefined();
                    }
                ),
                { numRuns: 100 }
            );
        });
    });
});
