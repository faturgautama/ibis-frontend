import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { TabsModule } from 'primeng/tabs';
import { TimelineModule } from 'primeng/timeline';
import { TagModule } from 'primeng/tag';
import { TraceabilityService } from '../../services/traceability.service';

/**
 * Traceability View Component
 * Requirements: 13.1, 13.2, 13.3, 13.6, 13.7, 13.8
 */
@Component({
    selector: 'app-traceability-view',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        CardModule,
        TabsModule,
        TimelineModule,
        TagModule
    ],
    template: `
        <div class="p-6">
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 class="text-2xl font-bold text-gray-900 mb-4">Traceability System</h2>
                
                <!-- Search Section -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Item ID</label>
                        <input 
                            pInputText 
                            [(ngModel)]="searchItemId" 
                            placeholder="Enter Item ID"
                            class="w-full"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Batch Number</label>
                        <input 
                            pInputText 
                            [(ngModel)]="searchBatchNumber" 
                            placeholder="Enter Batch Number (optional)"
                            class="w-full"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">RFID Tag</label>
                        <input 
                            pInputText 
                            [(ngModel)]="searchRFIDValue" 
                            placeholder="Scan or enter RFID"
                            class="w-full"
                        />
                    </div>
                </div>

                <div class="flex gap-3">
                    <button 
                        pButton 
                        label="Trace Forward" 
                        icon="pi pi-arrow-right"
                        (click)="traceForward()"
                        class="p-button-primary"
                    ></button>
                    <button 
                        pButton 
                        label="Trace Backward" 
                        icon="pi pi-arrow-left"
                        (click)="traceBackward()"
                        class="p-button-secondary"
                    ></button>
                    <button 
                        pButton 
                        label="Search by RFID" 
                        icon="pi pi-qrcode"
                        (click)="searchRFID()"
                        class="p-button-info"
                        [disabled]="!searchRFIDValue"
                    ></button>
                    <button 
                        pButton 
                        label="Production History" 
                        icon="pi pi-history"
                        (click)="loadProductionHistory()"
                        class="p-button-help"
                    ></button>
                </div>
            </div>

            <!-- Results Section -->
            <p-tabs *ngIf="traceResults.length > 0 || productionHistory.length > 0">
                <p-tabpanel header="Traceability Chain" *ngIf="traceResults.length > 0">
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h3 class="text-xl font-semibold text-gray-900 mb-4">
                            {{ traceDirection === 'forward' ? 'Forward Trace' : 'Backward Trace' }}
                        </h3>
                        
                        <p-timeline [value]="traceResults" align="alternate">
                            <ng-template pTemplate="content" let-event>
                                <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div class="flex justify-between items-start mb-2">
                                        <h4 class="font-semibold text-gray-900">{{ event.movement_type }}</h4>
                                        <p-tag 
                                            [value]="event.reference_type" 
                                            [severity]="getMovementSeverity(event.movement_type)"
                                        ></p-tag>
                                    </div>
                                    <div class="text-sm text-gray-600 space-y-1">
                                        <p><strong>Date:</strong> {{ event.movement_date | date:'medium' }}</p>
                                        <p><strong>Reference:</strong> {{ event.reference_number }}</p>
                                        <p><strong>Quantity:</strong> {{ event.quantity_change }} {{ event.unit }}</p>
                                        <p *ngIf="event.batch_number"><strong>Batch:</strong> {{ event.batch_number }}</p>
                                        <p><strong>Warehouse:</strong> {{ event.warehouse_name }}</p>
                                        <p><strong>Balance After:</strong> {{ event.quantity_after }} {{ event.unit }}</p>
                                    </div>
                                </div>
                            </ng-template>
                        </p-timeline>
                    </div>
                </p-tabpanel>

                <p-tabpanel header="Production History" *ngIf="productionHistory.length > 0">
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h3 class="text-xl font-semibold text-gray-900 mb-4">Production Orders</h3>
                        
                        <p-table [value]="productionHistory" [paginator]="true" [rows]="10">
                            <ng-template pTemplate="header">
                                <tr>
                                    <th>WO Number</th>
                                    <th>Date</th>
                                    <th>Output Item</th>
                                    <th>Quantity</th>
                                    <th>Status</th>
                                    <th>Materials Used</th>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="body" let-order>
                                <tr>
                                    <td>{{ order.wo_number }}</td>
                                    <td>{{ order.wo_date | date:'short' }}</td>
                                    <td>{{ order.output_item_name }}</td>
                                    <td>{{ order.output_quantity }} {{ order.output_unit }}</td>
                                    <td>
                                        <p-tag 
                                            [value]="order.status" 
                                            [severity]="getStatusSeverity(order.status)"
                                        ></p-tag>
                                    </td>
                                    <td>
                                        <div *ngFor="let material of order.materials" class="text-sm">
                                            {{ material.material_item_name }}: {{ material.quantity_used }} {{ material.unit }}
                                        </div>
                                    </td>
                                </tr>
                            </ng-template>
                        </p-table>
                    </div>
                </p-tabpanel>
            </p-tabs>

            <!-- No Results -->
            <div *ngIf="searched && traceResults.length === 0 && productionHistory.length === 0" 
                 class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <p class="text-yellow-800">No traceability data found for the specified criteria.</p>
            </div>
        </div>
    `
})
export class TraceabilityViewComponent implements OnInit {
    private traceabilityService = inject(TraceabilityService);

    searchItemId = '';
    searchBatchNumber = '';
    searchRFIDValue = '';
    traceResults: any[] = [];
    productionHistory: any[] = [];
    traceDirection: 'forward' | 'backward' = 'forward';
    searched = false;

    ngOnInit(): void { }

    traceForward(): void {
        if (!this.searchItemId) return;

        this.traceDirection = 'forward';
        this.searched = true;
        this.productionHistory = [];

        this.traceabilityService.traceForward(
            this.searchItemId,
            this.searchBatchNumber || undefined
        ).subscribe(results => {
            this.traceResults = results;
        });
    }

    traceBackward(): void {
        if (!this.searchItemId) return;

        this.traceDirection = 'backward';
        this.searched = true;
        this.productionHistory = [];

        this.traceabilityService.traceBackward(
            this.searchItemId,
            this.searchBatchNumber || undefined
        ).subscribe(results => {
            this.traceResults = results;
        });
    }

    searchRFID(): void {
        if (!this.searchRFIDValue) return;

        this.searched = true;
        this.productionHistory = [];

        this.traceabilityService.searchByRFID(this.searchRFIDValue).subscribe(results => {
            this.traceResults = results || [];
        });
    }

    loadProductionHistory(): void {
        if (!this.searchItemId) return;

        this.searched = true;
        this.traceResults = [];

        this.traceabilityService.getProductionHistory(this.searchItemId).subscribe(history => {
            this.productionHistory = history;
        });
    }

    getMovementSeverity(movementType: string): any {
        const severityMap: Record<string, string> = {
            'INBOUND': 'success',
            'OUTBOUND': 'danger',
            'PRODUCTION_INPUT': 'warning',
            'PRODUCTION_OUTPUT': 'info',
            'TRANSFER_OUT': 'warning',
            'TRANSFER_IN': 'success',
            'ADJUSTMENT': 'secondary'
        };
        return severityMap[movementType] || 'info';
    }

    getStatusSeverity(status: string): any {
        const severityMap: Record<string, string> = {
            'COMPLETED': 'success',
            'IN_PROGRESS': 'warning',
            'PLANNED': 'info',
            'CANCELLED': 'danger'
        };
        return severityMap[status] || 'info';
    }
}
