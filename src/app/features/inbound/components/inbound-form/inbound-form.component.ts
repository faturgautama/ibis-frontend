import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Lucide icons
import { LucideAngularModule, PackageCheck, Plus, Trash2 } from 'lucide-angular';

// Services
import { InboundDemoService } from '../../services/inbound-demo.service';

// Models
import { InboundHeader, InboundStatus } from '../../models/inbound.model';

/**
 * Inbound Form Component
 * 
 * Form for creating and editing inbound receipts.
 * Uses Tailwind CSS inline styling (no separate .scss file).
 * 
 * Requirements: 6.4, 6.7
 */
@Component({
    selector: 'app-inbound-form',
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
        MessageModule,
        ToastModule,
        LucideAngularModule
    ],
    providers: [MessageService],
    template: `
    <div class="main-layout overflow-hidden">
      <!-- Page Header -->
      <div class="mb-6">
        <div class="flex items-center gap-2 mb-2">
          <lucide-icon [img]="PackageCheckIcon" class="w-6 h-6 text-sky-600"></lucide-icon>
          <h1 class="text-2xl font-semibold text-gray-900">
            {{ isEditMode ? 'View Inbound Receipt' : 'Create Inbound Receipt' }}
          </h1>
        </div>
        <p class="text-sm text-gray-600">
          {{ isEditMode ? 'View inbound receipt details' : 'Create a new inbound receipt' }}
        </p>
      </div>

      <!-- Form Card -->
      <div class="bg-white rounded-lg shadow-sm p-6" style="max-height: calc(100vh - 13rem); overflow-y: auto">
        <form [formGroup]="inboundForm" (ngSubmit)="onSubmit()">
          <!-- Basic Information -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Basic Information</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">
                  Inbound Number <span class="text-red-500">*</span>
                </label>
                <input pInputText formControlName="inbound_number" class="w-full" />
                <small *ngIf="isFieldInvalid('inbound_number')" class="text-red-600 mt-1">Inbound number is required</small>
              </div>

              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">
                  Inbound Date <span class="text-red-500">*</span>
                </label>
                <p-datepicker
                  formControlName="inbound_date"
                  dateFormat="dd/mm/yy"
                  [showIcon]="true"
                  class="w-full"
                />
                <small *ngIf="isFieldInvalid('inbound_date')" class="text-red-600 mt-1">Inbound date is required</small>
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

              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">Receipt Number</label>
                <input pInputText formControlName="receipt_number" class="w-full" />
              </div>

              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">Receipt Date</label>
                <p-datepicker
                  formControlName="receipt_date"
                  dateFormat="dd/mm/yy"
                  [showIcon]="true"
                  class="w-full"
                />
              </div>
            </div>
          </div>

          <!-- BC Document & Supplier Information -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">BC Document & Supplier</h2>
            
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
                  Supplier Name <span class="text-red-500">*</span>
                </label>
                <input pInputText formControlName="supplier_name" class="w-full" />
                <small *ngIf="isFieldInvalid('supplier_name')" class="text-red-600 mt-1">Supplier name is required</small>
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

          <!-- Vehicle Information -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Vehicle Information</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <!-- Totals (Read-only) -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Summary</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-600 mb-1">Total Items</p>
                <p class="text-2xl font-semibold text-gray-900">{{ inboundForm.get('total_items')?.value || 0 }}</p>
              </div>

              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-600 mb-1">Total Quantity</p>
                <p class="text-2xl font-semibold text-gray-900">{{ inboundForm.get('total_quantity')?.value || 0 }}</p>
              </div>

              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-600 mb-1">Total Value</p>
                <p class="text-2xl font-semibold text-gray-900">{{ (inboundForm.get('total_value')?.value || 0) | number: '1.2-2' }}</p>
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
              *ngIf="!isEditMode"
              pButton
              type="submit"
              label="Create Inbound"
              icon="pi pi-check"
              [loading]="loading"
              [disabled]="inboundForm.invalid || loading"
            ></button>
          </div>
        </form>
      </div>
    </div>

    <p-toast />
  `
})
export class InboundFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private inboundService = inject(InboundDemoService);
    private messageService = inject(MessageService);

    // Icons
    PackageCheckIcon = PackageCheck;
    PlusIcon = Plus;
    Trash2Icon = Trash2;

    // Form
    inboundForm!: FormGroup;
    isEditMode = false;
    inboundId: string | null = null;
    loading = false;
    error: string | null = null;

    // Dropdown options
    statusOptions = [
        { label: 'Pending', value: InboundStatus.PENDING },
        { label: 'Received', value: InboundStatus.RECEIVED },
        { label: 'Quality Check', value: InboundStatus.QUALITY_CHECK },
        { label: 'Completed', value: InboundStatus.COMPLETED }
    ];

    ngOnInit(): void {
        this.initializeForm();
        this.checkEditMode();
    }

    initializeForm(): void {
        this.inboundForm = this.fb.group({
            inbound_number: ['', Validators.required],
            inbound_date: [new Date(), Validators.required],
            status: [InboundStatus.PENDING],
            bc_document_id: [''],
            bc_document_number: ['', Validators.required],
            supplier_id: [''],
            supplier_code: [''],
            supplier_name: ['', Validators.required],
            warehouse_id: [''],
            warehouse_code: [''],
            warehouse_name: ['', Validators.required],
            receipt_number: [''],
            receipt_date: [null],
            vehicle_number: [''],
            driver_name: [''],
            total_items: [0],
            total_quantity: [0],
            total_value: [0],
            notes: ['']
        });
    }

    checkEditMode(): void {
        this.inboundId = this.route.snapshot.paramMap.get('id');
        if (this.inboundId) {
            this.isEditMode = true;
            this.loadInbound(this.inboundId);
        }
    }

    loadInbound(id: string): void {
        this.loading = true;
        this.inboundService.getById(id).subscribe({
            next: (inbound) => {
                this.inboundForm.patchValue({
                    ...inbound,
                    inbound_date: new Date(inbound.inbound_date),
                    receipt_date: inbound.receipt_date ? new Date(inbound.receipt_date) : null
                });
                this.loading = false;
            },
            error: (error) => {
                this.error = error.error?.message || 'Failed to load inbound';
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: this.error
                });
                this.loading = false;
            }
        });
    }

    onSubmit(): void {
        if (this.inboundForm.invalid) {
            Object.keys(this.inboundForm.controls).forEach(key => {
                this.inboundForm.get(key)?.markAsTouched();
            });
            return;
        }

        this.loading = true;
        this.error = null;

        const formValue = {
            ...this.inboundForm.value,
            created_by: 'admin',
            updated_by: 'admin'
        };

        this.inboundService.create(formValue).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Inbound receipt created successfully'
                });
                setTimeout(() => {
                    this.router.navigate(['/inbound']);
                }, 1000);
            },
            error: (error) => {
                this.error = error.error?.message || 'Failed to save inbound';
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: this.error
                });
                this.loading = false;
            }
        });
    }

    onCancel(): void {
        this.router.navigate(['/inbound']);
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.inboundForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }
}
