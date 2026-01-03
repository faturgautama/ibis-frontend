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
import { LucideAngularModule, ClipboardList, Plus, Trash2 } from 'lucide-angular';

// Services
import { StockOpnameService } from '../../services/stock-opname.service';

// Models
import { OpnameType, calculateDifference } from '../../models/stock-opname.model';

/**
 * Stock Opname Form Component
 * Requirements: 11.2, 11.4, 11.5
 */
@Component({
    selector: 'app-stock-opname-form',
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
          <lucide-icon [img]="ClipboardListIcon" class="w-6 h-6 text-sky-600"></lucide-icon>
          <h1 class="text-2xl font-semibold text-gray-900">
            {{ isEditMode ? 'Edit Stock Opname' : 'Create Stock Opname' }}
          </h1>
        </div>
        <p class="text-sm text-gray-600">
          {{ isEditMode ? 'Edit stock opname session details' : 'Create a new stock opname session' }}
        </p>
      </div>

      <!-- Form Card -->
      <div class="bg-white rounded-lg shadow-sm p-6" style="max-height: calc(100vh - 13rem); overflow-y: auto">
        <form [formGroup]="opnameForm" (ngSubmit)="onSubmit()">
          <!-- Basic Information -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Basic Information</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">
                  Opname Number <span class="text-red-500">*</span>
                </label>
                <input pInputText formControlName="opname_number" class="w-full" />
                <small *ngIf="isFieldInvalid('opname_number')" class="text-red-600 mt-1">Opname number is required</small>
              </div>

              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">
                  Opname Date <span class="text-red-500">*</span>
                </label>
                <p-datepicker
                  formControlName="opname_date"
                  dateFormat="dd/mm/yy"
                  [showIcon]="true"
                  class="w-full"
                />
                <small *ngIf="isFieldInvalid('opname_date')" class="text-red-600 mt-1">Opname date is required</small>
              </div>

              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">
                  Opname Type <span class="text-red-500">*</span>
                </label>
                <p-select
                  formControlName="opname_type"
                  [options]="typeOptions"
                  placeholder="Select type"
                  class="w-full"
                />
                <small *ngIf="isFieldInvalid('opname_type')" class="text-red-600 mt-1">Opname type is required</small>
              </div>

              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">
                  Warehouse <span class="text-red-500">*</span>
                </label>
                <input pInputText formControlName="warehouse_name" class="w-full" />
                <small *ngIf="isFieldInvalid('warehouse_name')" class="text-red-600 mt-1">Warehouse is required</small>
              </div>

              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">Warehouse Code</label>
                <input pInputText formControlName="warehouse_code" class="w-full" />
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

          <!-- Stock Opname Details -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Stock Count Details</h2>
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
                    <th class="px-4 py-2 text-right text-sm font-medium text-gray-700">System Qty</th>
                    <th class="px-4 py-2 text-right text-sm font-medium text-gray-700">Physical Qty</th>
                    <th class="px-4 py-2 text-right text-sm font-medium text-gray-700">Difference</th>
                    <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Unit</th>
                    <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Batch Number</th>
                    <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Adjustment Reason</th>
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
                      <p-inputnumber formControlName="system_quantity" [min]="0" class="w-full" (ngModelChange)="calculateDifference(i)" />
                    </td>
                    <td class="px-4 py-2">
                      <p-inputnumber formControlName="physical_quantity" [min]="0" class="w-full" (ngModelChange)="calculateDifference(i)" />
                    </td>
                    <td class="px-4 py-2 text-right">
                      <span [class]="getDifferenceClass(detail.get('difference')?.value)">
                        {{ detail.get('difference')?.value || 0 }}
                      </span>
                    </td>
                    <td class="px-4 py-2">
                      <input pInputText formControlName="unit" class="w-full" />
                    </td>
                    <td class="px-4 py-2">
                      <input pInputText formControlName="batch_number" class="w-full" />
                    </td>
                    <td class="px-4 py-2">
                      <input pInputText formControlName="adjustment_reason" class="w-full" [class.border-red-500]="isDifferenceWithoutReason(i)" />
                      <small *ngIf="isDifferenceWithoutReason(i)" class="text-red-600 text-xs">Reason required for differences</small>
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
                      No items added. Click "Add Item" to add stock count items.
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
                <p class="text-2xl font-semibold text-gray-900">{{ details.length }}</p>
              </div>

              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-600 mb-1">Items with Differences</p>
                <p class="text-2xl font-semibold text-orange-600">{{ getItemsWithDifferences() }}</p>
              </div>

              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-600 mb-1">Total Difference</p>
                <p class="text-2xl font-semibold" [class]="getTotalDifferenceClass()">
                  {{ getTotalDifference() }}
                </p>
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
              [label]="isEditMode ? 'Update Opname' : 'Create Opname'"
              icon="pi pi-check"
              [loading]="loading"
              [disabled]="opnameForm.invalid || loading || details.length === 0 || hasInvalidDetails()"
            ></button>
          </div>
        </form>
      </div>
    </div>

    <p-toast />
  `
})
export class StockOpnameFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private opnameService = inject(StockOpnameService);
    private messageService = inject(MessageService);

    // Icons
    ClipboardListIcon = ClipboardList;
    PlusIcon = Plus;
    Trash2Icon = Trash2;

    // Form
    opnameForm!: FormGroup;
    isEditMode = false;
    opnameId: string | null = null;
    loading = false;

    // Dropdown options
    typeOptions = [
        { label: 'Periodic', value: OpnameType.PERIODIC },
        { label: 'Spot Check', value: OpnameType.SPOT_CHECK },
        { label: 'Year End', value: OpnameType.YEAR_END }
    ];

    statusOptions = [
        { label: 'Draft', value: 'DRAFT' },
        { label: 'Approved', value: 'APPROVED' },
        { label: 'Completed', value: 'COMPLETED' }
    ];

    ngOnInit(): void {
        this.initializeForm();
        this.checkEditMode();
    }

    initializeForm(): void {
        this.opnameForm = this.fb.group({
            opname_number: ['', Validators.required],
            opname_date: [new Date(), Validators.required],
            opname_type: ['', Validators.required],
            warehouse_id: [''],
            warehouse_code: [''],
            warehouse_name: ['', Validators.required],
            status: ['DRAFT'],
            notes: [''],
            details: this.fb.array([])
        });
    }

    get details(): FormArray {
        return this.opnameForm.get('details') as FormArray;
    }

    addDetail(): void {
        const detailGroup = this.fb.group({
            item_id: [''],
            item_code: ['', Validators.required],
            item_name: ['', Validators.required],
            system_quantity: [0, [Validators.required, Validators.min(0)]],
            physical_quantity: [0, [Validators.required, Validators.min(0)]],
            difference: [0],
            unit: ['', Validators.required],
            batch_number: [''],
            adjustment_reason: ['']
        });

        this.details.push(detailGroup);
    }

    removeDetail(index: number): void {
        this.details.removeAt(index);
    }

    calculateDifference(index: number): void {
        const detail = this.details.at(index);
        const systemQty = detail.get('system_quantity')?.value || 0;
        const physicalQty = detail.get('physical_quantity')?.value || 0;
        const difference = calculateDifference(systemQty, physicalQty);

        detail.patchValue({ difference }, { emitEvent: false });
    }

    isDifferenceWithoutReason(index: number): boolean {
        const detail = this.details.at(index);
        const difference = detail.get('difference')?.value || 0;
        const reason = detail.get('adjustment_reason')?.value || '';

        return difference !== 0 && !reason.trim();
    }

    hasInvalidDetails(): boolean {
        return this.details.controls.some((_, index) => this.isDifferenceWithoutReason(index));
    }

    getDifferenceClass(difference: number): string {
        if (difference > 0) return 'text-green-600 font-semibold';
        if (difference < 0) return 'text-red-600 font-semibold';
        return 'text-gray-600';
    }

    getTotalDifferenceClass(): string {
        const total = this.getTotalDifference();
        if (total > 0) return 'text-green-600';
        if (total < 0) return 'text-red-600';
        return 'text-gray-900';
    }

    getItemsWithDifferences(): number {
        return this.details.controls.filter(detail => {
            const diff = detail.get('difference')?.value || 0;
            return diff !== 0;
        }).length;
    }

    getTotalDifference(): number {
        return this.details.controls.reduce((sum, detail) => {
            return sum + (detail.get('difference')?.value || 0);
        }, 0);
    }

    checkEditMode(): void {
        this.opnameId = this.route.snapshot.paramMap.get('id');
        if (this.opnameId) {
            this.isEditMode = true;
            this.loadOpname(this.opnameId);
        }
    }

    loadOpname(id: string): void {
        this.loading = true;
        this.opnameService.getAll().subscribe({
            next: (opnames) => {
                const opname = opnames.find(o => o.id === id);
                if (opname) {
                    this.opnameForm.patchValue({
                        ...opname,
                        opname_date: new Date(opname.opname_date)
                    });

                    // Load details
                    this.opnameService.getDetails(id).subscribe({
                        next: (details) => {
                            details.forEach(detail => {
                                const detailGroup = this.fb.group({
                                    item_id: [detail.item_id],
                                    item_code: [detail.item_code, Validators.required],
                                    item_name: [detail.item_name, Validators.required],
                                    system_quantity: [detail.system_quantity, [Validators.required, Validators.min(0)]],
                                    physical_quantity: [detail.physical_quantity, [Validators.required, Validators.min(0)]],
                                    difference: [detail.difference],
                                    unit: [detail.unit, Validators.required],
                                    batch_number: [detail.batch_number],
                                    adjustment_reason: [detail.adjustment_reason]
                                });
                                this.details.push(detailGroup);
                            });
                            this.loading = false;
                        }
                    });
                }
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.error?.message || 'Failed to load stock opname'
                });
                this.loading = false;
            }
        });
    }

    onSubmit(): void {
        if (this.opnameForm.invalid || this.details.length === 0 || this.hasInvalidDetails()) {
            Object.keys(this.opnameForm.controls).forEach(key => {
                this.opnameForm.get(key)?.markAsTouched();
            });
            this.details.controls.forEach(detail => {
                Object.keys((detail as FormGroup).controls).forEach(key => {
                    detail.get(key)?.markAsTouched();
                });
            });

            if (this.hasInvalidDetails()) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Validation Error',
                    detail: 'Please provide adjustment reasons for all items with differences'
                });
            }
            return;
        }

        this.loading = true;

        const formValue = this.opnameForm.value;
        const opnameData = {
            ...formValue,
            created_by: 'admin'
        };
        delete opnameData.details;

        const detailsData = formValue.details;

        this.opnameService.create(opnameData, detailsData).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Stock opname created successfully'
                });
                setTimeout(() => {
                    this.router.navigate(['/stock-opname']);
                }, 1000);
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.error?.message || 'Failed to save stock opname'
                });
                this.loading = false;
            }
        });
    }

    onCancel(): void {
        this.router.navigate(['/stock-opname']);
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.opnameForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }
}
