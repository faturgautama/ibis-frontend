import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { LucideAngularModule, PackageOpen } from 'lucide-angular';
import { OutboundDemoService } from '../../services/outbound-demo.service';

@Component({
    selector: 'app-outbound-list',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, TagModule, LucideAngularModule],
    template: `
        <div class="main-layout">
            <!-- Page Header -->
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <lucide-icon [img]="PackageOpenIcon" class="w-8 h-8 text-sky-600"></lucide-icon>
                    <div>
                        <h1 class="text-2xl font-semibold text-gray-900">Outbound Transactions</h1>
                        <p class="text-sm text-gray-600 mt-1">Manage outbound shipments</p>
                    </div>
                </div>
                <button pButton type="button" label="Create Outbound" icon="pi pi-plus" class="p-button-primary" (click)="onCreate()"></button>
            </div>

            <!-- Data Table -->
            <div class="bg-white rounded-lg shadow-sm p-6" style="max-height: calc(100vh - 16rem); overflow-y: auto">
                <p-table [value]="outbounds" [paginator]="true" [rows]="20" [rowsPerPageOptions]="[10, 20, 50]" [showCurrentPageReport]="true" currentPageReportTemplate="Showing {first} to {last} of {totalRecords} outbounds">
                    <ng-template pTemplate="header">
                        <tr>
                            <th>Shipment Number</th>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>BC Document</th>
                            <th class="text-center">Actions</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-out>
                        <tr>
                            <td class="font-medium text-gray-900">{{ out.shipment_number }}</td>
                            <td>{{ out.shipment_date | date:'dd MMM yyyy' }}</td>
                            <td>{{ out.customer_name }}</td>
                            <td>{{ out.outbound_type }}</td>
                            <td><p-tag [value]="out.status"></p-tag></td>
                            <td>{{ out.bc_document_number || '-' }}</td>
                            <td class="text-center">
                                <div class="flex items-center justify-center gap-2">
                                    <button pButton type="button" icon="pi pi-pencil" class="p-button-text p-button-sm" pTooltip="Edit" (click)="onEdit(out)"></button>
                                    <button pButton type="button" icon="pi pi-trash" class="p-button-text p-button-sm p-button-danger" pTooltip="Delete" (click)="onDelete(out)"></button>
                                </div>
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="7" class="text-center py-8 text-gray-500">
                                No outbound transactions found
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>
    `
})
export class OutboundListComponent implements OnInit {
    private router = inject(Router);
    private outboundService = inject(OutboundDemoService);

    PackageOpenIcon = PackageOpen;
    outbounds: any[] = [];

    ngOnInit(): void {
        this.outboundService.getAllOutbounds().subscribe(data => {
            this.outbounds = data;
        });
    }

    onCreate(): void {
        this.router.navigate(['/outbound/new']);
    }

    onEdit(outbound: any): void {
        this.router.navigate(['/outbound', outbound.id, 'edit']);
    }

    onDelete(outbound: any): void {
        // Implement delete logic
    }
}
