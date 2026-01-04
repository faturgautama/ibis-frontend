import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { LucideAngularModule, ClipboardList } from 'lucide-angular';
import { StockOpnameService } from '../../services/stock-opname.service';

@Component({
    selector: 'app-stock-opname-list',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, TagModule, TooltipModule, LucideAngularModule],
    template: `
        <div class="main-layout">
            <!-- Page Header -->
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <lucide-icon [img]="ClipboardListIcon" class="w-8 h-8 text-sky-600"></lucide-icon>
                    <div>
                        <h1 class="text-2xl font-semibold text-gray-900">Stock Opname Sessions</h1>
                        <p class="text-sm text-gray-600 mt-1">Manage stock counting and adjustments</p>
                    </div>
                </div>
                <button pButton type="button" label="Create Opname" icon="pi pi-plus" class="p-button-primary" (click)="onCreate()"></button>
            </div>

            <!-- Data Table -->
            <div class="bg-white rounded-lg shadow-sm p-6" style="max-height: calc(100vh - 16rem); overflow-y: auto">
                <p-table [value]="opnames" [paginator]="true" [rows]="20" [rowsPerPageOptions]="[10, 20, 50]" [showCurrentPageReport]="true" currentPageReportTemplate="Showing {first} to {last} of {totalRecords} opname sessions">
                    <ng-template pTemplate="header">
                        <tr>
                            <th>Opname Number</th>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Warehouse</th>
                            <th>Status</th>
                            <th>Total Difference</th>
                            <th class="text-center">Actions</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-opname>
                        <tr>
                            <td class="font-medium text-gray-900">{{ opname.opname_number }}</td>
                            <td>{{ opname.opname_date | date:'dd MMM yyyy' }}</td>
                            <td>{{ opname.opname_type }}</td>
                            <td>{{ opname.warehouse_name }}</td>
                            <td><p-tag [value]="opname.status"></p-tag></td>
                            <td>{{ opname.total_difference || 0 }}</td>
                            <td class="text-center">
                                <div class="flex items-center justify-center gap-2">
                                    <button pButton type="button" icon="pi pi-pencil" class="p-button-text p-button-sm" pTooltip="Edit" (click)="onEdit(opname)"></button>
                                    <button pButton type="button" icon="pi pi-trash" class="p-button-text p-button-sm p-button-danger" pTooltip="Delete" (click)="onDelete(opname)"></button>
                                </div>
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="7" class="text-center py-8 text-gray-500">
                                No stock opname sessions found
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>
    `
})
export class StockOpnameListComponent implements OnInit {
    private router = inject(Router);
    private opnameService = inject(StockOpnameService);

    ClipboardListIcon = ClipboardList;
    opnames: any[] = [];

    ngOnInit(): void {
        this.opnameService.getAllOpnames().subscribe(data => {
            this.opnames = data;
        });
    }

    onCreate(): void {
        this.router.navigate(['/stock-opname/new']);
    }

    onEdit(opname: any): void {
        this.router.navigate(['/stock-opname', opname.id, 'edit']);
    }

    onDelete(opname: any): void {
        // Implement delete logic
    }
}
