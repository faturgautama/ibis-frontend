import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DataProvider } from '../../../core/services/data-provider.service';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { Customer, validateNPWP } from '../models/customer.model';

/**
 * Customer Demo Service
 * 
 * Provides customer management functionality using localStorage for demo mode.
 * Implements CRUD operations with NPWP validation and active/inactive status.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */
@Injectable({
    providedIn: 'root'
})
export class CustomerDemoService extends DataProvider<Customer> {
    private readonly storageKey = 'customers';
    private readonly simulatedDelay = 300; // ms

    constructor(private localStorage: LocalStorageService) {
        super();
        this.initializeDemoData();
    }

    /**
     * Get all customers
     */
    getAll(): Observable<Customer[]> {
        const customers = this.localStorage.getItem<Customer[]>(this.storageKey) || [];
        return of(customers).pipe(delay(this.simulatedDelay));
    }

    /**
     * Get customer by ID
     */
    getById(id: string): Observable<Customer> {
        const customers = this.localStorage.getItem<Customer[]>(this.storageKey) || [];
        const customer = customers.find(c => c.id === id);

        if (!customer) {
            return throwError(() => ({
                status: 404,
                error: { message: 'Customer not found' }
            })).pipe(delay(this.simulatedDelay));
        }

        return of(customer).pipe(delay(this.simulatedDelay));
    }

    /**
     * Create new customer
     * Validates required fields and NPWP format
     */
    create(customer: Partial<Customer>): Observable<Customer> {
        // Validate required fields
        if (!customer.customer_code || !customer.customer_name || !customer.address || !customer.tax_id) {
            return throwError(() => ({
                status: 400,
                error: { message: 'Missing required fields: customer_code, customer_name, address, tax_id' }
            })).pipe(delay(this.simulatedDelay));
        }

        // Validate NPWP format (Requirement 4.3)
        if (!validateNPWP(customer.tax_id)) {
            return throwError(() => ({
                status: 400,
                error: { message: 'Invalid NPWP format. Expected format: XX.XXX.XXX.X-XXX.XXX' }
            })).pipe(delay(this.simulatedDelay));
        }

        const customers = this.localStorage.getItem<Customer[]>(this.storageKey) || [];

        // Check for duplicate customer code
        if (customers.some(c => c.customer_code === customer.customer_code)) {
            return throwError(() => ({
                status: 409,
                error: { message: 'Customer code already exists' }
            })).pipe(delay(this.simulatedDelay));
        }

        // Check for duplicate tax_id
        if (customers.some(c => c.tax_id === customer.tax_id)) {
            return throwError(() => ({
                status: 409,
                error: { message: 'Tax ID (NPWP) already exists' }
            })).pipe(delay(this.simulatedDelay));
        }

        const newCustomer: Customer = {
            id: Date.now().toString(),
            customer_code: customer.customer_code,
            customer_name: customer.customer_name,
            address: customer.address,
            city: customer.city,
            postal_code: customer.postal_code,
            country: customer.country || 'Indonesia',
            contact_person: customer.contact_person,
            phone: customer.phone,
            email: customer.email,
            tax_id: customer.tax_id,
            active: customer.active !== undefined ? customer.active : true,
            created_at: new Date(),
            updated_at: new Date()
        };

        customers.push(newCustomer);
        this.localStorage.setItem(this.storageKey, customers);

        return of(newCustomer).pipe(delay(this.simulatedDelay));
    }

    /**
     * Update customer
     */
    update(id: string, updates: Partial<Customer>): Observable<Customer> {
        const customers = this.localStorage.getItem<Customer[]>(this.storageKey) || [];
        const index = customers.findIndex(c => c.id === id);

        if (index === -1) {
            return throwError(() => ({
                status: 404,
                error: { message: 'Customer not found' }
            })).pipe(delay(this.simulatedDelay));
        }

        // Validate NPWP if being updated
        if (updates.tax_id && !validateNPWP(updates.tax_id)) {
            return throwError(() => ({
                status: 400,
                error: { message: 'Invalid NPWP format. Expected format: XX.XXX.XXX.X-XXX.XXX' }
            })).pipe(delay(this.simulatedDelay));
        }

        // Check for duplicate tax_id (excluding current customer)
        if (updates.tax_id && customers.some(c => c.id !== id && c.tax_id === updates.tax_id)) {
            return throwError(() => ({
                status: 409,
                error: { message: 'Tax ID (NPWP) already exists' }
            })).pipe(delay(this.simulatedDelay));
        }

        const updatedCustomer = {
            ...customers[index],
            ...updates,
            id: customers[index].id, // Preserve ID
            created_at: customers[index].created_at, // Preserve creation date
            updated_at: new Date()
        };

        customers[index] = updatedCustomer;
        this.localStorage.setItem(this.storageKey, customers);

        return of(updatedCustomer).pipe(delay(this.simulatedDelay));
    }

    /**
     * Delete customer
     * Requirement 4.5: Prevent deletion if customer has transaction history
     */
    delete(id: string): Observable<void> {
        const customers = this.localStorage.getItem<Customer[]>(this.storageKey) || [];
        const index = customers.findIndex(c => c.id === id);

        if (index === -1) {
            return throwError(() => ({
                status: 404,
                error: { message: 'Customer not found' }
            })).pipe(delay(this.simulatedDelay));
        }

        // TODO: Check for transaction history
        // For now, we'll allow deletion
        // In production, this should check outbound_headers table

        customers.splice(index, 1);
        this.localStorage.setItem(this.storageKey, customers);

        return of(void 0).pipe(delay(this.simulatedDelay));
    }

    /**
     * Get active customers only
     */
    getActiveCustomers(): Observable<Customer[]> {
        const customers = this.localStorage.getItem<Customer[]>(this.storageKey) || [];
        const activeCustomers = customers.filter(c => c.active);
        return of(activeCustomers).pipe(delay(this.simulatedDelay));
    }

    /**
     * Toggle customer active status (Requirement 4.4)
     */
    toggleActive(id: string): Observable<Customer> {
        const customers = this.localStorage.getItem<Customer[]>(this.storageKey) || [];
        const index = customers.findIndex(c => c.id === id);

        if (index === -1) {
            return throwError(() => ({
                status: 404,
                error: { message: 'Customer not found' }
            })).pipe(delay(this.simulatedDelay));
        }

        customers[index].active = !customers[index].active;
        customers[index].updated_at = new Date();
        this.localStorage.setItem(this.storageKey, customers);

        return of(customers[index]).pipe(delay(this.simulatedDelay));
    }

    /**
     * Initialize demo data
     */
    private initializeDemoData(): void {
        const existing = this.localStorage.getItem<Customer[]>(this.storageKey);
        if (!existing || existing.length === 0) {
            const demoCustomers: Customer[] = [
                {
                    id: '1',
                    customer_code: 'CUST-001',
                    customer_name: 'PT Elektronik Indonesia',
                    address: 'Jl. Sudirman No. 100',
                    city: 'Jakarta',
                    postal_code: '10220',
                    country: 'Indonesia',
                    contact_person: 'Rina Kusuma',
                    phone: '+62 21 5551234',
                    email: 'rina@elektronikindonesia.com',
                    tax_id: '04.567.890.1-234.567',
                    active: true,
                    created_at: new Date(),
                    updated_at: new Date()
                },
                {
                    id: '2',
                    customer_code: 'CUST-002',
                    customer_name: 'CV Furniture Jepara',
                    address: 'Jl. Raya Jepara No. 50',
                    city: 'Jepara',
                    postal_code: '59419',
                    country: 'Indonesia',
                    contact_person: 'Hendra Wijaya',
                    phone: '+62 291 5554321',
                    email: 'hendra@furniturejepara.com',
                    tax_id: '05.678.901.2-345.678',
                    active: true,
                    created_at: new Date(),
                    updated_at: new Date()
                },
                {
                    id: '3',
                    customer_code: 'CUST-003',
                    customer_name: 'PT Garmen Tekstil',
                    address: 'Jl. Asia Afrika No. 200',
                    city: 'Bandung',
                    postal_code: '40261',
                    country: 'Indonesia',
                    contact_person: 'Dewi Lestari',
                    phone: '+62 22 5559876',
                    email: 'dewi@garmentekstil.com',
                    tax_id: '06.789.012.3-456.789',
                    active: false,
                    created_at: new Date(),
                    updated_at: new Date()
                }
            ];

            this.localStorage.setItem(this.storageKey, demoCustomers);
        }
    }
}
