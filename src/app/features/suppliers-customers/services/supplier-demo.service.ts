import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DataProvider } from '../../../core/services/data-provider.service';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { Supplier, validateNPWP } from '../models/supplier.model';

/**
 * Supplier Demo Service
 * 
 * Provides supplier management functionality using localStorage for demo mode.
 * Implements CRUD operations with NPWP validation and active/inactive status.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */
@Injectable({
    providedIn: 'root'
})
export class SupplierDemoService extends DataProvider<Supplier> {
    private readonly storageKey = 'suppliers';
    private readonly simulatedDelay = 300; // ms

    constructor(private localStorage: LocalStorageService) {
        super();
        this.initializeDemoData();
    }

    /**
     * Get all suppliers
     */
    getAll(): Observable<Supplier[]> {
        const suppliers = this.localStorage.getItem<Supplier[]>(this.storageKey) || [];
        return of(suppliers).pipe(delay(this.simulatedDelay));
    }

    /**
     * Get supplier by ID
     */
    getById(id: string): Observable<Supplier> {
        const suppliers = this.localStorage.getItem<Supplier[]>(this.storageKey) || [];
        const supplier = suppliers.find(s => s.id === id);

        if (!supplier) {
            return throwError(() => ({
                status: 404,
                error: { message: 'Supplier not found' }
            })).pipe(delay(this.simulatedDelay));
        }

        return of(supplier).pipe(delay(this.simulatedDelay));
    }

    /**
     * Create new supplier
     * Validates required fields and NPWP format
     */
    create(supplier: Partial<Supplier>): Observable<Supplier> {
        // Validate required fields
        if (!supplier.supplier_code || !supplier.supplier_name || !supplier.address || !supplier.tax_id) {
            return throwError(() => ({
                status: 400,
                error: { message: 'Missing required fields: supplier_code, supplier_name, address, tax_id' }
            })).pipe(delay(this.simulatedDelay));
        }

        // Validate NPWP format (Requirement 4.3)
        if (!validateNPWP(supplier.tax_id)) {
            return throwError(() => ({
                status: 400,
                error: { message: 'Invalid NPWP format. Expected format: XX.XXX.XXX.X-XXX.XXX' }
            })).pipe(delay(this.simulatedDelay));
        }

        const suppliers = this.localStorage.getItem<Supplier[]>(this.storageKey) || [];

        // Check for duplicate supplier code
        if (suppliers.some(s => s.supplier_code === supplier.supplier_code)) {
            return throwError(() => ({
                status: 409,
                error: { message: 'Supplier code already exists' }
            })).pipe(delay(this.simulatedDelay));
        }

        // Check for duplicate tax_id
        if (suppliers.some(s => s.tax_id === supplier.tax_id)) {
            return throwError(() => ({
                status: 409,
                error: { message: 'Tax ID (NPWP) already exists' }
            })).pipe(delay(this.simulatedDelay));
        }

        const newSupplier: Supplier = {
            id: Date.now().toString(),
            supplier_code: supplier.supplier_code,
            supplier_name: supplier.supplier_name,
            address: supplier.address,
            city: supplier.city,
            postal_code: supplier.postal_code,
            country: supplier.country || 'Indonesia',
            contact_person: supplier.contact_person,
            phone: supplier.phone,
            email: supplier.email,
            tax_id: supplier.tax_id,
            active: supplier.active !== undefined ? supplier.active : true,
            created_at: new Date(),
            updated_at: new Date()
        };

        suppliers.push(newSupplier);
        this.localStorage.setItem(this.storageKey, suppliers);

        return of(newSupplier).pipe(delay(this.simulatedDelay));
    }

    /**
     * Update supplier
     */
    update(id: string, updates: Partial<Supplier>): Observable<Supplier> {
        const suppliers = this.localStorage.getItem<Supplier[]>(this.storageKey) || [];
        const index = suppliers.findIndex(s => s.id === id);

        if (index === -1) {
            return throwError(() => ({
                status: 404,
                error: { message: 'Supplier not found' }
            })).pipe(delay(this.simulatedDelay));
        }

        // Validate NPWP if being updated
        if (updates.tax_id && !validateNPWP(updates.tax_id)) {
            return throwError(() => ({
                status: 400,
                error: { message: 'Invalid NPWP format. Expected format: XX.XXX.XXX.X-XXX.XXX' }
            })).pipe(delay(this.simulatedDelay));
        }

        // Check for duplicate tax_id (excluding current supplier)
        if (updates.tax_id && suppliers.some(s => s.id !== id && s.tax_id === updates.tax_id)) {
            return throwError(() => ({
                status: 409,
                error: { message: 'Tax ID (NPWP) already exists' }
            })).pipe(delay(this.simulatedDelay));
        }

        const updatedSupplier = {
            ...suppliers[index],
            ...updates,
            id: suppliers[index].id, // Preserve ID
            created_at: suppliers[index].created_at, // Preserve creation date
            updated_at: new Date()
        };

        suppliers[index] = updatedSupplier;
        this.localStorage.setItem(this.storageKey, suppliers);

        return of(updatedSupplier).pipe(delay(this.simulatedDelay));
    }

    /**
     * Delete supplier
     * Requirement 4.5: Prevent deletion if supplier has transaction history
     */
    delete(id: string): Observable<void> {
        const suppliers = this.localStorage.getItem<Supplier[]>(this.storageKey) || [];
        const index = suppliers.findIndex(s => s.id === id);

        if (index === -1) {
            return throwError(() => ({
                status: 404,
                error: { message: 'Supplier not found' }
            })).pipe(delay(this.simulatedDelay));
        }

        // TODO: Check for transaction history
        // For now, we'll allow deletion
        // In production, this should check inbound_headers table

        suppliers.splice(index, 1);
        this.localStorage.setItem(this.storageKey, suppliers);

        return of(void 0).pipe(delay(this.simulatedDelay));
    }

    /**
     * Get active suppliers only
     */
    getActiveSuppliers(): Observable<Supplier[]> {
        const suppliers = this.localStorage.getItem<Supplier[]>(this.storageKey) || [];
        const activeSuppliers = suppliers.filter(s => s.active);
        return of(activeSuppliers).pipe(delay(this.simulatedDelay));
    }

    /**
     * Toggle supplier active status (Requirement 4.4)
     */
    toggleActive(id: string): Observable<Supplier> {
        const suppliers = this.localStorage.getItem<Supplier[]>(this.storageKey) || [];
        const index = suppliers.findIndex(s => s.id === id);

        if (index === -1) {
            return throwError(() => ({
                status: 404,
                error: { message: 'Supplier not found' }
            })).pipe(delay(this.simulatedDelay));
        }

        suppliers[index].active = !suppliers[index].active;
        suppliers[index].updated_at = new Date();
        this.localStorage.setItem(this.storageKey, suppliers);

        return of(suppliers[index]).pipe(delay(this.simulatedDelay));
    }

    /**
     * Initialize demo data
     */
    private initializeDemoData(): void {
        const existing = this.localStorage.getItem<Supplier[]>(this.storageKey);
        if (!existing || existing.length === 0) {
            const demoSuppliers: Supplier[] = [
                {
                    id: '1',
                    supplier_code: 'SUP-001',
                    supplier_name: 'PT Baja Sentosa',
                    address: 'Jl. Industri No. 123',
                    city: 'Jakarta',
                    postal_code: '12345',
                    country: 'Indonesia',
                    contact_person: 'Budi Santoso',
                    phone: '+62 21 1234567',
                    email: 'budi@bajasentosa.com',
                    tax_id: '01.234.567.8-901.234',
                    active: true,
                    created_at: new Date(),
                    updated_at: new Date()
                },
                {
                    id: '2',
                    supplier_code: 'SUP-002',
                    supplier_name: 'CV Kimia Jaya',
                    address: 'Jl. Raya Industri No. 456',
                    city: 'Surabaya',
                    postal_code: '60123',
                    country: 'Indonesia',
                    contact_person: 'Siti Rahayu',
                    phone: '+62 31 7654321',
                    email: 'siti@kimiajaya.com',
                    tax_id: '02.345.678.9-012.345',
                    active: true,
                    created_at: new Date(),
                    updated_at: new Date()
                },
                {
                    id: '3',
                    supplier_code: 'SUP-003',
                    supplier_name: 'PT Plastik Nusantara',
                    address: 'Jl. Gatot Subroto No. 789',
                    city: 'Bandung',
                    postal_code: '40123',
                    country: 'Indonesia',
                    contact_person: 'Ahmad Wijaya',
                    phone: '+62 22 9876543',
                    email: 'ahmad@plastiknusantara.com',
                    tax_id: '03.456.789.0-123.456',
                    active: false,
                    created_at: new Date(),
                    updated_at: new Date()
                }
            ];

            this.localStorage.setItem(this.storageKey, demoSuppliers);
        }
    }
}
