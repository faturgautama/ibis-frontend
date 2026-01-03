import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { LucideAngularModule, Users } from 'lucide-angular';
import { CustomerDemoService } from '../../services/customer-demo.service';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, SelectModule, TagModule, TooltipModule, ConfirmDialogModule, LucideAngularModule],
  providers: [ConfirmationService],
  template: `
    <div class="main-layout">
      <!-- Page Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <lucide-icon [img]="UsersIcon" class="w-8 h-8 text-sky-600"></lucide-icon>
          <div>
            <h1 class="text-2xl font-semibold text-gray-900">Customers</h1>
            <p class="text-sm text-gray-600 mt-1">Manage customer information</p>
          </div>
        </div>
        <button pButton type="button" label="Add Customer" icon="pi pi-plus" class="p-button-primary" (click)="onCreateCustomer()"></button>
      </div>

      <!-- Filters Section -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col">
            <label class="text-sm font-medium text-gray-700 mb-1">Search</label>
            <input pInputText type="text" placeholder="Search..." [(ngModel)]="searchQuery" (input)="onSearchChange()" class="w-full" />
          </div>
          <div class="flex flex-col">
            <label class="text-sm font-medium text-gray-700 mb-1">Status</label>
            <p-select [options]="statusOptions" [(ngModel)]="selectedStatus" (onChange)="onFilterChange()" placeholder="All Customers" [showClear]="true" class="w-full"></p-select>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div *ngIf="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <p class="text-sm text-red-800">{{ error }}</p>
      </div>

      <!-- Data Table -->
      <div class="bg-white rounded-lg shadow-sm" style="max-height: calc(100vh - 20rem); overflow-y: auto">
        <p-table [value]="filteredCustomers" [loading]="loading" [paginator]="true" [rows]="50" [rowsPerPageOptions]="[10, 25, 50, 100]" [showCurrentPageReport]="true" currentPageReportTemplate="Showing {first} to {last} of {totalRecords} customers">
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
          <ng-template pTemplate="body" let-customer>
            <tr class="hover:bg-gray-50">
              <td class="font-medium text-gray-900">{{ customer.customer_code }}</td>
              <td>
                <div class="text-gray-900">{{ customer.customer_name }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ customer.city || customer.address }}</div>
              </td>
              <td>
                <div class="text-sm text-gray-700">{{ customer.contact_person || '-' }}</div>
                <div class="text-xs text-gray-500">{{ customer.phone || '-' }}</div>
              </td>
              <td class="font-mono text-sm text-gray-700">{{ customer.tax_id }}</td>
              <td class="text-center">
                <p-tag [value]="customer.active ? 'Active' : 'Inactive'" [severity]="customer.active ? 'success' : 'danger'"></p-tag>
              </td>
              <td class="text-center">
                <div class="flex items-center justify-center gap-2">
                  <button pButton type="button" icon="pi pi-pencil" class="p-button-text p-button-sm p-button-info" pTooltip="Edit" tooltipPosition="top" (click)="onEditCustomer(customer)"></button>
                  <button pButton type="button" icon="pi pi-trash" class="p-button-text p-button-sm p-button-danger" pTooltip="Delete" tooltipPosition="top" (click)="onDeleteCustomer(customer)"></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center py-8">
                <div class="flex flex-col items-center gap-2">
                  <lucide-icon [img]="UsersIcon" class="w-12 h-12 text-gray-400"></lucide-icon>
                  <p class="text-gray-600">No customers found</p>
                  <button pButton type="button" label="Add First Customer" icon="pi pi-plus" class="p-button-sm" (click)="onCreateCustomer()"></button>
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
export class CustomerListComponent implements OnInit {
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private customerService = inject(CustomerDemoService);

  UsersIcon = Users;

  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  loading = false;
  error: string | null = null;
  searchQuery = '';
  selectedStatus: boolean | null = null;
  statusOptions = [{ label: 'Active Only', value: true }, { label: 'Inactive Only', value: false }];

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading = true;
    this.error = null;
    this.customerService.getAll().subscribe({
      next: (customers) => {
        this.customers = customers;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to load customers';
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
    let filtered = [...this.customers];
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(c => c.customer_code.toLowerCase().includes(query) || c.customer_name.toLowerCase().includes(query) || c.tax_id.toLowerCase().includes(query));
    }
    if (this.selectedStatus !== null) {
      filtered = filtered.filter(c => c.active === this.selectedStatus);
    }
    this.filteredCustomers = filtered;
  }

  onCreateCustomer(): void {
    this.router.navigate(['/customers/new']);
  }

  onEditCustomer(customer: Customer): void {
    this.router.navigate(['/customers', customer.id, 'edit']);
  }

  onDeleteCustomer(customer: Customer): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete customer "${customer.customer_name}"?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.customerService.delete(customer.id).subscribe({
          next: () => {
            this.loadCustomers();
          },
          error: (error) => {
            this.error = error.error?.message || 'Failed to delete customer';
          }
        });
      }
    });
  }
}
