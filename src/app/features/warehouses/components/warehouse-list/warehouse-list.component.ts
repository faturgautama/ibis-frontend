import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { WarehouseDemoService } from '../../../warehouse/services/warehouse-demo.service';

@Component({
    selector: 'app-warehouse-list',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, TagModule],
    template: `
        <div class="p-6">
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-900">Warehouses</h2>
                    <button pButton label="Add Warehouse" icon="pi pi-plus" class="p-button-primary"></button>
                </div>
                <p-table [value]="warehouses" [paginator]="true" [rows]="10">
                    <ng-template pTemplate="header">
                        <tr>
                            <th>Code</th>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Location</th>
                            <th>Capacity</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-warehouse>
                        <tr>
                            <td>{{ warehouse.code }}</td>
                            <td>{{ warehouse.name }}</td>
                            <td>{{ warehouse.type }}</td>
                            <td>{{ warehouse.location }}</td>
                            <td>{{ warehouse.capacity }}</td>
                            <td>
                                <p-tag 
                                    [value]="warehouse.is_active ? 'Active' : 'Inactive'" 
                                    [severity]="warehouse.is_active ? 'success' : 'secondary'"
                                ></p-tag>
                            </td>
                            <td>
                                <button pButton icon="pi pi-pencil" class="p-button-sm p-button-text"></button>
                                <button pButton icon="pi pi-trash" class="p-button-sm p-button-text p-button-danger"></button>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>
    `
})
export class WarehouseListComponent implements OnInit {
    private warehouseService = inject(WarehouseDemoService);
    warehouses: any[] = [];

    ngOnInit(): void {
        this.warehouseService.getAllWarehouses().subscribe(data => {
            this.warehouses = data;
        });
    }
}
