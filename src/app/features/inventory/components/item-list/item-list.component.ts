import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule, Select } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

// Lucide icons
import {
  LucideAngularModule,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  Package,
} from 'lucide-angular';

// Store
import { InventoryActions } from '../../../../store/inventory/inventory.actions';
import {
  selectFilteredItems,
  selectInventoryLoading,
  selectInventoryError,
} from '../../../../store/inventory/inventory.selectors';

// Models
import { Item, ItemType } from '../../models/item.model';

/**
 * Item List Component
 *
 * Displays inventory items in a data table with filtering, search, and CRUD actions.
 * Uses Tailwind CSS inline styling (no separate .scss file).
 *
 * Requirements: 2.1, 2.9, 7.8, 23.3
 */
@Component({
  selector: 'app-item-list',
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
    LucideAngularModule,
    IconFieldModule,
    InputIconModule,
  ],
  providers: [ConfirmationService],
  template: `
    <div class="">
      <!-- Page Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <lucide-icon [img]="PackageIcon" class="w-6 h-6 text-sky-600"></lucide-icon>
            Inventory Items
          </h1>
          <p class="text-sm text-gray-600 mt-1">Manage your inventory items and stock</p>
        </div>
        <button
          pButton
          type="button"
          label="Add Item"
          icon="pi pi-plus"
          class="p-button-primary"
          (click)="onCreateItem()"
        ></button>
      </div>

      <div
        class="flex flex-col w-full bg-white rounded-lg shadow-sm p-6"
        style="max-height: calc(100vh - 13rem); overflow-x: auto"
      >
        <!-- Filters Section -->
        <div class="mb-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Search -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">Search</label>
              <p-iconfield>
                <p-inputicon class="pi pi-search" />
                <input
                  type="text"
                  pInputText
                  placeholder="Search by code, name, or HS code..."
                  [(ngModel)]="searchQuery"
                  (input)="onSearchChange()"
                  class="w-full"
                />
              </p-iconfield>
            </div>

            <!-- Item Type Filter -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">Item Type</label>
              <p-select
                [options]="itemTypeOptions"
                [(ngModel)]="selectedItemType"
                (onChange)="onFilterChange()"
                placeholder="All Types"
                [showClear]="true"
                styleClass="w-full"
              ></p-select>
            </div>

            <!-- Hazardous Filter -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">Hazardous</label>
              <p-select
                [options]="hazardousOptions"
                [(ngModel)]="selectedHazardous"
                (onChange)="onFilterChange()"
                placeholder="All Items"
                [showClear]="true"
                styleClass="w-full"
              ></p-select>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div
          *ngIf="error$ | async as error"
          class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
        >
          <div class="flex items-center gap-2">
            <lucide-icon [img]="AlertTriangleIcon" class="w-5 h-5 text-red-600"></lucide-icon>
            <p class="text-sm text-red-800">{{ error }}</p>
          </div>
        </div>

        <!-- Data Table -->
        <div class="">
          <p-table
            [value]="(items$ | async) || []"
            [loading]="(loading$ | async) || false"
            [paginator]="true"
            [rows]="50"
            [rowsPerPageOptions]="[10, 25, 50, 100]"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} items"
            [globalFilterFields]="['item_code', 'item_name', 'hs_code']"
            styleClass="p-datatable-sm"
            responsiveLayout="scroll"
          >
            <ng-template pTemplate="header">
              <tr>
                <th class="text-left">Item Code</th>
                <th class="text-left">Item Name</th>
                <th class="text-left">HS Code</th>
                <th class="text-left">Type</th>
                <th class="text-left">Unit</th>
                <th class="text-center">Hazardous</th>
                <th class="text-center">Status</th>
                <th class="text-center">Actions</th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-item>
              <tr class="hover:bg-gray-50">
                <!-- Item Code -->
                <td class="font-medium text-gray-900">
                  {{ item.item_code }}
                </td>

                <!-- Item Name -->
                <td>
                  <div class="flex items-center gap-2">
                    <span class="text-gray-900">{{ item.item_name }}</span>
                    <lucide-icon
                      *ngIf="item.is_hazardous"
                      [img]="AlertTriangleIcon"
                      class="w-4 h-4 text-orange-500"
                      pTooltip="Hazardous Material"
                      tooltipPosition="top"
                    ></lucide-icon>
                  </div>
                  <div *ngIf="item.description" class="text-xs text-gray-500 mt-1">
                    {{ item.description }}
                  </div>
                </td>

                <!-- HS Code -->
                <td class="font-mono text-sm text-gray-700">
                  {{ item.hs_code }}
                </td>

                <!-- Type -->
                <td>
                  <p-tag
                    [value]="item.item_type"
                    [severity]="getItemTypeSeverity(item.item_type)"
                  ></p-tag>
                </td>

                <!-- Unit -->
                <td class="text-gray-700">
                  {{ item.unit }}
                </td>

                <!-- Hazardous -->
                <td class="text-center">
                  <span
                    *ngIf="item.is_hazardous"
                    class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100"
                  >
                    <lucide-icon
                      [img]="AlertTriangleIcon"
                      class="w-4 h-4 text-orange-600"
                    ></lucide-icon>
                  </span>
                  <span *ngIf="!item.is_hazardous" class="text-gray-400">-</span>
                </td>

                <!-- Status -->
                <td class="text-center">
                  <p-tag
                    [value]="item.active ? 'Active' : 'Inactive'"
                    [severity]="item.active ? 'success' : 'danger'"
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
                      (click)="onEditItem(item)"
                    ></button>
                    <button
                      pButton
                      type="button"
                      icon="pi pi-trash"
                      class="p-button-text p-button-sm p-button-danger"
                      pTooltip="Delete"
                      tooltipPosition="top"
                      (click)="onDeleteItem(item)"
                    ></button>
                  </div>
                </td>
              </tr>
            </ng-template>

            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="8" class="text-center py-8">
                  <div class="flex flex-col items-center gap-2">
                    <lucide-icon [img]="PackageIcon" class="w-12 h-12 text-gray-400"></lucide-icon>
                    <p class="text-gray-600">No items found</p>
                    <button
                      pButton
                      type="button"
                      label="Add First Item"
                      icon="pi pi-plus"
                      class="p-button-sm"
                      (click)="onCreateItem()"
                    ></button>
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>

      <!-- Confirmation Dialog -->
      <p-confirmDialog></p-confirmDialog>
    </div>
  `,
})
export class ItemListComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);

  // Icons
  PackageIcon = Package;
  SearchIcon = Search;
  EditIcon = Edit;
  Trash2Icon = Trash2;
  AlertTriangleIcon = AlertTriangle;
  PlusIcon = Plus;

  // Observables
  items$: Observable<Item[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  // Filter properties
  searchQuery = '';
  selectedItemType: string | null = null;
  selectedHazardous: boolean | null = null;

  // Dropdown options
  itemTypeOptions = [
    { label: 'Raw Material', value: ItemType.RAW },
    { label: 'Work In Progress', value: ItemType.WIP },
    { label: 'Finished Goods', value: ItemType.FG },
    { label: 'Asset', value: ItemType.ASSET },
  ];

  hazardousOptions = [
    { label: 'Hazardous Only', value: true },
    { label: 'Non-Hazardous Only', value: false },
  ];

  constructor() {
    this.items$ = this.store.select(selectFilteredItems);
    this.loading$ = this.store.select(selectInventoryLoading);
    this.error$ = this.store.select(selectInventoryError);
  }

  ngOnInit(): void {
    // Load items on component initialization
    this.store.dispatch(InventoryActions.loadItems());
  }

  onSearchChange(): void {
    this.store.dispatch(
      InventoryActions.setFilters({
        filters: { searchQuery: this.searchQuery },
      })
    );
  }

  onFilterChange(): void {
    this.store.dispatch(
      InventoryActions.setFilters({
        filters: {
          itemType: this.selectedItemType || undefined,
          isHazardous: this.selectedHazardous !== null ? this.selectedHazardous : undefined,
        },
      })
    );
  }

  onCreateItem(): void {
    this.router.navigate(['/inventory/items/new']);
  }

  onEditItem(item: Item): void {
    this.router.navigate(['/inventory/items', item.id, 'edit']);
  }

  onDeleteItem(item: Item): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete item "${item.item_name}"?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.store.dispatch(InventoryActions.deleteItem({ id: item.id }));
      },
    });
  }

  getItemTypeSeverity(itemType: ItemType): any {
    switch (itemType) {
      case ItemType.RAW:
        return 'info';
      case ItemType.WIP:
        return 'warning';
      case ItemType.FG:
        return 'success';
      case ItemType.ASSET:
        return 'danger';
      default:
        return 'info';
    }
  }
}
