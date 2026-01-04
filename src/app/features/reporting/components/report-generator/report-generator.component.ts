import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ReportService, ReportParameters } from '../../services/report.service';

/**
 * Report Generator Component
 * Requirements: 17.1-17.10
 */
@Component({
    selector: 'app-report-generator',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        SelectModule,
        DatePickerModule,
        ButtonModule,
        TableModule
    ],
    template: `
        <div class="main-layout">
            <!-- Page Header -->
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                        <i class="pi pi-chart-bar text-sky-600"></i>
                        Report Generator
                    </h1>
                    <p class="text-sm text-gray-600 mt-1">Generate and export various inventory reports</p>
                </div>
            </div>

            <!-- Table Card -->
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
                <!-- Report Type Selection -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                        <p-select 
                            [(ngModel)]="selectedReportType"
                            [options]="reportTypes"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Select Report Type"
                            class="w-full"
                            (onChange)="onReportTypeChange()"
                        ></p-select>
                    </div>
                </div>

                <!-- Report Parameters -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <p-datepicker 
                            [(ngModel)]="parameters.start_date"
                            dateFormat="dd/mm/yy"
                            [showIcon]="true"
                            class="w-full"
                            appendTo="body"
                        ></p-datepicker>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                        <p-datepicker 
                            [(ngModel)]="parameters.end_date"
                            dateFormat="dd/mm/yy"
                            [showIcon]="true"
                            class="w-full"
                            appendTo="body"
                        ></p-datepicker>
                    </div>
                    <div *ngIf="showWarehouseFilter">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Warehouse</label>
                        <p-select 
                            [(ngModel)]="parameters.warehouse_id"
                            [options]="warehouses"
                            optionLabel="name"
                            optionValue="id"
                            placeholder="All Warehouses"
                            [showClear]="true"
                            class="w-full"
                            appendTo="body"
                        ></p-select>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-3">
                    <button 
                        pButton 
                        label="Generate Report" 
                        icon="pi pi-file"
                        (click)="generateReport()"
                        class="p-button-primary"
                        [disabled]="!selectedReportType"
                    ></button>
                    <button 
                        pButton 
                        label="Export to Excel" 
                        icon="pi pi-file-excel"
                        (click)="exportToExcel()"
                        class="p-button-success"
                        [disabled]="reportData.length === 0"
                    ></button>
                    <button 
                        pButton 
                        label="Export to PDF" 
                        icon="pi pi-file-pdf"
                        (click)="exportToPDF()"
                        class="p-button-danger"
                        [disabled]="reportData.length === 0"
                    ></button>
                </div>
            </div>

            <!-- Report Results -->
            <div *ngIf="reportData.length > 0" class="bg-white rounded-lg shadow-sm p-6">
                <h3 class="text-xl font-semibold text-gray-900 mb-4">
                    {{ getReportTitle() }}
                </h3>

                <!-- Inventory Balance Report -->
                <p-table 
                    *ngIf="selectedReportType === 'inventory_balance'"
                    [value]="reportData" 
                    [paginator]="true" 
                    [rows]="20"
                    [showCurrentPageReport]="true"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                >
                    <ng-template pTemplate="header">
                        <tr>
                            <th>Item Code</th>
                            <th>Item Name</th>
                            <th>Warehouse</th>
                            <th>Quantity</th>
                            <th>Unit</th>
                            <th>Unit Cost</th>
                            <th>Total Value</th>
                            <th>Batch</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-row>
                        <tr>
                            <td>{{ row.item_code }}</td>
                            <td>{{ row.item_name }}</td>
                            <td>{{ row.warehouse_name }}</td>
                            <td>{{ row.quantity }}</td>
                            <td>{{ row.unit }}</td>
                            <td>{{ formatCurrency(row.unit_cost) }}</td>
                            <td>{{ formatCurrency(row.total_value) }}</td>
                            <td>{{ row.batch_number || '-' }}</td>
                        </tr>
                    </ng-template>
                </p-table>

                <!-- Stock Movement Report -->
                <p-table 
                    *ngIf="selectedReportType === 'stock_movement'"
                    [value]="reportData" 
                    [paginator]="true" 
                    [rows]="20"
                >
                    <ng-template pTemplate="header">
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Item</th>
                            <th>Warehouse</th>
                            <th>Quantity</th>
                            <th>Reference</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-row>
                        <tr>
                            <td>{{ row.movement_date | date:'short' }}</td>
                            <td>{{ row.movement_type }}</td>
                            <td>{{ row.item_code }} - {{ row.item_name }}</td>
                            <td>{{ row.warehouse_name }}</td>
                            <td>{{ row.quantity_change }} {{ row.unit }}</td>
                            <td>{{ row.reference_number }}</td>
                        </tr>
                    </ng-template>
                </p-table>

                <!-- Inbound/Outbound Report -->
                <p-table 
                    *ngIf="selectedReportType === 'inbound_outbound'"
                    [value]="reportData" 
                    [paginator]="true" 
                    [rows]="20"
                >
                    <ng-template pTemplate="header">
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Document</th>
                            <th>Partner</th>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Value</th>
                            <th>BC Doc</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-row>
                        <tr>
                            <td>{{ row.transaction_date | date:'short' }}</td>
                            <td>{{ row.transaction_type }}</td>
                            <td>{{ row.document_number }}</td>
                            <td>{{ row.supplier_customer }}</td>
                            <td>{{ row.item_code }}</td>
                            <td>{{ row.quantity }} {{ row.unit }}</td>
                            <td>{{ formatCurrency(row.total_value) }}</td>
                            <td>{{ row.bc_document || '-' }}</td>
                        </tr>
                    </ng-template>
                </p-table>

                <!-- Production Report -->
                <p-table 
                    *ngIf="selectedReportType === 'production'"
                    [value]="reportData" 
                    [paginator]="true" 
                    [rows]="20"
                >
                    <ng-template pTemplate="header">
                        <tr>
                            <th>WO Number</th>
                            <th>Date</th>
                            <th>Output Item</th>
                            <th>Planned</th>
                            <th>Actual</th>
                            <th>Yield %</th>
                            <th>Scrap</th>
                            <th>Status</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-row>
                        <tr>
                            <td>{{ row.wo_number }}</td>
                            <td>{{ row.wo_date | date:'short' }}</td>
                            <td>{{ row.output_item_code }}</td>
                            <td>{{ row.planned_quantity }}</td>
                            <td>{{ row.actual_quantity }}</td>
                            <td>{{ row.yield_percentage }}%</td>
                            <td>{{ row.scrap_quantity }}</td>
                            <td>{{ row.status }}</td>
                        </tr>
                    </ng-template>
                </p-table>

                <!-- Generic Table for other reports -->
                <p-table 
                    *ngIf="!['inventory_balance', 'stock_movement', 'inbound_outbound', 'production'].includes(selectedReportType)"
                    [value]="reportData" 
                    [paginator]="true" 
                    [rows]="20"
                >
                    <ng-template pTemplate="header">
                        <tr>
                            <th *ngFor="let col of getColumns()">{{ col }}</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-row>
                        <tr>
                            <td *ngFor="let col of getColumns()">{{ row[col] }}</td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>

            <!-- No Results -->
            <div *ngIf="generated && reportData.length === 0" 
                 class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <p class="text-yellow-800">No data found for the selected criteria.</p>
            </div>
        </div>
    `
})
export class ReportGeneratorComponent implements OnInit {
    private reportService = inject(ReportService);

    reportTypes = [
        { label: 'Inventory Balance', value: 'inventory_balance' },
        { label: 'Stock Movement', value: 'stock_movement' },
        { label: 'Inbound/Outbound', value: 'inbound_outbound' },
        { label: 'Production', value: 'production' },
        { label: 'Traceability', value: 'traceability' },
        { label: 'Customs Documents', value: 'customs_documents' },
        { label: 'Audit Trail', value: 'audit_trail' }
    ];

    warehouses: any[] = [];
    selectedReportType = '';
    parameters: ReportParameters = {};
    reportData: any[] = [];
    generated = false;
    showWarehouseFilter = false;

    ngOnInit(): void {
        // Load warehouses for filter
        this.warehouses = [
            { id: '1', name: 'Raw Material Warehouse' },
            { id: '2', name: 'WIP Warehouse' },
            { id: '3', name: 'Finished Goods Warehouse' }
        ];
    }

    onReportTypeChange(): void {
        this.reportData = [];
        this.generated = false;
        this.showWarehouseFilter = ['inventory_balance', 'stock_movement'].includes(this.selectedReportType);
    }

    generateReport(): void {
        this.generated = true;

        switch (this.selectedReportType) {
            case 'inventory_balance':
                this.reportService.generateInventoryBalanceReport(this.parameters).subscribe(data => {
                    this.reportData = data;
                });
                break;
            case 'stock_movement':
                this.reportService.generateStockMovementReport(this.parameters).subscribe(data => {
                    this.reportData = data;
                });
                break;
            case 'inbound_outbound':
                this.reportService.generateInboundOutboundReport(this.parameters).subscribe(data => {
                    this.reportData = data;
                });
                break;
            case 'production':
                this.reportService.generateProductionReport(this.parameters).subscribe(data => {
                    this.reportData = data;
                });
                break;
            case 'customs_documents':
                this.reportService.generateCustomsDocumentReport(this.parameters).subscribe(data => {
                    this.reportData = data;
                });
                break;
            case 'audit_trail':
                this.reportService.generateAuditTrailReport(this.parameters).subscribe(data => {
                    this.reportData = data;
                });
                break;
        }
    }

    exportToExcel(): void {
        this.reportService.exportToExcel(this.reportData, this.getReportTitle()).subscribe(blob => {
            this.downloadFile(blob, `${this.getReportTitle()}.csv`);
        });
    }

    exportToPDF(): void {
        this.reportService.exportToPDF(this.reportData, this.getReportTitle()).subscribe(blob => {
            this.downloadFile(blob, `${this.getReportTitle()}.pdf`);
        });
    }

    downloadFile(blob: Blob, filename: string): void {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
    }

    getReportTitle(): string {
        const type = this.reportTypes.find(t => t.value === this.selectedReportType);
        return type ? type.label : 'Report';
    }

    getColumns(): string[] {
        if (this.reportData.length === 0) return [];
        return Object.keys(this.reportData[0]);
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    }
}
