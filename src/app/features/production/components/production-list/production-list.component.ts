import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { LucideAngularModule, Factory } from 'lucide-angular';
import { ProductionDemoService } from '../../services/production-demo.service';

@Component({
    selector: 'app-production-list',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, TagModule, LucideAngularModule],
    template: `
        <div class="main-layout">
            <!-- Page Header -->
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <lucide-icon [img]="FactoryIcon" class="w-8 h-8 text-sky-600"></lucide-icon>
                    <div>
                        <h1 class="text-2xl font-semibold text-gray-900">Production Orders</h1>
                        <p class="text-sm text-gray-600 mt-1">Manage work orders and production</p>
                    </div>
                </div>
                <button pButton type="button" label="Create Work Order" icon="pi pi-plus" class="p-button-primary" (click)="onCreate()"></button>
            </div>

            <!-- Data Table -->
            <div class="bg-white rounded-lg shadow-sm" style="max-height: calc(100vh - 16rem); overflow-y: auto">
                <p-table [value]="productions" [paginator]="true" [rows]="20" [rowsPerPageOptions]="[10, 20, 50]" [showCurrentPageReport]="true" currentPageReportTemplate="Showing {first} to {last} of {totalRecords} work orders">
                    <ng-template pTemplate="header">
                        <tr>
                            <th>WO Number</th>
                            <th>Date</th>
                            <th>Output Item</th>
                            <th>Planned Qty</th>
                            <th>Actual Qty</th>
                            <th>Status</th>
                            <th class="text-center">Actions</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-prod>
                        <tr>
                            <td class="font-medium text-gray-900">{{ prod.wo_number }}</td>
                            <td>{{ prod.wo_date | date:'dd MMM yyyy' }}</td>
                            <td>{{ prod.output_item_name }}</td>
                            <td>{{ prod.planned_quantity }}</td>
                            <td>{{ prod.actual_quantity || '-' }}</td>
                            <td><p-tag [value]="prod.status"></p-tag></td>
                            <td class="text-center">
                                <div class="flex items-center justify-center gap-2">
                                    <button pButton type="button" icon="pi pi-pencil" class="p-button-text p-button-sm" pTooltip="Edit" (click)="onEdit(prod)"></button>
                                    <button pButton type="button" icon="pi pi-trash" class="p-button-text p-button-sm p-button-danger" pTooltip="Delete" (click)="onDelete(prod)"></button>
                                </div>
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="7" class="text-center py-8 text-gray-500">
                                No production orders found
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>
    `
})
export class ProductionListComponent implements OnInit {
    private router = inject(Router);
    private productionService = inject(ProductionDemoService);

    FactoryIcon = Factory;
    productions: any[] = [];

    ngOnInit(): void {
        this.productionService.getAllWorkOrders().subscribe(data => {
            this.productions = data;
        });
    }

    onCreate(): void {
        this.router.navigate(['/production/new']);
    }

    onEdit(production: any): void {
        this.router.navigate(['/production', production.id, 'edit']);
    }

    onDelete(production: any): void {
        // Implement delete logic
    }
}
