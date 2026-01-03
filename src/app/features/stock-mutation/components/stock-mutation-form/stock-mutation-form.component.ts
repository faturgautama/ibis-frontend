import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG imports
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Lucide icons
import { LucideAngularModule, ArrowRightLeft } from 'lucide-angular';

// Services
import { StockMutationService } from '../../services/stock-mutation.service';

/**
 * Stock Mutation Form Component
 * 
 * Form for creating stock mutations/transfers between warehouses.
 * Uses Tailwind CSS inline styling (no separate .scss file).
 */
@Component({
    selector: 'app-stock-mutation-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputTextModule,
        InputNumberModule,
        SelectModule,
        ButtonModule,
        TextareaModule,
        ToastModule,
        LucideAngularModule
    ],
    providers: [MessageService],
    template: `
    <div class="main-layout overflow-hidden">
      <!-- Page Header -->
      <div class="mb-6">
        <div class="flex items-center gap-2 mb-2">
          <lucide-icon [img]="ArrowRightLeftIcon" class="w-6 h-6 text-sky-600"></lucide-icon>
          <h1 class="text-2xl font-semibold text-gray-900">Stock Mutation / Transfer</h1>
        </div>
        <p class="text-sm text-gray-600">Transfer stock between warehouses</p>
      </div>

      <!-- Form Card -->
      <div class="bg-white rounded-lg shadow-sm p-6" style="max-height: calc(100vh - 13rem); overflow-y: auto">
        <form [formGroup]="mutationForm" (ngSubmit)="onSubmit()">
          <!-- Item Selection -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Item Selection</h2>
            
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">
                Item <span class="text-red-500">*</span>
              </label>
              <p-select 
                formControlName="item_id"
                [options]="items"
                optionLabel="name"
                optionValue="id"
                placeholder="Select Item"
                class="w-full"
              />
              <small *ngIf="isFieldInvalid('item_id')" class="text-red-600 mt-1">Item is required</small>
            </div>
          </div>

          <!-- Warehouse Transfer -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Warehouse Transfer</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">
                  From Warehouse <span class="text-red-500">*</span>
                </label>
                <p-select 
                  formControlName="from_warehouse_id"
                  [options]="warehouses"
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Select Warehouse"
                  class="w-full"
                />
                <small *ngIf="isFieldInvalid('from_warehouse_id')" class="text-red-600 mt-1">From warehouse is required</small>
              </div>

              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">
                  To Warehouse <span class="text-red-500">*</span>
                </label>
                <p-select 
                  formControlName="to_warehouse_id"
                  [options]="warehouses"
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Select Warehouse"
                  class="w-full"
                />
                <small *ngIf="isFieldInvalid('to_warehouse_id')" class="text-red-600 mt-1">To warehouse is required</small>
              </div>
            </div>
          </div>

          <!-- Quantity & Reason -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Transfer Details</h2>
            
            <div class="grid grid-cols-1 gap-4">
              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">
                  Quantity <span class="text-red-500">*</span>
                </label>
                <p-inputNumber 
                  formControlName="quantity"
                  [min]="1"
                  [showButtons]="true"
                  class="w-full"
                />
                <small *ngIf="isFieldInvalid('quantity')" class="text-red-600 mt-1">Quantity must be at least 1</small>
              </div>

              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">
                  Reason <span class="text-red-500">*</span>
                </label>
                <textarea 
                  pInputTextarea 
                  formControlName="reason"
                  rows="3"
                  class="w-full"
                  placeholder="Enter reason for transfer..."
                ></textarea>
                <small *ngIf="isFieldInvalid('reason')" class="text-red-600 mt-1">Reason is required</small>
              </div>
            </div>
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
              label="Submit Transfer" 
              icon="pi pi-check"
              [loading]="loading"
              [disabled]="mutationForm.invalid || loading"
            ></button>
          </div>
        </form>
      </div>
    </div>

    <p-toast />
  `
})
export class StockMutationFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private mutationService = inject(StockMutationService);
    private messageService = inject(MessageService);

    // Icons
    ArrowRightLeftIcon = ArrowRightLeft;

    // Form
    mutationForm!: FormGroup;
    loading = false;

    // Dropdown data
    items = [
        { id: '1', name: 'Raw Material A' },
        { id: '2', name: 'Work in Progress A' },
        { id: '3', name: 'Finished Product A' }
    ];

    warehouses = [
        { id: '1', name: 'Raw Material Warehouse' },
        { id: '2', name: 'WIP Warehouse' },
        { id: '3', name: 'Finished Goods Warehouse' }
    ];

    ngOnInit(): void {
        this.initializeForm();
    }

    initializeForm(): void {
        this.mutationForm = this.fb.group({
            item_id: ['', Validators.required],
            from_warehouse_id: ['', Validators.required],
            to_warehouse_id: ['', Validators.required],
            quantity: [1, [Validators.required, Validators.min(1)]],
            reason: ['', Validators.required]
        });
    }

    onSubmit(): void {
        if (this.mutationForm.invalid) {
            Object.keys(this.mutationForm.controls).forEach(key => {
                this.mutationForm.get(key)?.markAsTouched();
            });
            return;
        }

        this.loading = true;
        const formValue = this.mutationForm.value;

        this.mutationService.createMutation(
            formValue.item_id,
            formValue.from_warehouse_id,
            formValue.to_warehouse_id,
            formValue.quantity,
            formValue.reason,
            'current_user'
        ).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Stock mutation created successfully'
                });
                setTimeout(() => {
                    this.onCancel();
                }, 1000);
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: err.error?.message || 'Failed to create stock mutation'
                });
                this.loading = false;
            }
        });
    }

    onCancel(): void {
        this.router.navigate(['/stock-balance']);
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.mutationForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }
}
