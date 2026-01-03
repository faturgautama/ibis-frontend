import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

// Lucide icons
import { LucideAngularModule, Users } from 'lucide-angular';

// Services
import { SupplierDemoService } from '../../services/supplier-demo.service';

// Models
import { Supplier } from '../../models/supplier.model';

/**
 * Supplier List Component
 * 
 * Displays suppliers in a data table with filtering, search, and CRUD actions.
 * Uses Tailwind CSS inline styling (no separate .scss file).
 * 
 * Requirements: 4.1, 4.2, 4.3
 */
@Component({
  selector: 'app-supplier-list',
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
    LucideAngularModule
  ],
  providers: [ConfirmationService],
  template: `
    <div class="main-layout">
      <!-- Page Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <lucide-icon [img]="UsersIcon" class="w-8 h-8 text-sky-600"></lucide-icon>
          <div>
            <h1 class="text-2xl font-semibold text-gray-900">Suppliers</h1>
            <p class="text-sm text-gray-600 mt-1">Manage supplier information</p>
          </div>
        </div>
        <button
          pButton
          type="button"
          label="Add Supplier"
          icon="pi pi-plus"
          class="p-button-primary"
          (click)="onCreateSupplier()"
        ></button>
      </div>

      <!-- Filters Section -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Search -->
          <div class="flex flex-col">
            <label class="text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              pInputText
              type="text"
              placeholder="Search by code, name, or tax ID..."
              [(ngModel)]="searchQuery"
              (input)="onSearchChange()"
              class="w-full"
            />
          </div>

          <!-- Status Filter -->
          <div class="flex flex-col">
            <label class="text-sm font-medium text-gray-700 mb-1">Status</label>
            <p-select
              [options]="statusOptions"
              [(ngModel)]="selectedStatus"
              (onChange)="onFilterChange()"
              placeholder="All Suppliers"
              [showClear]="true"
              class="w-full"
            ></p-select>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div *ngIf="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <p class="text-sm text-red-800">{{ error }}</p>
      </div>

      <!-- Data Table -->
      <div class="bg-white rounded-lg shadow-sm" style="max-height: calc(100vh - 20rem); overflow-y: auto">
        <p-table
          [value]="filteredSuppliers"
          [loading]="loading"
          [paginator]="true"
          [rows]="50"
          [rowsPerPageOptions]="[10, 25, 50, 100]"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} suppliers"
        >
          <ng-template pTemplate="header">
            <tr>
              <th class="text-left">Code</th>
              <th class="text-left">Name</th>
              <th class="text-left">Contact</th>
              <th class="text-left">Tax ID (NPWP)</th>
              <th class="text-center">Status</th>
              <th class="text-center">Actions</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-supplier>
            <tr class="hover:bg-gray-50">
              <td class="font-medium text-gray-900">{{ supplier.supplier_code }}</td>
              <td>
                <div class="text-gray-900">{{ supplier.supplier_name }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ supplier.city || supplier.address }}</div>
              </td>
              <td>
                <div class="text-sm text-gray-700">{{ supplier.contact_person || '-' }}</div>
                <div class="text-xs text-gray-500">{{ supplier.phone || '-' }}</div>
              </td>
              <td class="font-mono text-sm text-gray-700">{{ supplier.tax_id }}</td>
              <td class="text-center">
                <p-tag
                  [value]="supplier.active ? 'Active' : 'Inactive'"
                  [severity]="supplier.active ? 'success' : 'danger'"
                ></p-tag>
              </td>
              <td class="text-center">
                <div class="flex items-center justify-center gap-2">
                  <button
                    pButton
                    type="button"
                    icon="pi pi-pencil"
                    class="p-button-text p-button-sm p-button-info"
                    pTooltip="Edit"
                    tooltipPosition="top"
                    (click)="onEditSupplier(supplier)"
                  ></button>
                  <button
                    pButton
                    type="button"
                    icon="pi pi-trash"
                    class="p-button-text p-button-sm p-button-danger"
                    pTooltip="Delete"
                    tooltipPosition="top"
                    (click)="onDeleteSupplier(supplier)"
                  ></button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center py-8">
                <div class="flex flex-col items-center gap-2">
                  <lucide-icon [img]="UsersIcon" class="w-12 h-12 text-gray-400"></lucide-icon>
                  <p class="text-gray-600">No suppliers found</p>
                  <button
                    pButton
                    type="button"
                    label="Add First Supplier"
                    icon="pi pi-plus"
                    class="p-button-sm"
                    (click)="onCreateSupplier()"
                  ></button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <p-confirmDialog></p-confirmDialog>
    </div>
  `
})
export class SupplierListComponent implements OnInit {
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private supplierService = inject(SupplierDemoService);

  // Icons
  UsersIcon = Users;

  // Data
  suppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];
  loading = false;
  error: string | null = null;

  // Filters
  searchQuery = '';
  selectedStatus: boolean | null = null;

  statusOptions = [
    { label: 'Active Only', value: true },
    { label: 'Inactive Only', value: false }
  ];

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.loading = true;
    this.error = null;

    this.supplierService.getAll().subscribe({
      next: (suppliers) => {
        this.suppliers = suppliers;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to load suppliers';
        this.loading = false;
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
    let filtered = [...this.suppliers];

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.supplier_code.toLowerCase().includes(query) ||
        s.supplier_name.toLowerCase().includes(query) ||
        s.tax_id.toLowerCase().includes(query)
      );
    }

    if (this.selectedStatus !== null) {
      filtered = filtered.filter(s => s.active === this.selectedStatus);
    }

    this.filteredSuppliers = filtered;
  }

  onCreateSupplier(): void {
    this.router.navigate(['/suppliers/new']);
  }

  onEditSupplier(supplier: Supplier): void {
    this.router.navigate(['/suppliers', supplier.id, 'edit']);
  }

  onDeleteSupplier(supplier: Supplier): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete supplier "${supplier.supplier_name}"?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.supplierService.delete(supplier.id).subscribe({
          next: () => {
            this.loadSuppliers();
          },
          error: (error) => {
            this.error = error.error?.message || 'Failed to delete supplier';
          }
        });
      }
    });
  }
}
