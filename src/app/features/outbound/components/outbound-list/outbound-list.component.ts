import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { OutboundDemoService } from '../../services/outbound-demo.service';

@Component({
    selector: 'app-outbound-list',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, TagModule],
    template: `
        <div class="p-6">
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-900">Outbound Transactions</h2>
                    <button pButton label="Create Outbound" icon="pi pi-plus" class="p-button-primary"></button>
                </div>
                <p-table [value]="outbounds" [paginator]="true" [rows]="10">
                    <ng-template pTemplate="header">
                        <tr>
                            <th>Shipment Number</th>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>BC Document</th>
                            <th>Actions</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-out>
                        <tr>
                            <td>{{ out.shipment_number }}</td>
                            <td>{{ out.shipment_date | date:'short' }}</td>
                            <td>{{ out.customer_name }}</td>
                            <td>{{ out.outbound_type }}</td>
                            <td><p-tag [value]="out.status"></p-tag></td>
                            <td>{{ out.bc_document_number || '-' }}</td>
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
export class OutboundListComponent implements OnInit {
    private outboundService = inject(OutboundDemoService);
    outbounds: any[] = [];

    ngOnInit(): void {
        this.outboundService.getAllOutbounds().subscribe(data => {
            this.outbounds = data;
        });
    }
}
