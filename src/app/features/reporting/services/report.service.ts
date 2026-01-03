import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { LocalStorageService } from '../../../core/services/local-storage.service';

/**
 * Report Service
 * Requirements: 17.1-17.10
 */

export interface ReportParameters {
    start_date?: Date;
    end_date?: Date;
    warehouse_id?: string;
    item_id?: string;
    item_type?: string;
    status?: string;
}

export interface InventoryBalanceReport {
    item_code: string;
    item_name: string;
    warehouse_name: string;
    quantity: number;
    unit: string;
    unit_cost: number;
    total_value: number;
    batch_number?: string;
    expiry_date?: Date;
}

export interface StockMovementReport {
    movement_date: Date;
    movement_type: string;
    item_code: string;
    item_name: string;
    warehouse_name: string;
    quantity_change: number;
    unit: string;
    reference_number: string;
    batch_number?: string;
}

export interface InboundOutboundReport {
    transaction_date: Date;
    transaction_type: 'INBOUND' | 'OUTBOUND';
    document_number: string;
    supplier_customer: string;
    item_code: string;
    item_name: string;
    quantity: number;
    unit: string;
    unit_price: number;
    total_value: number;
    bc_document?: string;
}

export interface ProductionReport {
    wo_number: string;
    wo_date: Date;
    output_item_code: string;
    output_item_name: string;
    planned_quantity: number;
    actual_quantity: number;
    yield_percentage: number;
    scrap_quantity: number;
    status: string;
    materials_used: any[];
}

@Injectable({
    providedIn: 'root'
})
export class ReportService {
    private localStorageService = inject(LocalStorageService);

    /**
     * Generate Inventory Balance Report
     * Requirement: 17.1
     */
    generateInventoryBalanceReport(params: ReportParameters): Observable<InventoryBalanceReport[]> {
        let balances = this.localStorageService.getItem<any[]>('stock_balances') || [];

        // Apply filters
        if (params.warehouse_id) {
            balances = balances.filter(b => b.warehouse_id === params.warehouse_id);
        }
        if (params.item_id) {
            balances = balances.filter(b => b.item_id === params.item_id);
        }

        const report: InventoryBalanceReport[] = balances.map(b => ({
            item_code: b.item_code,
            item_name: b.item_name,
            warehouse_name: b.warehouse_name,
            quantity: b.quantity,
            unit: b.unit,
            unit_cost: b.unit_cost,
            total_value: b.total_value,
            batch_number: b.batch_number,
            expiry_date: b.expiry_date
        }));

        return of(report).pipe(delay(300));
    }

    /**
     * Generate Stock Movement Report
     * Requirement: 17.2
     */
    generateStockMovementReport(params: ReportParameters): Observable<StockMovementReport[]> {
        let history = this.localStorageService.getItem<any[]>('stock_history') || [];

        // Apply filters
        if (params.start_date) {
            history = history.filter(h => new Date(h.movement_date) >= params.start_date!);
        }
        if (params.end_date) {
            history = history.filter(h => new Date(h.movement_date) <= params.end_date!);
        }
        if (params.warehouse_id) {
            history = history.filter(h => h.warehouse_id === params.warehouse_id);
        }
        if (params.item_id) {
            history = history.filter(h => h.item_id === params.item_id);
        }

        const report: StockMovementReport[] = history.map(h => ({
            movement_date: h.movement_date,
            movement_type: h.movement_type,
            item_code: h.item_code,
            item_name: h.item_name,
            warehouse_name: h.warehouse_name,
            quantity_change: h.quantity_change,
            unit: h.unit,
            reference_number: h.reference_number,
            batch_number: h.batch_number
        }));

        return of(report).pipe(delay(300));
    }

    /**
     * Generate Inbound/Outbound Report
     * Requirement: 17.3
     */
    generateInboundOutboundReport(params: ReportParameters): Observable<InboundOutboundReport[]> {
        const inbounds = this.localStorageService.getItem<any[]>('inbound_headers') || [];
        const outbounds = this.localStorageService.getItem<any[]>('outbound_headers') || [];
        const inboundDetails = this.localStorageService.getItem<any[]>('inbound_details') || [];
        const outboundDetails = this.localStorageService.getItem<any[]>('outbound_details') || [];

        const report: InboundOutboundReport[] = [];

        // Process inbounds
        inbounds.forEach(inbound => {
            if (params.start_date && new Date(inbound.receipt_date) < params.start_date) return;
            if (params.end_date && new Date(inbound.receipt_date) > params.end_date) return;

            const details = inboundDetails.filter(d => d.inbound_header_id === inbound.id);
            details.forEach(detail => {
                report.push({
                    transaction_date: inbound.receipt_date,
                    transaction_type: 'INBOUND',
                    document_number: inbound.receipt_number,
                    supplier_customer: inbound.supplier_name,
                    item_code: detail.item_code,
                    item_name: detail.item_name,
                    quantity: detail.quantity,
                    unit: detail.unit,
                    unit_price: detail.unit_price,
                    total_value: detail.total_value,
                    bc_document: inbound.bc_document_number
                });
            });
        });

        // Process outbounds
        outbounds.forEach(outbound => {
            if (params.start_date && new Date(outbound.shipment_date) < params.start_date) return;
            if (params.end_date && new Date(outbound.shipment_date) > params.end_date) return;

            const details = outboundDetails.filter(d => d.outbound_header_id === outbound.id);
            details.forEach(detail => {
                report.push({
                    transaction_date: outbound.shipment_date,
                    transaction_type: 'OUTBOUND',
                    document_number: outbound.shipment_number,
                    supplier_customer: outbound.customer_name,
                    item_code: detail.item_code,
                    item_name: detail.item_name,
                    quantity: detail.quantity,
                    unit: detail.unit,
                    unit_price: detail.unit_price,
                    total_value: detail.total_value,
                    bc_document: outbound.bc_document_number
                });
            });
        });

        return of(report).pipe(delay(300));
    }

    /**
     * Generate Production Report
     * Requirement: 17.4
     */
    generateProductionReport(params: ReportParameters): Observable<ProductionReport[]> {
        let productions = this.localStorageService.getItem<any[]>('production_orders') || [];
        const materials = this.localStorageService.getItem<any[]>('production_materials') || [];

        // Apply filters
        if (params.start_date) {
            productions = productions.filter(p => new Date(p.wo_date) >= params.start_date!);
        }
        if (params.end_date) {
            productions = productions.filter(p => new Date(p.wo_date) <= params.end_date!);
        }
        if (params.status) {
            productions = productions.filter(p => p.status === params.status);
        }

        const report: ProductionReport[] = productions.map(p => ({
            wo_number: p.wo_number,
            wo_date: p.wo_date,
            output_item_code: p.output_item_code,
            output_item_name: p.output_item_name,
            planned_quantity: p.planned_quantity,
            actual_quantity: p.actual_quantity,
            yield_percentage: p.yield_percentage,
            scrap_quantity: p.scrap_quantity,
            status: p.status,
            materials_used: materials.filter(m => m.production_order_id === p.id)
        }));

        return of(report).pipe(delay(300));
    }

    /**
     * Generate Traceability Report
     * Requirement: 17.5
     */
    generateTraceabilityReport(itemId: string, batchNumber?: string): Observable<any[]> {
        const history = this.localStorageService.getItem<any[]>('stock_history') || [];

        let chain = history.filter(h => h.item_id === itemId);
        if (batchNumber) {
            chain = chain.filter(h => h.batch_number === batchNumber);
        }

        chain.sort((a, b) => new Date(a.movement_date).getTime() - new Date(b.movement_date).getTime());

        return of(chain).pipe(delay(300));
    }

    /**
     * Generate Customs Document Report
     * Requirement: 17.6
     */
    generateCustomsDocumentReport(params: ReportParameters): Observable<any[]> {
        let documents = this.localStorageService.getItem<any[]>('bc_documents') || [];

        if (params.start_date) {
            documents = documents.filter(d => new Date(d.document_date) >= params.start_date!);
        }
        if (params.end_date) {
            documents = documents.filter(d => new Date(d.document_date) <= params.end_date!);
        }
        if (params.status) {
            documents = documents.filter(d => d.status === params.status);
        }

        return of(documents).pipe(delay(300));
    }

    /**
     * Generate Audit Trail Report
     * Requirement: 17.7
     */
    generateAuditTrailReport(params: ReportParameters): Observable<any[]> {
        let auditLogs = this.localStorageService.getItem<any[]>('audit_logs') || [];

        if (params.start_date) {
            auditLogs = auditLogs.filter(a => new Date(a.timestamp) >= params.start_date!);
        }
        if (params.end_date) {
            auditLogs = auditLogs.filter(a => new Date(a.timestamp) <= params.end_date!);
        }

        return of(auditLogs).pipe(delay(300));
    }

    /**
     * Export to Excel (placeholder)
     * Requirement: 17.8
     */
    exportToExcel(data: any[], reportName: string): Observable<Blob> {
        // In production, use ExcelJS to generate actual Excel file
        const csvContent = this.convertToCSV(data);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        return of(blob).pipe(delay(500));
    }

    /**
     * Export to PDF (placeholder)
     * Requirement: 17.8
     */
    exportToPDF(data: any[], reportName: string): Observable<Blob> {
        // In production, use jsPDF to generate actual PDF file
        const textContent = JSON.stringify(data, null, 2);
        const blob = new Blob([textContent], { type: 'application/pdf' });
        return of(blob).pipe(delay(500));
    }

    /**
     * Helper: Convert data to CSV
     */
    private convertToCSV(data: any[]): string {
        if (data.length === 0) return '';

        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];

        data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header];
                return typeof value === 'string' ? `"${value}"` : value;
            });
            csvRows.push(values.join(','));
        });

        return csvRows.join('\n');
    }
}
