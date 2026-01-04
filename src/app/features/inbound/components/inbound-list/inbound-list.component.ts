import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { LucideAngularModule, PackageCheck, Plus } from 'lucide-angular';
import { InboundDemoService } from '../../services/inbound-demo.service';
import { MessageService } from 'primeng/api';
import { InboundHeader, getInboundStatusLabel } from '../../models/inbound.model';

@Component({
  selector: 'app-inbound-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, ToastModule, LucideAngularModule],
  providers: [MessageService],
  template: `
    <div class="main-layout">
      <!-- Page Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <lucide-icon [img]="PackageCheckIcon" class="w-6 h-6 text-sky-600"></lucide-icon>
            Inbound Receipts
          </h1>
          <p class="text-sm text-gray-600 mt-1">Manage inbound receipts and deliveries</p>
        </div>
        <button
          pButton
          type="button"
          label="Create Inbound"
          icon="pi pi-plus"
          class="p-button-primary"
          (click)="onCreate()"
        ></button>
      </div>

      <!-- Table Card -->
      <div class="bg-white rounded-lg shadow-sm p-6" style="max-height: calc(100vh - 13rem); overflow-y: auto">
        <p-table [value]="inbounds" [paginator]="true" [rows]="20" [loading]="loading" 
        [showCurrentPageReport]="true" 
        currentPageReportTemplate="{first} - {last} inbounds form {totalRecords} total inbounds">
          <ng-template pTemplate="header">
            <tr>
              <th>Inbound Number</th>
              <th>Date</th>
              <th>BC Document</th>
              <th>Supplier</th>
              <th>Warehouse</th>
              <th>Total Qty</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-inbound>
            <tr>
              <td>{{ inbound.inbound_number }}</td>
              <td>{{ inbound.inbound_date | date: 'dd MMM yyyy' }}</td>
              <td>{{ inbound.bc_document_number }}</td>
              <td>{{ inbound.supplier_name }}</td>
              <td>{{ inbound.warehouse_name }}</td>
              <td>{{ inbound.total_quantity | number: '1.0-0' }}</td>
              <td><p-tag [value]="getInboundStatusLabel(inbound.status)" /></td>
              <td>
                <button pButton icon="pi pi-eye" class="p-button-text p-button-sm" (click)="onView(inbound)"></button>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
    <p-toast />
  `
})
export class InboundListComponent implements OnInit {
  private router = inject(Router);
  private inboundService = inject(InboundDemoService);
  private messageService = inject(MessageService);

  PackageCheckIcon = PackageCheck;
  PlusIcon = Plus;
  inbounds: InboundHeader[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadInbounds();
  }

  loadInbounds(): void {
    this.loading = true;
    this.inboundService.getAll().subscribe({
      next: (data) => {
        this.inbounds = data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load inbounds' });
        this.loading = false;
      }
    });
  }

  onCreate(): void {
    this.router.navigate(['/inbound/create']);
  }

  onView(inbound: InboundHeader): void {
    this.router.navigate(['/inbound', inbound.id]);
  }

  getInboundStatusLabel(status: any): string {
    return getInboundStatusLabel(status);
  }
}
