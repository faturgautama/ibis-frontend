import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { OutboundHeader, OutboundDetail, OutboundStatus, OutboundType } from '../models/outbound.model';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { StockBalanceService } from '../../stock-balance/services/stock-balance.service';
import { StockMovementType, StockReferenceType } from '../../stock-balance/models/stock-balance.model';

/**
 * Outbound Demo Service
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.7, 10.10
 */
@Injectable({
    providedIn: 'root'
})
export class OutboundDemoService {
    private localStorageService = inject(LocalStorageService);
    private stockBalanceService = inject(StockBalanceService);
    private readonly HEADER_KEY = 'outbound_headers';
    private readonly DETAIL_KEY = 'outbound_details';

    constructor() {
        this.initializeDemoData();
    }

    private initializeDemoData(): void {
        const existing = this.localStorageService.getItem<OutboundHeader[]>(this.HEADER_KEY);
        if (!existing || existing.length === 0) {
            const demoHeaders: OutboundHeader[] = [
                {
                    id: '1',
                    outbound_number: 'OUT-2024-001',
                    outbound_date: new Date('2024-01-25'),
                    status: OutboundStatus.DELIVERED,
                    outbound_type: OutboundType.EXPORT,
                    bc_document_id: '2',
                    bc_document_number: 'BC30-2024-001',
                    customer_id: '1',
                    customer_code: 'CUST-001',
                    customer_name: 'ABC Trading Co',
                    warehouse_id: '3',
                    warehouse_code: 'WH-FG',
                    warehouse_name: 'Finished Goods Warehouse',
                    delivery_number: 'DEL-2024-001',
                    delivery_date: new Date('2024-01-25'),
                    total_items: 1,
                    total_quantity: 50,
                    total_value: 7500000,
                    it_inventory_synced: true,
                    it_inventory_sync_date: new Date('2024-01-25'),
                    it_inventory_sync_status: 'SUCCESS',
                    created_at: new Date('2024-01-25'),
                    created_by: 'admin'
                }
            ];
            this.localStorageService.setItem(this.HEADER_KEY, demoHeaders);

            const demoDetails: OutboundDetail[] = [
                {
                    id: '1',
                    outbound_header_id: '1',
                    line_number: 1,
                    item_id: '3',
                    item_code: 'FG-001',
                    item_name: 'Finished Product A',
                    hs_code: '3926.90.99',
                    ordered_quantity: 50,
                    shipped_quantity: 50,
                    unit: 'PCS',
                    unit_price: 150000,
                    total_price: 7500000,
                    batch_number: 'BATCH-2024-003',
                    location_code: 'C-01-01'
                }
            ];
            this.localStorageService.setItem(this.DETAIL_KEY, demoDetails);
        }
    }

    getAll(): Observable<OutboundHeader[]> {
        const headers = this.localStorageService.getItem<OutboundHeader[]>(this.HEADER_KEY) || [];
        return of(headers).pipe(delay(300));
    }

    getById(id: string): Observable<OutboundHeader> {
        const headers = this.localStorageService.getItem<OutboundHeader[]>(this.HEADER_KEY) || [];
        const header = headers.find(h => h.id === id);
        if (!header) {
            return throwError(() => ({ error: { message: 'Outbound not found' } }));
        }
        return of(header).pipe(delay(300));
    }

    /**
     * Create outbound with BC document validation
     * Requirements: 10.2, 10.3, 10.4
     */
    create(header: Partial<OutboundHeader>, details: Partial<OutboundDetail>[]): Observable<OutboundHeader> {
        // Validation
        if (!header.bc_document_id || !header.warehouse_id || !header.customer_id) {
            return throwError(() => ({ error: { message: 'BC Document, Warehouse, and Customer are required' } }));
        }

        // Check sufficient stock for all items (Requirement 10.4)
        for (const detail of details) {
            this.stockBalanceService.getBalance(detail.item_id!, header.warehouse_id).subscribe({
                next: (balance) => {
                    if (!balance || balance.available_quantity < (detail.shipped_quantity || 0)) {
                        throwError(() => ({ error: { message: `Insufficient stock for ${detail.item_name}` } }));
                    }
                }
            });
        }

        const headers = this.localStorageService.getItem<OutboundHeader[]>(this.HEADER_KEY) || [];
        const existingDetails = this.localStorageService.getItem<OutboundDetail[]>(this.DETAIL_KEY) || [];

        const newHeader: OutboundHeader = {
            id: Date.now().toString(),
            outbound_number: header.outbound_number || `OUT-${Date.now()}`,
            outbound_date: new Date(header.outbound_date || new Date()),
            status: OutboundStatus.PENDING,
            outbound_type: header.outbound_type || OutboundType.LOCAL,
            bc_document_id: header.bc_document_id,
            bc_document_number: header.bc_document_number || '',
            customer_id: header.customer_id,
            customer_code: header.customer_code || '',
            customer_name: header.customer_name || '',
            warehouse_id: header.warehouse_id,
            warehouse_code: header.warehouse_code || '',
            warehouse_name: header.warehouse_name || '',
            total_items: details.length,
            total_quantity: details.reduce((sum, d) => sum + (d.shipped_quantity || 0), 0),
            total_value: details.reduce((sum, d) => sum + (d.total_price || 0), 0),
            it_inventory_synced: false,
            created_at: new Date(),
            created_by: header.created_by || 'system',
            notes: header.notes
        };

        headers.push(newHeader);
        this.localStorageService.setItem(this.HEADER_KEY, headers);

        // Save details and update stock
        details.forEach((detail, index) => {
            const newDetail: OutboundDetail = {
                id: `${newHeader.id}-${index + 1}`,
                outbound_header_id: newHeader.id,
                line_number: index + 1,
                item_id: detail.item_id!,
                item_code: detail.item_code!,
                item_name: detail.item_name!,
                hs_code: detail.hs_code!,
                ordered_quantity: detail.ordered_quantity || 0,
                shipped_quantity: detail.shipped_quantity || 0,
                unit: detail.unit!,
                unit_price: detail.unit_price || 0,
                total_price: detail.total_price || 0,
                batch_number: detail.batch_number,
                location_code: detail.location_code,
                notes: detail.notes
            };
            existingDetails.push(newDetail);

            // Decrease stock (Requirement 10.3)
            this.stockBalanceService.updateBalance(
                newDetail.item_id,
                newHeader.warehouse_id,
                -newDetail.shipped_quantity,
                StockMovementType.OUTBOUND,
                newHeader.outbound_number,
                StockReferenceType.OUTBOUND_DELIVERY,
                newDetail.unit_price,
                newDetail.batch_number,
                newHeader.created_by
            ).subscribe();
        });

        this.localStorageService.setItem(this.DETAIL_KEY, existingDetails);

        return of(newHeader).pipe(delay(300));
    }

    update(id: string, updates: Partial<OutboundHeader>): Observable<OutboundHeader> {
        const headers = this.localStorageService.getItem<OutboundHeader[]>(this.HEADER_KEY) || [];
        const index = headers.findIndex(h => h.id === id);

        if (index === -1) {
            return throwError(() => ({ error: { message: 'Outbound not found' } }));
        }

        headers[index] = {
            ...headers[index],
            ...updates,
            updated_at: new Date(),
            updated_by: updates.updated_by || 'system'
        };

        this.localStorageService.setItem(this.HEADER_KEY, headers);
        return of(headers[index]).pipe(delay(300));
    }

    delete(id: string): Observable<void> {
        const headers = this.localStorageService.getItem<OutboundHeader[]>(this.HEADER_KEY) || [];
        const filtered = headers.filter(h => h.id !== id);
        this.localStorageService.setItem(this.HEADER_KEY, filtered);

        const details = this.localStorageService.getItem<OutboundDetail[]>(this.DETAIL_KEY) || [];
        const filteredDetails = details.filter(d => d.outbound_header_id !== id);
        this.localStorageService.setItem(this.DETAIL_KEY, filteredDetails);

        return of(void 0).pipe(delay(300));
    }

    getDetails(headerId: string): Observable<OutboundDetail[]> {
        const details = this.localStorageService.getItem<OutboundDetail[]>(this.DETAIL_KEY) || [];
        const filtered = details.filter(d => d.outbound_header_id === headerId);
        return of(filtered).pipe(delay(300));
    }

    ship(id: string, userId: string): Observable<OutboundHeader> {
        return this.update(id, {
            status: OutboundStatus.SHIPPED,
            updated_by: userId
        });
    }

    deliver(id: string, userId: string): Observable<OutboundHeader> {
        return this.update(id, {
            status: OutboundStatus.DELIVERED,
            delivery_date: new Date(),
            updated_by: userId
        });
    }

    /**
     * Get all outbounds
     */
    getAllOutbounds(): Observable<OutboundHeader[]> {
        const outbounds = this.localStorageService.getItem<OutboundHeader[]>(this.HEADER_KEY) || [];
        return of(outbounds).pipe(delay(200));
    }
}
