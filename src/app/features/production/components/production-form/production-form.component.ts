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
import { LucideAngularModule, Factory, Plus, Trash2 } from 'lucide-angular';

// Services
import { ProductionDemoService } from '../../services/production-demo.service';

// Models
import { WOStatus } from '../../models/production.model';

/**
 * Production Form Component
 * Requirements: 9.2, 9.3, 9.4, 9.5
 */
@Component({
    selector: 'app-production-form',
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
          <lucide-icon [img]="FactoryIcon" class="w-6 h-6 text-sky-600"></lucide-icon>
          <h1 class="text-2xl font-semibold text-gray-900">
            {{ isEditMode ? 'Edit Work Order' : 'Create Work Order' }}
          </h1>
        </div>
        <p class="text-sm text-gray-600">
          {{ isEditMode ? 'Edit production work order details' : 'Create a new production work order' }}
        </p>
      </div>

      <!-- Form Card -->
      <div class="bg-white rounded-lg shadow-sm p-6" style="max-height: calc(100vh - 13rem); overflow-y: auto">
        <form [formGroup]="productionForm" (ngSubmit)="onSubmit()">
          <!-- Basic Information -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Basic Information</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">
                  WO Number <span class="text-red-500">*</span>
                </label>
                <input pInputText formControlName="wo_number" class="w-full" />
                <small *ngIf="isFieldInvalid('wo_number')" class="text-red-600 mt-1">WO number is required</small>
              </div>

              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">
                  WO Date <span class="text-red-500">*</span>
                </label>
                <p-datepicker
                  formControlName="wo_date"
                  dateFormat="dd/mm/yy"
                  [showIcon]="true"
                  class="w-full"
                />
                <small *ngIf="isFieldInvalid('wo_date')" class="text-red-600 mt-1">WO date is required</small>
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
                <label class="text-sm font-medium text-gray-700 mb-1">
                  Warehouse <span class="text-red-500">*</span>
                </label>
                <input pInputText formControlName="warehouse_name" class="w-full" />
                <small *ngIf="isFieldInvalid('warehouse_name')" class="text-red-600 mt-1">Warehouse is required</small>
              </div>
            </div>
          </div>

          <!-- Output Product -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Output Product (Finished Goods)</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">
                  Output Item Code <span class="text-red-500">*</span>
                </label>
                <input pInputText formControlName="output_item_code" class="w-full" />
                <small *ngIf="isFieldInvalid('output_item_code')" class="text-red-600 mt-1">Output item code is required</small>
              </div>

              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">
                  Output Item Name <span class="text-red-500">*</span>
                </label>
                <input pInputText formControlName="output_item_name" class="w-full" />
                <small *ngIf="isFieldInvalid('output_item_name')" class="text-red-600 mt-1">Output item name is required</small>
              </div>

              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">
                  Planned Quantity <span class="text-red-500">*</span>
                </label>
                <p-inputnumber formControlName="planned_quantity" [min]="0" class="w-full" />
                <small *ngIf="isFieldInvalid('planned_quantity')" class="text-red-600 mt-1">Planned quantity is required</small>
              </div>

              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">
                  Unit <span class="text-red-500">*</span>
                </label>
                <input pInputText formControlName="unit" class="w-full" />
                <small *ngIf="isFieldInvalid('unit')" class="text-red-600 mt-1">Unit is required</small>
              </div>

              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">Actual Quantity</label>
                <p-inputnumber formControlName="actual_quantity" [min]="0" class="w-full" [disabled]="!isEditMode" />
              </div>

              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">Yield Percentage</label>
                <p-inputnumber formControlName="yield_percentage" [min]="0" [max]="100" suffix="%" class="w-full" [disabled]="true" />
              </div>
            </div>
          </div>

          <!-- Scrap Information -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Scrap Information</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">Scrap Quantity</label>
                <p-inputnumber formControlName="scrap_quantity" [min]="0" class="w-full" [disabled]="!isEditMode" />
              </div>

              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">Scrap Reason</label>
                <input pInputText formControlName="scrap_reason" class="w-full" [disabled]="!isEditMode" />
              </div>
            </div>
          </div>

          <!-- Production Dates -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Production Dates</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <p-datepicker
                  formControlName="start_date"
                  dateFormat="dd/mm/yy"
                  [showIcon]="true"
                  class="w-full"
                />
              </div>

              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">Completion Date</label>
                <p-datepicker
                  formControlName="completion_date"
                  dateFormat="dd/mm/yy"
                  [showIcon]="true"
                  class="w-full"
                  [disabled]="!isEditMode"
                />
              </div>
            </div>
          </div>

          <!-- Material Requirements -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Material Requirements (Raw Materials)</h2>
              <button
                pButton
                type="button"
                label="Add Material"
                icon="pi pi-plus"
                class="p-button-sm"
                (click)="addMaterial()"
              ></button>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Material Code</th>
                    <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Material Name</th>
                    <th class="px-4 py-2 text-right text-sm font-medium text-gray-700">Required Qty</th>
                    <th class="px-4 py-2 text-right text-sm font-medium text-gray-700">Consumed Qty</th>
                    <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Unit</th>
                    <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Batch Number</th>
                    <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Warehouse</th>
                    <th class="px-4 py-2 text-center text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody formArrayName="materials">
                  <tr *ngFor="let material of materials.controls; let i = index" [formGroupName]="i" class="border-b">
                    <td class="px-4 py-2">
                      <input pInputText formControlName="material_item_code" class="w-full" />
                    </td>
                    <td class="px-4 py-2">
                      <input pInputText formControlName="material_item_name" class="w-full" />
                    </td>
                    <td class="px-4 py-2">
                      <p-inputnumber formControlName="required_quantity" [min]="0" class="w-full" />
                    </td>
                    <td class="px-4 py-2">
                      <p-inputnumber formControlName="consumed_quantity" [min]="0" class="w-full" [disabled]="!isEditMode" />
                    </td>
                    <td class="px-4 py-2">
                      <input pInputText formControlName="unit" class="w-full" />
                    </td>
                    <td class="px-4 py-2">
                      <input pInputText formControlName="batch_number" class="w-full" />
                    </td>
                    <td class="px-4 py-2">
                      <input pInputText formControlName="warehouse_name" class="w-full" />
                    </td>
                    <td class="px-4 py-2 text-center">
                      <button
                        pButton
                        type="button"
                        icon="pi pi-trash"
                        class="p-button-text p-button-danger p-button-sm"
                        (click)="removeMaterial(i)"
                      ></button>
                    </td>
                  </tr>
                  <tr *ngIf="materials.length === 0">
                    <td colspan="8" class="px-4 py-8 text-center text-gray-500">
                      No materials added. Click "Add Material" to add raw materials.
                    </td>
                  </tr>
                </tbody>
              </table>
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
              [label]="isEditMode ? 'Update Work Order' : 'Create Work Order'"
              icon="pi pi-check"
              [loading]="loading"
              [disabled]="productionForm.invalid || loading || materials.length === 0"
            ></button>
          </div>
        </form>
      </div>
    </div>

    <p-toast />
  `
})
export class ProductionFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private productionService = inject(ProductionDemoService);
    private messageService = inject(MessageService);

    // Icons
    FactoryIcon = Factory;
    PlusIcon = Plus;
    Trash2Icon = Trash2;

    // Form
    productionForm!: FormGroup;
    isEditMode = false;
    productionId: string | null = null;
    loading = false;

    // Dropdown options
    statusOptions = [
        { label: 'Planned', value: WOStatus.PLANNED },
        { label: 'In Progress', value: WOStatus.IN_PROGRESS },
        { label: 'Completed', value: WOStatus.COMPLETED },
        { label: 'Cancelled', value: WOStatus.CANCELLED }
    ];

    ngOnInit(): void {
        this.initializeForm();
        this.checkEditMode();
    }

    initializeForm(): void {
        this.productionForm = this.fb.group({
            wo_number: ['', Validators.required],
            wo_date: [new Date(), Validators.required],
            status: [WOStatus.PLANNED],
            output_item_id: [''],
            output_item_code: ['', Validators.required],
            output_item_name: ['', Validators.required],
            planned_quantity: [0, [Validators.required, Validators.min(1)]],
            actual_quantity: [0],
            unit: ['', Validators.required],
            warehouse_id: [''],
            warehouse_code: [''],
            warehouse_name: ['', Validators.required],
            yield_percentage: [0],
            scrap_quantity: [0],
            scrap_reason: [''],
            start_date: [null],
            completion_date: [null],
            notes: [''],
            materials: this.fb.array([])
        });
    }

    get materials(): FormArray {
        return this.productionForm.get('materials') as FormArray;
    }

    addMaterial(): void {
        const materialGroup = this.fb.group({
            material_item_id: [''],
            material_item_code: ['', Validators.required],
            material_item_name: ['', Validators.required],
            required_quantity: [0, [Validators.required, Validators.min(0)]],
            consumed_quantity: [0],
            unit: ['', Validators.required],
            batch_number: [''],
            warehouse_id: [''],
            warehouse_code: [''],
            warehouse_name: ['', Validators.required]
        });

        this.materials.push(materialGroup);
    }

    removeMaterial(index: number): void {
        this.materials.removeAt(index);
    }

    checkEditMode(): void {
        this.productionId = this.route.snapshot.paramMap.get('id');
        if (this.productionId) {
            this.isEditMode = true;
            this.loadProduction(this.productionId);
        }
    }

    loadProduction(id: string): void {
        this.loading = true;
        this.productionService.getById(id).subscribe({
            next: (production) => {
                this.productionForm.patchValue({
                    ...production,
                    wo_date: new Date(production.wo_date),
                    start_date: production.start_date ? new Date(production.start_date) : null,
                    completion_date: production.completion_date ? new Date(production.completion_date) : null
                });

                // Load materials
                this.productionService.getMaterials(id).subscribe({
                    next: (materials) => {
                        materials.forEach(material => {
                            const materialGroup = this.fb.group({
                                material_item_id: [material.material_item_id],
                                material_item_code: [material.material_item_code, Validators.required],
                                material_item_name: [material.material_item_name, Validators.required],
                                required_quantity: [material.required_quantity, [Validators.required, Validators.min(0)]],
                                consumed_quantity: [material.consumed_quantity],
                                unit: [material.unit, Validators.required],
                                batch_number: [material.batch_number],
                                warehouse_id: [material.warehouse_id],
                                warehouse_code: [material.warehouse_code],
                                warehouse_name: [material.warehouse_name, Validators.required]
                            });
                            this.materials.push(materialGroup);
                        });
                        this.loading = false;
                    }
                });
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.error?.message || 'Failed to load production order'
                });
                this.loading = false;
            }
        });
    }

    onSubmit(): void {
        if (this.productionForm.invalid || this.materials.length === 0) {
            Object.keys(this.productionForm.controls).forEach(key => {
                this.productionForm.get(key)?.markAsTouched();
            });
            this.materials.controls.forEach(material => {
                Object.keys((material as FormGroup).controls).forEach(key => {
                    material.get(key)?.markAsTouched();
                });
            });
            return;
        }

        this.loading = true;

        const formValue = this.productionForm.value;
        const orderData = {
            ...formValue,
            created_by: 'admin'
        };
        delete orderData.materials;

        const materialsData = formValue.materials;

        this.productionService.create(orderData, materialsData).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Production work order created successfully'
                });
                setTimeout(() => {
                    this.router.navigate(['/production']);
                }, 1000);
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.error?.message || 'Failed to save production order'
                });
                this.loading = false;
            }
        });
    }

    onCancel(): void {
        this.router.navigate(['/production']);
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.productionForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }
}
