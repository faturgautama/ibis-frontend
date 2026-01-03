import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule, Select } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProgressBarModule } from 'primeng/progressbar';

// Lucide icons
import { LucideAngularModule, Warehouse as WarehouseIcon, Search, Edit, Trash2, AlertTriangle, Plus } from 'lucide-angular';

// Services
import { WarehouseDemoService } from '../../services/warehouse-demo.service';
import { environment } from '../../../../../environments/environment';

// Models
import { Warehouse, WarehouseType } from '../../models/warehouse.model';

/**
 * Warehouse List Component
 * 
 * Displays warehouses in a data table with filtering, search, and CRUD actions.
 * Shows license expiry alerts and capacity/utilization metrics.
 * Uses Tailwind CSS inline styling (no separate .scss file).
 * 
 * Requirements: 3.1, 3.2, 3.4, 3.6
 */
@Component({
    selector: 'app-warehouse-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        SelectModule,
        TagModule,
        TooltipModule,
        ConfirmDialogModule,
        ProgressBarModule,
        LucideAngularModule,
    ],
    providers: [ConfirmationService, MessageService],
    template: `
    <div class="p-6">
      <!-- Page Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <lucide-icon [img]="WarehouseIconImg" class="w-6 h-6 text-sky-600"></lucide-icon>
            Warehouses
          </h1>
          <p class="text-sm text-gray-600 mt-1">Manage warehouse locations and capacity</p>
        </div>
        <button
          pButton
          type="button"
          label="Add Warehouse"
          icon="pi pi-plus"
          class="p-button-primary"
          (click)="onCreateWarehouse()"
        ></button>
      </div>

      <!-- License Expiry Alerts -->
      @if (expiringWarehouses.length > 0) {
        <div class="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <div class="flex items-start gap-3">
            <lucide-icon [img]="AlertTriangleIconImg" class="w-5 h-5 text-orange-600 mt-0.5"></lucide-icon>
            <div class="flex-1">
              <h3 class="text-sm font-semibold text-orange-900 mb-1">License Expiry Warning</h3>
              <p class="text-sm text-orange-800 mb-2">
                {{ expiringWarehouses.length }} warehouse(s) have licenses expiring within 30 days:
              </p>
              <ul class="text-sm text-orange-800 space-y-1">
                @for (warehouse of expiringWarehouses; track warehouse.id) {
                  <li class="flex items-center gap-2">
                    <span class="font-medium">{{ warehouse.warehouse_name }}</span>
                    <span class="text-orange-600">-</span>
                    <span>License expires: {{ warehouse.license_expiry | date:'mediumDate' }}</span>
                  </li>
                }
              </ul>
            </div>
          </div>
        </div>
      }

      <!-- Filters Section -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Search -->
          <div class="flex flex-col">
            <label class="text-sm font-medium text-gray-700 mb-1">Search</label>
            <span class="p-input-icon-left w-full">
              <lucide-icon [img]="SearchIconImg" class="w-4 h-4"></lucide-icon>
              <input
                pInputText
                type="text"
                placeholder="Search by code, name, or location..."
                [(ngModel)]="searchQuery"
                (input)="onSearchChange()"
                class="w-full"
              />
            </span>
          </div>

          <!-- Warehouse Type Filter -->
          <div class="flex flex-col">
            <label class="text-sm font-medium text-gray-700 mb-1">Warehouse Type</label>
            <p-select
              [options]="warehouseTypeOptions"
              [(ngModel)]="selectedWarehouseType"
              (onChange)="onFilterChange()"
              placeholder="All Types"
              [showClear]="true"
              styleClass="w-full"
            ></p-select>
          </div>

          <!-- Bonded Filter -->
          <div class="flex flex-col">
            <label class="text-sm font-medium text-gray-700 mb-1">Bonded Status</label>
            <p-select
              [options]="bondedOptions"
              [(ngModel)]="selectedBonded"
              (onChange)="onFilterChange()"
              placeholder="All Warehouses"
              [showClear]="true"
              styleClass="w-full"
            ></p-select>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      @if (error) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div class="flex items-center gap-2">
            <lucide-icon [img]="AlertTriangleIconImg" class="w-5 h-5 text-red-600"></lucide-icon>
            <p class="text-sm text-red-800">{{ error }}</p>
          </div>
        </div>
      }

      <!-- Data Table -->
      <div class="bg-white rounded-lg shadow-sm">
        <p-table
          [value]="filteredWarehouses"
          [loading]="loading"
          [paginator]="true"
          [rows]="50"
          [rowsPerPageOptions]="[10, 25, 50, 100]"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} warehouses"
          styleClass="p-datatable-sm"
          responsiveLayout="scroll"
        >
          <ng-template pTemplate="header">
            <tr>
              <th class="text-left">Code</th>
              <th class="text-left">Name</th>
              <th class="text-left">Type</th>
              <th class="text-left">Location</th>
              <th class="text-center">Bonded</th>
              <th class="text-center">Capacity</th>
              <th class="text-center">Status</th>
              <th class="text-center">Actions</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-warehouse>
            <tr class="hover:bg-gray-50">
              <!-- Code -->
              <td class="font-medium text-gray-900">
                {{ warehouse.warehouse_code }}
              </td>

              <!-- Name -->
              <td>
                <div class="flex items-center gap-2">
                  <span class="text-gray-900">{{ warehouse.warehouse_name }}</span>
                  @if (warehouse.is_bonded && isLicenseExpiringSoon(warehouse)) {
                    <lucide-icon
                      [img]="AlertTriangleIconImg"
                      class="w-4 h-4 text-orange-500"
                      pTooltip="License expiring soon"
                      tooltipPosition="top"
                    ></lucide-icon>
                  }
                </div>
                @if (warehouse.is_bonded && warehouse.license_number) {
                  <div class="text-xs text-gray-500 mt-1">
                    License: {{ warehouse.license_number }}
                    @if (warehouse.license_expiry) {
                      <span class="ml-1">(Expires: {{ warehouse.license_expiry | date:'shortDate' }})</span>
                    }
                  </div>
                }
              </td>

              <!-- Type -->
              <td>
                <p-tag
                  [value]="getWarehouseTypeLabel(warehouse.warehouse_type)"
                  [severity]="getWarehouseTypeSeverity(warehouse.warehouse_type)"
                ></p-tag>
              </td>

              <!-- Location -->
              <td class="text-gray-700">
                {{ warehouse.location }}
              </td>

              <!-- Bonded -->
              <td class="text-center">
                <p-tag
                  [value]="warehouse.is_bonded ? 'Bonded' : 'Non-Bonded'"
                  [severity]="warehouse.is_bonded ? 'info' : 'secondary'"
                ></p-tag>
              </td>

              <!-- Capacity -->
              <td>
                @if (warehouse.capacity) {
                  <div class="space-y-1">
                    <div class="flex justify-between text-xs text-gray-600">
                      <span>{{ warehouse.current_utilization || 0 }} / {{ warehouse.capacity }}</span>
                      <span>{{ getUtilizationPercentage(warehouse) }}%</span>
                    </div>
                    <p-progressBar
                      [value]="getUtilizationPercentage(warehouse)"
                      [showValue]="false"
                      [style]="{'height': '6px'}"
                    ></p-progressBar>
                  </div>
                } @else {
                  <span class="text-gray-400 text-sm">Not set</span>
                }
              </td>

              <!-- Status -->
              <td class="text-center">
                <p-tag
                  [value]="warehouse.active ? 'Active' : 'Inactive'"
                  [severity]="warehouse.active ? 'success' : 'danger'"
                ></p-tag>
              </td>

              <!-- Actions -->
              <td class="text-center">
                <div class="flex items-center justify-center gap-2">
                  <button
                    pButton
                    type="button"
                    icon="pi pi-pencil"
                    class="p-button-text p-button-sm p-button-info"
                    pTooltip="Edit"
                    tooltipPosition="top"
                    (click)="onEditWarehouse(warehouse)"
                  ></button>
                  <button
                    pButton
                    type="button"
                    icon="pi pi-trash"
                    class="p-button-text p-button-sm p-button-danger"
                    pTooltip="Delete"
                    tooltipPosition="top"
                    (click)="onDeleteWarehouse(warehouse)"
                  ></button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="8" class="text-center py-8">
                <div class="flex flex-col items-center gap-2">
                  <lucide-icon [img]="WarehouseIconImg" class="w-12 h-12 text-gray-400"></lucide-icon>
                  <p class="text-gray-600">No warehouses found</p>
                  <button
                    pButton
                    type="button"
                    label="Add First Warehouse"
                    icon="pi pi-plus"
                    class="p-button-sm"
                    (click)="onCreateWarehouse()"
                  ></button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- Confirmation Dialog -->
      <p-confirmDialog></p-confirmDialog>
    </div>
    `
})
export class WarehouseListComponent implements OnInit {
    private router = inject(Router);
    private confirmationService = inject(ConfirmationService);
    private warehouseService = inject(WarehouseDemoService);

    // Icons
    WarehouseIconImg = WarehouseIcon;
    SearchIconImg = Search;
    EditIconImg = Edit;
    Trash2IconImg = Trash2;
    AlertTriangleIconImg = AlertTriangle;
    PlusIconImg = Plus;

    // Data
    warehouses: Warehouse[] = [];
    filteredWarehouses: Warehouse[] = [];
    expiringWarehouses: Warehouse[] = [];
    loading = false;
    error: string | null = null;

    // Filter properties
    searchQuery = '';
    selectedWarehouseType: string | null = null;
    selectedBonded: boolean | null = null;

    // Dropdown options
    warehouseTypeOptions = [
        { label: 'Raw Material', value: WarehouseType.RAW_MATERIAL },
        { label: 'Work In Progress', value: WarehouseType.WIP },
        { label: 'Finished Goods', value: WarehouseType.FINISHED_GOODS },
        { label: 'Quarantine', value: WarehouseType.QUARANTINE }
    ];

    bondedOptions = [
        { label: 'Bonded Only', value: true },
        { label: 'Non-Bonded Only', value: false }
    ];

    ngOnInit(): void {
        this.loadWarehouses();
        this.loadExpiringLicenses();
    }

    loadWarehouses(): void {
        this.loading = true;
        this.error = null;

        this.warehouseService.getAll().subscribe({
            next: (warehouses) => {
                this.warehouses = warehouses;
                this.applyFilters();
                this.loading = false;
            },
            error: (error) => {
                this.error = error.error?.message || 'Failed to load warehouses';
                this.loading = false;
            }
        });
    }

    loadExpiringLicenses(): void {
        this.warehouseService.getExpiringLicenses(environment.alerts.licenseExpiryWarningDays).subscribe({
            next: (warehouses) => {
                this.expiringWarehouses = warehouses;
            },
            error: (error) => {
                console.error('Failed to load expiring licenses:', error);
            }
        });
    }

    onSearchChange(): void {
        this.applyFilters();
    }

    onFilterChange(): void {
        this.applyFilters();
    }

    applyFilters(): void {
        let filtered = [...this.warehouses];

        // Search filter
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(w =>
                w.warehouse_code.toLowerCase().includes(query) ||
                w.warehouse_name.toLowerCase().includes(query) ||
                w.location.toLowerCase().includes(query)
            );
        }

        // Type filter
        if (this.selectedWarehouseType) {
            filtered = filtered.filter(w => w.warehouse_type === this.selectedWarehouseType);
        }

        // Bonded filter
        if (this.selectedBonded !== null) {
            filtered = filtered.filter(w => w.is_bonded === this.selectedBonded);
        }

        this.filteredWarehouses = filtered;
    }

    onCreateWarehouse(): void {
        this.router.navigate(['/warehouses/new']);
    }

    onEditWarehouse(warehouse: Warehouse): void {
        this.router.navigate(['/warehouses', warehouse.id, 'edit']);
    }

    onDeleteWarehouse(warehouse: Warehouse): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete warehouse "${warehouse.warehouse_name}"?`,
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.warehouseService.delete(warehouse.id).subscribe({
                    next: () => {
                        this.loadWarehouses();
                        this.loadExpiringLicenses();
                    },
                    error: (error) => {
                        this.error = error.error?.message || 'Failed to delete warehouse';
                    }
                });
            }
        });
    }

    getWarehouseTypeLabel(type: WarehouseType): string {
        switch (type) {
            case WarehouseType.RAW_MATERIAL:
                return 'Raw Material';
            case WarehouseType.WIP:
                return 'WIP';
            case WarehouseType.FINISHED_GOODS:
                return 'Finished Goods';
            case WarehouseType.QUARANTINE:
                return 'Quarantine';
            default:
                return type;
        }
    }

    getWarehouseTypeSeverity(type: WarehouseType): any {
        switch (type) {
            case WarehouseType.RAW_MATERIAL:
                return 'info';
            case WarehouseType.WIP:
                return 'warning';
            case WarehouseType.FINISHED_GOODS:
                return 'success';
            case WarehouseType.QUARANTINE:
                return 'danger';
            default:
                return 'info';
        }
    }

    getUtilizationPercentage(warehouse: Warehouse): number {
        if (!warehouse.capacity || warehouse.capacity === 0) {
            return 0;
        }
        return Math.round(((warehouse.current_utilization || 0) / warehouse.capacity) * 100);
    }

    isLicenseExpiringSoon(warehouse: Warehouse): boolean {
        if (!warehouse.is_bonded || !warehouse.license_expiry) {
            return false;
        }

        const now = new Date();
        const expiryDate = new Date(warehouse.license_expiry);
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        return daysUntilExpiry <= environment.alerts.licenseExpiryWarningDays && daysUntilExpiry >= 0;
    }
}
