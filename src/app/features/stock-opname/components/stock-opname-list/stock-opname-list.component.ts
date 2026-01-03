import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { StockOpnameService } from '../../services/stock-opname.service';

@Component({
    selector: 'app-stock-opname-list',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, TagModule],
    template: `
        <div class="p-6">
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-900">Stock Opname Sessions</h2>
                    <button pButton label="Create Opname" icon="pi pi-plus" class="p-button-primary"></button>
                </div>
                <p-table [value]="opnames" [paginator]="true" [rows]="10">
                    <ng-template pTemplate="header">
                        <tr>
                            <th>Opname Number</th>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Warehouse</th>
                            <th>Status</th>
                            <th>Total Difference</th>
                            <th>Actions</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-opname>
                        <tr>
                            <td>{{ opname.opname_number }}</td>
                            <td>{{ opname.opname_date | date:'short' }}</td>
                            <td>{{ opname.opname_type }}</td>
                            <td>{{ opname.warehouse_name }}</td>
                            <td><p-tag [value]="opname.status"></p-tag></td>
                            <td>{{ opname.total_difference || 0 }}</td>
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
export class StockOpnameListComponent implements OnInit {
    private opnameService = inject(StockOpnameService);
    opnames: any[] = [];

    ngOnInit(): void {
        this.opnameService.getAllOpnames().subscribe(data => {
            this.opnames = data;
        });
    }
}
