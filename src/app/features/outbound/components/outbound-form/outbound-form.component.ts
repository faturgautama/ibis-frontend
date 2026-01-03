import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Lucide icons
import { LucideAngularModule, PackageOpen, Plus, Trash2 } from 'lucide-angular';

// Services
import { OutboundDemoService } from '../../services/outbound-demo.service';

// Models
import { OutboundStatus, OutboundType } from '../../models/outbound.model';

/**
 * Outbound Form Component
 * Requirements: 10.2, 10.3, 10.4
 */
@Component({
    selector: 'app-outbound-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule,
        TextareaModule,
        SelectModule,
        DatePickerModule,
        InputNumberModule,
        TableModule,
        ToastModule,
        LucideAngularModule
    ],
    providers: [MessageService],
    template: `
    <div class="main-layout overflow-hidden">
      <!-- Page Header -->
      <div class="mb-6">
        <div class="flex items-center gap-2 mb-2">
          <lucide-icon [img]="PackageOpenIcon" class="w-6 h-6 text-sky-600"></lucide-icon>
          <h1 class="text-2xl font-semibold text-gray-900">
            {{ isEditMode ? 'Edit Outbound Shipment' : 'Create Outbound Shipment' }}
          </h1>
        </div>
        <p class="text-sm text-gray-600">
          {{ isEditMode ? 'Edit outbound shipment details' : 'Create a new outbound shipment' }}
        </p>
      </div>

      <!-- Form Card -->
      <div class="bg-white rounded-lg shadow-sm p-6" style="max-height: calc(100vh - 13rem); overflow-y: auto">
        <form [formGroup]="outboundForm" (ngSubmit)="onSubmit()">
          <!-- Basic Information -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Basic Information</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">
                  Outbound Number <span class="text-red-500">*</span>
                </label>
                <input pInputText formControlName="outbound_number" class="w-full" />
                <small *ngIf="isFieldInvalid('outbound_number')" class="text-red-600 mt-1">Outbound number is required</small>
              </div>

              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">
                  Outbound Date <span class="text-red-500">*</span>
                </label>
                <p-datepicker
                  formControlName="outbound_date"
                  dateFormat="dd/mm/yy"
                  [showIcon]="true"
                  class="w-full"
                />
                <small *ngIf="isFieldInvalid('outbound_date')" class="text-red-600 mt-1">Outbound date is required</small>
              </div>

              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">
                  Outbound Type <span class="text-red-500">*</span>
                </label>
                <p-select
                  formControlName="outbound_type"
                  [options]="typeOptions"
                  placeholder="Select type"
                  class="w-full"
                />
                <small *ngIf="isFieldInvalid('outbound_type')" class="text-red-600 mt-1">Outbound type is required</small>
              </div>

              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">Status</label>
                <p-select
                  formControlName="status"
                  [options]="statusOptions"
                  class="w-full"
                  [disabled]="isEditMode"
                />
              </div>
            </div>
          </div>

          <!-- BC Document & Customer -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">BC Document & Customer</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">
                  BC Document Number <span class="text-red-500">*</span>
                </label>
                <input pInputText formControlName="bc_document_number" class="w-full" />
                <small *ngIf="isFieldInvalid('bc_document_number')" class="text-red-600 mt-1">BC document number is required</small>
              </div>

              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">
                  Customer Name <span class="text-red-500">*</span>
                </label>
                <input pInputText formControlName="customer_name" class="w-full" />
                <small *ngIf="isFieldInvalid('customer_name')" class="text-red-600 mt-1">Customer name is required</small>
              </div>

              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">Customer Code</label>
                <input pInputText formControlName="customer_code" class="w-full" />
              </div>

              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">
                  Warehouse <span class="text-red-500">*</span>
                </label>
                <input pInputText formControlName="warehouse_name" class="w-full" />
                <small *ngIf="isFieldInvalid('warehouse_name')" class="text-red-600 mt-1">Warehouse is required</small>
              </div>
            </div>
          </div>

          <!-- Delivery Information -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Delivery Information</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">Delivery Number</label>
                <input pInputText formControlName="delivery_number" class="w-full" />
              </div>

              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
                <p-datepicker
                  formControlName="delivery_date"
                  dateFormat="dd/mm/yy"
                  [showIcon]="true"
                  class="w-full"
                />
              </div>

              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                <input pInputText formControlName="vehicle_number" class="w-full" />
              </div>

              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">Driver Name</label>
                <input pInputText formControlName="driver_name" class="w-full" />
              </div>
            </div>
          </div>

          <!-- Outbound Details -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Outbound Items</h2>
              <button
                pButton
                type="button"
                label="Add Item"
                icon="pi pi-plus"
                class="p-button-sm"
                (click)="addDetail()"
              ></button>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Item Code</th>
                    <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Item Name</th>
                    <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">HS Code</th>
                    <th class="px-4 py-2 text-right text-sm font-medium text-gray-700">Ordered Qty</th>
                    <th class="px-4 py-2 text-right text-sm font-medium text-gray-700">Shipped Qty</th>
                    <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Unit</th>
                    <th class="px-4 py-2 text-right text-sm font-medium text-gray-700">Unit Price</th>
                    <th class="px-4 py-2 text-right text-sm font-medium text-gray-700">Total</th>
                    <th class="px-4 py-2 text-center text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody formArrayName="details">
                  <tr *ngFor="let detail of details.controls; let i = index" [formGroupName]="i" class="border-b">
                    <td class="px-4 py-2">
                      <input pInputText formControlName="item_code" class="w-full" />
                    </td>
                    <td class="px-4 py-2">
                      <input pInputText formControlName="item_name" class="w-full" />
                    </td>
                    <td class="px-4 py-2">
                      <input pInputText formControlName="hs_code" class="w-full" />
                    </td>
                    <td class="px-4 py-2">
                      <p-inputnumber formControlName="ordered_quantity" [min]="0" class="w-full" />
                    </td>
                    <td class="px-4 py-2">
                      <p-inputnumber formControlName="shipped_quantity" [min]="0" class="w-full" (ngModelChange)="calculateDetailTotal(i)" />
                    </td>
                    <td class="px-4 py-2">
                      <input pInputText formControlName="unit" class="w-full" />
                    </td>
                    <td class="px-4 py-2">
                      <p-inputnumber formControlName="unit_price" mode="currency" currency="IDR" locale="id-ID" [min]="0" class="w-full" (ngModelChange)="calculateDetailTotal(i)" />
                    </td>
                    <td class="px-4 py-2 text-right">
                      {{ detail.get('total_price')?.value | number: '1.2-2' }}
                    </td>
                    <td class="px-4 py-2 text-center">
                      <button
                        pButton
                        type="button"
                        icon="pi pi-trash"
                        class="p-button-text p-button-danger p-button-sm"
                        (click)="removeDetail(i)"
                      ></button>
                    </td>
                  </tr>
                  <tr *ngIf="details.length === 0">
                    <td colspan="9" class="px-4 py-8 text-center text-gray-500">
                      No items added. Click "Add Item" to add outbound items.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Summary -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Summary</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-600 mb-1">Total Items</p>
                <p class="text-2xl font-semibold text-gray-900">{{ outboundForm.get('total_items')?.value || 0 }}</p>
              </div>

              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-600 mb-1">Total Quantity</p>
                <p class="text-2xl font-semibold text-gray-900">{{ outboundForm.get('total_quantity')?.value || 0 }}</p>
              </div>

              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-600 mb-1">Total Value (IDR)</p>
                <p class="text-2xl font-semibold text-gray-900">{{ (outboundForm.get('total_value')?.value || 0) | number: '1.2-2' }}</p>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Notes</h2>
            
            <textarea
              pInputTextarea
              formControlName="notes"
              rows="3"
              class="w-full"
              placeholder="Additional notes..."
            ></textarea>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              pButton
              type="button"
              label="Cancel"
              icon="pi pi-times"
              class="p-button-text p-button-secondary"
              (click)="onCancel()"
            ></button>
            <button
              pButton
              type="submit"
              [label]="isEditMode ? 'Update Outbound' : 'Create Outbound'"
              icon="pi pi-check"
              [loading]="loading"
              [disabled]="outboundForm.invalid || loading || details.length === 0"
            ></button>
          </div>
        </form>
      </div>
    </div>

    <p-toast />
  `
})
export class OutboundFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private outboundService = inject(OutboundDemoService);
    private messageService = inject(MessageService);

    // Icons
    PackageOpenIcon = PackageOpen;
    PlusIcon = Plus;
    Trash2Icon = Trash2;

    // Form
    outboundForm!: FormGroup;
    isEditMode = false;
    outboundId: string | null = null;
    loading = false;

    // Dropdown options
    statusOptions = [
        { label: 'Pending', value: OutboundStatus.PENDING },
        { label: 'Prepared', value: OutboundStatus.PREPARED },
        { label: 'Shipped', value: OutboundStatus.SHIPPED },
        { label: 'Delivered', value: OutboundStatus.DELIVERED }
    ];

    typeOptions = [
        { label: 'Export', value: OutboundType.EXPORT },
        { label: 'Local', value: OutboundType.LOCAL },
        { label: 'Return', value: OutboundType.RETURN },
        { label: 'Sample', value: OutboundType.SAMPLE }
    ];

    ngOnInit(): void {
        this.initializeForm();
        this.checkEditMode();
    }

    initializeForm(): void {
        this.outboundForm = this.fb.group({
            outbound_number: ['', Validators.required],
            outbound_date: [new Date(), Validators.required],
            status: [OutboundStatus.PENDING],
            outbound_type: ['', Validators.required],
            bc_document_id: [''],
            bc_document_number: ['', Validators.required],
            customer_id: [''],
            customer_code: [''],
            customer_name: ['', Validators.required],
            warehouse_id: [''],
            warehouse_code: [''],
            warehouse_name: ['', Validators.required],
            delivery_number: [''],
            delivery_date: [null],
            vehicle_number: [''],
            driver_name: [''],
            total_items: [0],
            total_quantity: [0],
            total_value: [0],
            notes: [''],
            details: this.fb.array([])
        });
    }

    get details(): FormArray {
        return this.outboundForm.get('details') as FormArray;
    }

    addDetail(): void {
        const detailGroup = this.fb.group({
            item_id: [''],
            item_code: ['', Validators.required],
            item_name: ['', Validators.required],
            hs_code: ['', Validators.required],
            ordered_quantity: [0, [Validators.required, Validators.min(0)]],
            shipped_quantity: [0, [Validators.required, Validators.min(0)]],
            unit: ['', Validators.required],
            unit_price: [0, [Validators.required, Validators.min(0)]],
            total_price: [0],
            batch_number: [''],
            location_code: ['']
        });

        this.details.push(detailGroup);
    }

    removeDetail(index: number): void {
        this.details.removeAt(index);
        this.calculateTotals();
    }

    calculateDetailTotal(index: number): void {
        const detail = this.details.at(index);
        const quantity = detail.get('shipped_quantity')?.value || 0;
        const unitPrice = detail.get('unit_price')?.value || 0;
        const total = quantity * unitPrice;

        detail.patchValue({ total_price: total }, { emitEvent: false });
        this.calculateTotals();
    }

    calculateTotals(): void {
        const totalItems = this.details.length;
        let totalQuantity = 0;
        let totalValue = 0;

        this.details.controls.forEach(detail => {
            totalQuantity += detail.get('shipped_quantity')?.value || 0;
            totalValue += detail.get('total_price')?.value || 0;
        });

        this.outboundForm.patchValue({
            total_items: totalItems,
            total_quantity: totalQuantity,
            total_value: totalValue
        }, { emitEvent: false });
    }

    checkEditMode(): void {
        this.outboundId = this.route.snapshot.paramMap.get('id');
        if (this.outboundId) {
            this.isEditMode = true;
            this.loadOutbound(this.outboundId);
        }
    }

    loadOutbound(id: string): void {
        this.loading = true;
        this.outboundService.getById(id).subscribe({
            next: (outbound) => {
                this.outboundForm.patchValue({
                    ...outbound,
                    outbound_date: new Date(outbound.outbound_date),
                    delivery_date: outbound.delivery_date ? new Date(outbound.delivery_date) : null
                });

                // Load details
                this.outboundService.getDetails(id).subscribe({
                    next: (details) => {
                        details.forEach(detail => {
                            const detailGroup = this.fb.group({
                                item_id: [detail.item_id],
                                item_code: [detail.item_code, Validators.required],
                                item_name: [detail.item_name, Validators.required],
                                hs_code: [detail.hs_code, Validators.required],
                                ordered_quantity: [detail.ordered_quantity, [Validators.required, Validators.min(0)]],
                                shipped_quantity: [detail.shipped_quantity, [Validators.required, Validators.min(0)]],
                                unit: [detail.unit, Validators.required],
                                unit_price: [detail.unit_price, [Validators.required, Validators.min(0)]],
                                total_price: [detail.total_price],
                                batch_number: [detail.batch_number],
                                location_code: [detail.location_code]
                            });
                            this.details.push(detailGroup);
                        });
                        this.loading = false;
                    }
                });
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.error?.message || 'Failed to load outbound'
                });
                this.loading = false;
            }
        });
    }

    onSubmit(): void {
        if (this.outboundForm.invalid || this.details.length === 0) {
            Object.keys(this.outboundForm.controls).forEach(key => {
                this.outboundForm.get(key)?.markAsTouched();
            });
            this.details.controls.forEach(detail => {
                Object.keys((detail as FormGroup).controls).forEach(key => {
                    detail.get(key)?.markAsTouched();
                });
            });
            return;
        }

        this.loading = true;

        const formValue = this.outboundForm.value;
        const headerData = {
            ...formValue,
            created_by: 'admin'
        };
        delete headerData.details;

        const detailsData = formValue.details;

        this.outboundService.create(headerData, detailsData).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Outbound shipment created successfully'
                });
                setTimeout(() => {
                    this.router.navigate(['/outbound']);
                }, 1000);
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.error?.message || 'Failed to save outbound'
                });
                this.loading = false;
            }
        });
    }

    onCancel(): void {
        this.router.navigate(['/outbound']);
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.outboundForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }
}
