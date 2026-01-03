import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProductionDemoService } from '../../services/production-demo.service';

@Component({
    selector: 'app-production-list',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, TagModule],
    template: `
        <div class="p-6">
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-900">Production Orders</h2>
                    <button pButton label="Create Work Order" icon="pi pi-plus" class="p-button-primary"></button>
                </div>
                <p-table [value]="productions" [paginator]="true" [rows]="10">
                    <ng-template pTemplate="header">
                        <tr>
                            <th>WO Number</th>
                            <th>Date</th>
                            <th>Output Item</th>
                            <th>Planned Qty</th>
                            <th>Actual Qty</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-prod>
                        <tr>
                            <td>{{ prod.wo_number }}</td>
                            <td>{{ prod.wo_date | date:'short' }}</td>
                            <td>{{ prod.output_item_name }}</td>
                            <td>{{ prod.planned_quantity }}</td>
                            <td>{{ prod.actual_quantity || '-' }}</td>
                            <td><p-tag [value]="prod.status"></p-tag></td>
                            <td>
                                <button pButton icon="pi pi-eye" class="p-button-sm p-button-text"></button>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>
    `
})
export class ProductionListComponent implements OnInit {
    private productionService = inject(ProductionDemoService);
    productions: any[] = [];

    ngOnInit(): void {
        this.productionService.getAllWorkOrders().subscribe(data => {
            this.productions = data;
        });
    }
}
