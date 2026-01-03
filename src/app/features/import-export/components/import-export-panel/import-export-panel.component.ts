import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { MessageModule } from 'primeng/message';
import { ImportExportService, ImportResult, ExportHistory } from '../../services/import-export.service';

/**
 * Import/Export Panel Component
 * Requirements: 21.1-21.7
 */
@Component({
    selector: 'app-import-export-panel',
    standalone: true,
    imports: [
        CommonModule,
        FileUploadModule,
        ButtonModule,
        CardModule,
        TableModule,
        TabsModule,
        MessageModule
    ],
    template: `
        <div class="p-6">
            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">Data Import & Export</h2>

                <p-tabs>
                    <!-- Import Tab -->
                    <p-tabpanel header="Import Data">
                        <div class="space-y-6 py-4">
                            <!-- Import Items -->
                            <div class="border border-gray-200 rounded-lg p-4">
                                <h3 class="text-lg font-semibold text-gray-900 mb-3">Import Items</h3>
                                <p class="text-sm text-gray-600 mb-4">
                                    Upload CSV file with columns: code, name, type, unit, hs_code, description
                                </p>
                                <p-fileUpload 
                                    mode="basic"
                                    accept=".csv,.xlsx"
                                    [maxFileSize]="10000000"
                                    [auto]="true"
                                    chooseLabel="Choose File"
                                    (onSelect)="onImportItems($event)"
                                    class="mb-3"
                                ></p-fileUpload>
                                
                                <div *ngIf="importResult" class="mt-4">
                                    <p-message 
                                        [severity]="importResult.success ? 'success' : 'warn'"
                                        [text]="getImportMessage(importResult)"
                                    ></p-message>
                                    
                                    <div *ngIf="importResult.errors.length > 0" class="mt-3">
                                        <h4 class="font-semibold text-red-600 mb-2">Errors:</h4>
                                        <ul class="list-disc list-inside text-sm text-red-600">
                                            <li *ngFor="let error of importResult.errors.slice(0, 10)">
                                                Row {{ error.row }}: {{ error.message }}
                                            </li>
                                        </ul>
                                        <p *ngIf="importResult.errors.length > 10" class="text-sm text-gray-600 mt-2">
                                            ... and {{ importResult.errors.length - 10 }} more errors
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <!-- Import Suppliers -->
                            <div class="border border-gray-200 rounded-lg p-4">
                                <h3 class="text-lg font-semibold text-gray-900 mb-3">Import Suppliers</h3>
                                <p class="text-sm text-gray-600 mb-4">
                                    Upload CSV file with columns: code, name, npwp, address, phone, email
                                </p>
                                <p-fileUpload 
                                    mode="basic"
                                    accept=".csv,.xlsx"
                                    [maxFileSize]="10000000"
                                    [auto]="true"
                                    chooseLabel="Choose File"
                                    (onSelect)="onImportSuppliers($event)"
                                ></p-fileUpload>
                            </div>

                            <!-- Import Customers -->
                            <div class="border border-gray-200 rounded-lg p-4">
                                <h3 class="text-lg font-semibold text-gray-900 mb-3">Import Customers</h3>
                                <p class="text-sm text-gray-600 mb-4">
                                    Upload CSV file with columns: code, name, npwp, address, phone, email
                                </p>
                                <p-fileUpload 
                                    mode="basic"
                                    accept=".csv,.xlsx"
                                    [maxFileSize]="10000000"
                                    [auto]="true"
                                    chooseLabel="Choose File"
                                    (onSelect)="onImportCustomers($event)"
                                ></p-fileUpload>
                            </div>

                            <!-- Download Templates -->
                            <div class="border border-blue-200 bg-blue-50 rounded-lg p-4">
                                <h3 class="text-lg font-semibold text-blue-900 mb-3">Download Templates</h3>
                                <div class="flex gap-3">
                                    <button 
                                        pButton 
                                        label="Items Template" 
                                        icon="pi pi-download"
                                        (click)="downloadTemplate('items')"
                                        class="p-button-sm"
                                    ></button>
                                    <button 
                                        pButton 
                                        label="Suppliers Template" 
                                        icon="pi pi-download"
                                        (click)="downloadTemplate('suppliers')"
                                        class="p-button-sm"
                                    ></button>
                                    <button 
                                        pButton 
                                        label="Customers Template" 
                                        icon="pi pi-download"
                                        (click)="downloadTemplate('customers')"
                                        class="p-button-sm"
                                    ></button>
                                </div>
                            </div>
                        </div>
                    </p-tabpanel>

                    <!-- Export Tab -->
                    <p-tabpanel header="Export Data">
                        <div class="space-y-4 py-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <!-- Export Items -->
                                <div class="border border-gray-200 rounded-lg p-4">
                                    <h3 class="font-semibold text-gray-900 mb-2">Items</h3>
                                    <p class="text-sm text-gray-600 mb-3">Export all items master data</p>
                                    <button 
                                        pButton 
                                        label="Export CSV" 
                                        icon="pi pi-download"
                                        (click)="exportData('items')"
                                        class="w-full p-button-sm"
                                    ></button>
                                </div>

                                <!-- Export Stock Balance -->
                                <div class="border border-gray-200 rounded-lg p-4">
                                    <h3 class="font-semibold text-gray-900 mb-2">Stock Balance</h3>
                                    <p class="text-sm text-gray-600 mb-3">Export current stock balance</p>
                                    <button 
                                        pButton 
                                        label="Export CSV" 
                                        icon="pi pi-download"
                                        (click)="exportData('stock_balance')"
                                        class="w-full p-button-sm"
                                    ></button>
                                </div>

                                <!-- Export Inbound -->
                                <div class="border border-gray-200 rounded-lg p-4">
                                    <h3 class="font-semibold text-gray-900 mb-2">Inbound</h3>
                                    <p class="text-sm text-gray-600 mb-3">Export inbound transactions</p>
                                    <button 
                                        pButton 
                                        label="Export CSV" 
                                        icon="pi pi-download"
                                        (click)="exportData('inbound')"
                                        class="w-full p-button-sm"
                                    ></button>
                                </div>

                                <!-- Export Outbound -->
                                <div class="border border-gray-200 rounded-lg p-4">
                                    <h3 class="font-semibold text-gray-900 mb-2">Outbound</h3>
                                    <p class="text-sm text-gray-600 mb-3">Export outbound transactions</p>
                                    <button 
                                        pButton 
                                        label="Export CSV" 
                                        icon="pi pi-download"
                                        (click)="exportData('outbound')"
                                        class="w-full p-button-sm"
                                    ></button>
                                </div>

                                <!-- Export Production -->
                                <div class="border border-gray-200 rounded-lg p-4">
                                    <h3 class="font-semibold text-gray-900 mb-2">Production</h3>
                                    <p class="text-sm text-gray-600 mb-3">Export production orders</p>
                                    <button 
                                        pButton 
                                        label="Export CSV" 
                                        icon="pi pi-download"
                                        (click)="exportData('production')"
                                        class="w-full p-button-sm"
                                    ></button>
                                </div>

                                <!-- Export Suppliers -->
                                <div class="border border-gray-200 rounded-lg p-4">
                                    <h3 class="font-semibold text-gray-900 mb-2">Suppliers</h3>
                                    <p class="text-sm text-gray-600 mb-3">Export suppliers master data</p>
                                    <button 
                                        pButton 
                                        label="Export CSV" 
                                        icon="pi pi-download"
                                        (click)="exportData('suppliers')"
                                        class="w-full p-button-sm"
                                    ></button>
                                </div>
                            </div>
                        </div>
                    </p-tabpanel>

                    <!-- Export History Tab -->
                    <p-tabpanel header="Export History">
                        <div class="py-4">
                            <p-table [value]="exportHistory" [paginator]="true" [rows]="10">
                                <ng-template pTemplate="header">
                                    <tr>
                                        <th>Export Type</th>
                                        <th>File Name</th>
                                        <th>Records</th>
                                        <th>File Size</th>
                                        <th>Exported At</th>
                                        <th>Exported By</th>
                                    </tr>
                                </ng-template>
                                <ng-template pTemplate="body" let-history>
                                    <tr>
                                        <td>{{ history.export_type }}</td>
                                        <td>{{ history.file_name }}</td>
                                        <td>{{ history.record_count }}</td>
                                        <td>{{ formatFileSize(history.file_size) }}</td>
                                        <td>{{ history.exported_at | date:'short' }}</td>
                                        <td>{{ history.exported_by }}</td>
                                    </tr>
                                </ng-template>
                                <ng-template pTemplate="emptymessage">
                                    <tr>
                                        <td colspan="6" class="text-center text-gray-500 py-4">
                                            No export history
                                        </td>
                                    </tr>
                                </ng-template>
                            </p-table>
                        </div>
                    </p-tabpanel>
                </p-tabs>
            </div>
        </div>
    `
})
export class ImportExportPanelComponent implements OnInit {
    private importExportService = inject(ImportExportService);

    importResult: ImportResult | null = null;
    exportHistory: ExportHistory[] = [];

    ngOnInit(): void {
        this.loadExportHistory();
    }

    loadExportHistory(): void {
        this.importExportService.getExportHistory().subscribe(history => {
            this.exportHistory = history;
        });
    }

    onImportItems(event: any): void {
        const file = event.files[0];
        this.importExportService.importItems(file).subscribe({
            next: (result) => {
                this.importResult = result;
            },
            error: (err) => {
                console.error('Import failed:', err);
                alert('Import failed: ' + err.error?.message);
            }
        });
    }

    onImportSuppliers(event: any): void {
        const file = event.files[0];
        this.importExportService.importSuppliers(file).subscribe({
            next: (result) => {
                this.importResult = result;
            },
            error: (err) => console.error('Import failed:', err)
        });
    }

    onImportCustomers(event: any): void {
        const file = event.files[0];
        this.importExportService.importCustomers(file).subscribe({
            next: (result) => {
                this.importResult = result;
            },
            error: (err) => console.error('Import failed:', err)
        });
    }

    exportData(type: string): void {
        let observable;
        let filename;

        switch (type) {
            case 'items':
                observable = this.importExportService.exportItems();
                filename = 'items_export.csv';
                break;
            case 'stock_balance':
                observable = this.importExportService.exportStockBalance();
                filename = 'stock_balance.csv';
                break;
            case 'inbound':
                observable = this.importExportService.exportTransactions('inbound');
                filename = 'inbound_export.csv';
                break;
            case 'outbound':
                observable = this.importExportService.exportTransactions('outbound');
                filename = 'outbound_export.csv';
                break;
            case 'production':
                observable = this.importExportService.exportTransactions('production');
                filename = 'production_export.csv';
                break;
            default:
                return;
        }

        observable.subscribe(blob => {
            this.importExportService.downloadFile(blob, filename);
            this.loadExportHistory();
        });
    }

    downloadTemplate(type: string): void {
        let csv = '';
        let filename = '';

        switch (type) {
            case 'items':
                csv = 'code,name,type,unit,hs_code,description\nITEM-001,Sample Item,RAW,KG,1234.56.78,Sample description';
                filename = 'items_template.csv';
                break;
            case 'suppliers':
                csv = 'code,name,npwp,address,phone,email\nSUP-001,Sample Supplier,01.234.567.8-901.000,Jakarta,+62-21-1234567,supplier@example.com';
                filename = 'suppliers_template.csv';
                break;
            case 'customers':
                csv = 'code,name,npwp,address,phone,email\nCUST-001,Sample Customer,01.234.567.8-901.000,Jakarta,+62-21-1234567,customer@example.com';
                filename = 'customers_template.csv';
                break;
        }

        const blob = new Blob([csv], { type: 'text/csv' });
        this.importExportService.downloadFile(blob, filename);
    }

    getImportMessage(result: ImportResult): string {
        return `Imported ${result.imported_records} of ${result.total_records} records. ${result.failed_records} failed.`;
    }

    formatFileSize(bytes: number): string {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
}
