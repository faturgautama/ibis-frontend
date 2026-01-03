import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { InboundHeader, InboundDetail, InboundStatus, QualityStatus, validateHSCode } from '../models/inbound.model';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { StockBalanceService } from '../../stock-balance/services/stock-balance.service';
import { StockMovementType, StockReferenceType } from '../../stock-balance/models/stock-balance.model';

/**
 * Inbound Demo Service
 * Requirements: 6.1, 6.2, 6.3, 6.6, 6.8
 */
@Injectable({
    providedIn: 'root'
})
export class InboundDemoService {
    private localStorageService = inject(LocalStorageService);
    private stockBalanceService = inject(StockBalanceService);
    private readonly HEADER_KEY = 'inbound_headers';
    private readonly DETAIL_KEY = 'inbound_details';

    constructor() {
        this.initializeDemoData();
    }

    private initializeDemoData(): void {
        const existing = this.localStorageService.getItem<InboundHeader[]>(this.HEADER_KEY);
        if (!existing || existing.length === 0) {
            const demoHeaders: InboundHeader[] = [
                {
                    id: '1',
                    inbound_number: 'INB-2024-001',
                    inbound_date: new Date('2024-01-15'),
                    status: InboundStatus.COMPLETED,
                    bc_document_id: '1',
                    bc_document_number: 'BC23-2024-001',
                    supplier_id: '1',
                    supplier_code: 'SUP-001',
                    supplier_name: 'PT Supplier Indonesia',
                    warehouse_id: '1',
                    warehouse_code: 'WH-RM',
                    warehouse_name: 'Raw Material Warehouse',
                    receipt_number: 'RCP-2024-001',
                    receipt_date: new Date('2024-01-15'),
                    total_items: 1,
                    total_quantity: 1000,
                    total_value: 50000000,
                    quality_inspector: 'admin',
                    quality_inspection_date: new Date('2024-01-15'),
                    it_inventory_synced: true,
                    it_inventory_sync_date: new Date('2024-01-15'),
                    it_inventory_sync_status: 'SUCCESS',
                    created_at: new Date('2024-01-15'),
                    created_by: 'admin'
                }
            ];
            this.localStorageService.setItem(this.HEADER_KEY, demoHeaders);

            const demoDetails: InboundDetail[] = [
                {
                    id: '1',
                    inbound_header_id: '1',
                    line_number: 1,
                    item_id: '1',
                    item_code: 'RM-001',
                    item_name: 'Raw Material A',
                    hs_code: '3901.10.00',
                    ordered_quantity: 1000,
                    received_quantity: 1000,
                    accepted_quantity: 1000,
                    rejected_quantity: 0,
                    unit: 'KG',
                    unit_cost: 50000,
                    total_cost: 50000000,
                    batch_number: 'BATCH-2024-001',
                    expiry_date: new Date('2024-12-31'),
                    quality_status: QualityStatus.PASS,
                    location_code: 'A-01-01'
                }
            ];
            this.localStorageService.setItem(this.DETAIL_KEY, demoDetails);
        }
    }

    getAll(): Observable<InboundHeader[]> {
        const headers = this.localStorageService.getItem<InboundHeader[]>(this.HEADER_KEY) || [];
        return of(headers).pipe(delay(300));
    }

    getById(id: string): Observable<InboundHeader> {
        const headers = this.localStorageService.getItem<InboundHeader[]>(this.HEADER_KEY) || [];
        const header = headers.find(h => h.id === id);
        if (!header) {
            return throwError(() => ({ error: { message: 'Inbound not found' } }));
        }
        return of(header).pipe(delay(300));
    }

    create(header: Partial<InboundHeader>, details: Partial<InboundDetail>[]): Observable<InboundHeader> {
        // Validation
        if (!header.bc_document_id || !header.warehouse_id) {
            return throwError(() => ({ error: { message: 'BC Document and Warehouse are required' } }));
        }

        // Validate HS Code and unit for each detail
        for (const detail of details) {
            if (!validateHSCode(detail.hs_code || '')) {
                return throwError(() => ({ error: { message: `Invalid HS Code format: ${detail.hs_code}` } }));
            }
        }

        const headers = this.localStorageService.getItem<InboundHeader[]>(this.HEADER_KEY) || [];
        const existingDetails = this.localStorageService.getItem<InboundDetail[]>(this.DETAIL_KEY) || [];

        const newHeader: InboundHeader = {
            id: Date.now().toString(),
            inbound_number: header.inbound_number || `INB-${Date.now()}`,
            inbound_date: new Date(header.inbound_date || new Date()),
            status: InboundStatus.PENDING,
            bc_document_id: header.bc_document_id,
            bc_document_number: header.bc_document_number || '',
            supplier_id: header.supplier_id || '',
            supplier_code: header.supplier_code || '',
            supplier_name: header.supplier_name || '',
            warehouse_id: header.warehouse_id,
            warehouse_code: header.warehouse_code || '',
            warehouse_name: header.warehouse_name || '',
            total_items: details.length,
            total_quantity: details.reduce((sum, d) => sum + (d.received_quantity || 0), 0),
            total_value: details.reduce((sum, d) => sum + (d.total_cost || 0), 0),
            it_inventory_synced: false,
            created_at: new Date(),
            created_by: header.created_by || 'system'
        };

        headers.push(newHeader);
        this.localStorageService.setItem(this.HEADER_KEY, headers);

        // Save details
        details.forEach((detail, index) => {
            const newDetail: InboundDetail = {
                id: `${newHeader.id}-${index + 1}`,
                inbound_header_id: newHeader.id,
                line_number: index + 1,
                item_id: detail.item_id!,
                item_code: detail.item_code!,
                item_name: detail.item_name!,
                hs_code: detail.hs_code!,
                ordered_quantity: detail.ordered_quantity || 0,
                received_quantity: detail.received_quantity || 0,
                accepted_quantity: detail.accepted_quantity || 0,
                rejected_quantity: detail.rejected_quantity || 0,
                unit: detail.unit!,
                unit_cost: detail.unit_cost || 0,
                total_cost: detail.total_cost || 0,
                batch_number: detail.batch_number,
                expiry_date: detail.expiry_date ? new Date(detail.expiry_date) : undefined,
                quality_status: detail.quality_status || QualityStatus.PASS,
                location_code: detail.location_code
            };
            existingDetails.push(newDetail);

            // Update stock balance if quality is PASS
            if (newDetail.quality_status === QualityStatus.PASS && newDetail.accepted_quantity > 0) {
                this.stockBalanceService.updateBalance(
                    newDetail.item_id,
                    newHeader.warehouse_id,
                    newDetail.accepted_quantity,
                    StockMovementType.INBOUND,
                    newHeader.inbound_number,
                    StockReferenceType.INBOUND_RECEIPT,
                    newDetail.unit_cost,
                    newDetail.batch_number,
                    newHeader.created_by
                ).subscribe();
            }

            // Handle quarantine
            if (newDetail.quality_status === QualityStatus.QUARANTINE && detail.quarantine_warehouse_id) {
                this.stockBalanceService.updateBalance(
                    newDetail.item_id,
                    detail.quarantine_warehouse_id,
                    newDetail.received_quantity,
                    StockMovementType.INBOUND,
                    newHeader.inbound_number,
                    StockReferenceType.INBOUND_RECEIPT,
                    newDetail.unit_cost,
                    newDetail.batch_number,
                    newHeader.created_by
                ).subscribe();
            }
        });

        this.localStorageService.setItem(this.DETAIL_KEY, existingDetails);

        return of(newHeader).pipe(delay(300));
    }

    update(id: string, updates: Partial<InboundHeader>): Observable<InboundHeader> {
        const headers = this.localStorageService.getItem<InboundHeader[]>(this.HEADER_KEY) || [];
        const index = headers.findIndex(h => h.id === id);

        if (index === -1) {
            return throwError(() => ({ error: { message: 'Inbound not found' } }));
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
        const headers = this.localStorageService.getItem<InboundHeader[]>(this.HEADER_KEY) || [];
        const filtered = headers.filter(h => h.id !== id);
        this.localStorageService.setItem(this.HEADER_KEY, filtered);

        const details = this.localStorageService.getItem<InboundDetail[]>(this.DETAIL_KEY) || [];
        const filteredDetails = details.filter(d => d.inbound_header_id !== id);
        this.localStorageService.setItem(this.DETAIL_KEY, filteredDetails);

        return of(void 0).pipe(delay(300));
    }

    getDetails(headerId: string): Observable<InboundDetail[]> {
        const details = this.localStorageService.getItem<InboundDetail[]>(this.DETAIL_KEY) || [];
        const filtered = details.filter(d => d.inbound_header_id === headerId);
        return of(filtered).pipe(delay(300));
    }

    completeInbound(id: string, userId: string): Observable<InboundHeader> {
        return this.update(id, {
            status: InboundStatus.COMPLETED,
            updated_by: userId
        });
    }
}
