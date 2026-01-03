import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageModule } from 'primeng/message';

// Lucide icons
import { LucideAngularModule, Warehouse as WarehouseIcon, Save, X } from 'lucide-angular';

// Services
import { WarehouseDemoService } from '../../services/warehouse-demo.service';

// Models
import { Warehouse, WarehouseType } from '../../models/warehouse.model';

/**
 * Warehouse Form Component
 * 
 * Form for creating and editing warehouses with validation.
 * Displays license expiry alerts and capacity metrics.
 * Uses Tailwind CSS inline styling (no separate .scss file).
 * 
 * Requirements: 3.1, 3.2, 3.4, 3.6
 */
@Component({
    selector: 'app-warehouse-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule,
        TextareaModule,
        SelectModule,
        InputNumberModule,
        CheckboxModule,
        DatePickerModule,
        MessageModule,
        LucideAngularModule
    ],
    template: `
    <div class="p-6 max-w-4xl mx-auto">
      <!-- Page Header -->
      <div class="mb-6">
        <div class="flex items-center gap-2 mb-2">
          <lucide-icon [img]="WarehouseIconImg" class="w-6 h-6 text-sky-600"></lucide-icon>
          <h1 class="text-2xl font-semibold text-gray-900">
            {{ isEditMode ? 'Edit Warehouse' : 'Create Warehouse' }}
          </h1>
        </div>
        <p class="text-sm text-gray-600">
          {{ isEditMode ? 'Update warehouse information' : 'Add a new warehouse to the system' }}
        </p>
      </div>

      <!-- Error Message -->
      @if (error) {
        <p-message severity="error" [text]="error" styleClass="mb-4 w-full"></p-message>
      }

      <!-- Form -->
      <form [formGroup]="warehouseForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Basic Information Card -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Warehouse Code -->
            <div class="flex flex-col">
              <label for="warehouse_code" class="text-sm font-medium text-gray-700 mb-1">
                Warehouse Code <span class="text-red-500">*</span>
              </label>
              <input
                pInputText
                id="warehouse_code"
                formControlName="warehouse_code"
                placeholder="e.g., WH-RAW-001"
                class="w-full"
                [class.ng-invalid]="isFieldInvalid('warehouse_code')"
                [class.ng-dirty]="warehouseForm.get('warehouse_code')?.dirty"
              />
              @if (isFieldInvalid('warehouse_code')) {
                <small class="text-red-600 mt-1">Warehouse code is required</small>
              }
            </div>

            <!-- Warehouse Name -->
            <div class="flex flex-col">
              <label for="warehouse_name" class="text-sm font-medium text-gray-700 mb-1">
                Warehouse Name <span class="text-red-500">*</span>
              </label>
              <input
                pInputText
                id="warehouse_name"
                formControlName="warehouse_name"
                placeholder="e.g., Raw Material Warehouse A"
                class="w-full"
                [class.ng-invalid]="isFieldInvalid('warehouse_name')"
                [class.ng-dirty]="warehouseForm.get('warehouse_name')?.dirty"
              />
              @if (isFieldInvalid('warehouse_name')) {
                <small class="text-red-600 mt-1">Warehouse name is required</small>
              }
            </div>

            <!-- Warehouse Type -->
            <div class="flex flex-col">
              <label for="warehouse_type" class="text-sm font-medium text-gray-700 mb-1">
                Warehouse Type <span class="text-red-500">*</span>
              </label>
              <p-select
                id="warehouse_type"
                formControlName="warehouse_type"
                [options]="warehouseTypeOptions"
                placeholder="Select type"
                styleClass="w-full"
              ></p-select>
              @if (isFieldInvalid('warehouse_type')) {
                <small class="text-red-600 mt-1">Warehouse type is required</small>
              }
            </div>

            <!-- Location -->
            <div class="flex flex-col">
              <label for="location" class="text-sm font-medium text-gray-700 mb-1">
                Location <span class="text-red-500">*</span>
              </label>
              <input
                pInputText
                id="location"
                formControlName="location"
                placeholder="e.g., Building A, Floor 1"
                class="w-full"
                [class.ng-invalid]="isFieldInvalid('location')"
                [class.ng-dirty]="warehouseForm.get('location')?.dirty"
              />
              @if (isFieldInvalid('location')) {
                <small class="text-red-600 mt-1">Location is required</small>
              }
            </div>

            <!-- Address -->
            <div class="flex flex-col md:col-span-2">
              <label for="address" class="text-sm font-medium text-gray-700 mb-1">
                Full Address
              </label>
              <textarea
                pInputTextarea
                id="address"
                formControlName="address"
                placeholder="Enter full address"
                rows="2"
                class="w-full"
              ></textarea>
            </div>

            <!-- Phone -->
            <div class="flex flex-col">
              <label for="phone" class="text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                pInputText
                id="phone"
                formControlName="phone"
                placeholder="e.g., +62 21 1234567"
                class="w-full"
              />
            </div>

            <!-- Manager ID -->
            <div class="flex flex-col">
              <label for="manager_id" class="text-sm font-medium text-gray-700 mb-1">
                Manager ID
              </label>
              <input
                pInputText
                id="manager_id"
                formControlName="manager_id"
                placeholder="Enter manager ID"
                class="w-full"
              />
            </div>
          </div>
        </div>

        <!-- Capacity Information Card -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Capacity Information</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Capacity -->
            <div class="flex flex-col">
              <label for="capacity" class="text-sm font-medium text-gray-700 mb-1">
                Total Capacity
              </label>
              <p-inputNumber
                inputId="capacity"
                formControlName="capacity"
                placeholder="Enter capacity"
                [min]="0"
                [showButtons]="true"
                styleClass="w-full"
              ></p-inputNumber>
              <small class="text-gray-500 mt-1">Maximum storage capacity</small>
            </div>

            <!-- Current Utilization -->
            <div class="flex flex-col">
              <label for="current_utilization" class="text-sm font-medium text-gray-700 mb-1">
                Current Utilization
              </label>
              <p-inputNumber
                inputId="current_utilization"
                formControlName="current_utilization"
                placeholder="Enter current utilization"
                [min]="0"
                [showButtons]="true"
                styleClass="w-full"
              ></p-inputNumber>
              <small class="text-gray-500 mt-1">Current storage usage</small>
            </div>

            <!-- Utilization Display -->
            @if (warehouseForm.get('capacity')?.value && warehouseForm.get('capacity')?.value > 0) {
              <div class="md:col-span-2 bg-gray-50 rounded-lg p-4">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-sm font-medium text-gray-700">Utilization</span>
                  <span class="text-sm font-semibold text-gray-900">
                    {{ getUtilizationPercentage() }}%
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="h-2 rounded-full transition-all"
                    [class.bg-green-500]="getUtilizationPercentage() < 70"
                    [class.bg-yellow-500]="getUtilizationPercentage() >= 70 && getUtilizationPercentage() < 90"
                    [class.bg-red-500]="getUtilizationPercentage() >= 90"
                    [style.width.%]="getUtilizationPercentage()"
                  ></div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Bonded Warehouse Information Card -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Bonded Warehouse Information</h2>
          
          <!-- Is Bonded Checkbox -->
          <div class="flex items-center gap-2 mb-4">
            <p-checkbox
              inputId="is_bonded"
              formControlName="is_bonded"
              [binary]="true"
            ></p-checkbox>
            <label for="is_bonded" class="text-sm font-medium text-gray-700 cursor-pointer">
              This is a bonded warehouse
            </label>
          </div>

          <!-- License Information (shown only if bonded) -->
          @if (warehouseForm.get('is_bonded')?.value) {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-blue-50 rounded-lg">
              <!-- License Number -->
              <div class="flex flex-col">
                <label for="license_number" class="text-sm font-medium text-gray-700 mb-1">
                  License Number <span class="text-red-500">*</span>
                </label>
                <input
                  pInputText
                  id="license_number"
                  formControlName="license_number"
                  placeholder="e.g., KB-001-2024"
                  class="w-full"
                  [class.ng-invalid]="isFieldInvalid('license_number')"
                  [class.ng-dirty]="warehouseForm.get('license_number')?.dirty"
                />
                @if (isFieldInvalid('license_number')) {
                  <small class="text-red-600 mt-1">License number is required for bonded warehouses</small>
                }
              </div>

              <!-- License Expiry -->
              <div class="flex flex-col">
                <label for="license_expiry" class="text-sm font-medium text-gray-700 mb-1">
                  License Expiry Date <span class="text-red-500">*</span>
                </label>
                <p-datepicker
                  inputId="license_expiry"
                  formControlName="license_expiry"
                  placeholder="Select expiry date"
                  [showIcon]="true"
                  dateFormat="dd/mm/yy"
                  styleClass="w-full"
                ></p-datepicker>
                @if (isFieldInvalid('license_expiry')) {
                  <small class="text-red-600 mt-1">License expiry date is required for bonded warehouses</small>
                }
                @if (isLicenseExpiringSoon()) {
                  <small class="text-orange-600 mt-1 flex items-center gap-1">
                    <i class="pi pi-exclamation-triangle"></i>
                    License expires within 30 days
                  </small>
                }
              </div>
            </div>
          }
        </div>

        <!-- Status Card -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Status</h2>
          
          <div class="flex items-center gap-2">
            <p-checkbox
              inputId="active"
              formControlName="active"
              [binary]="true"
            ></p-checkbox>
            <label for="active" class="text-sm font-medium text-gray-700 cursor-pointer">
              Active
            </label>
          </div>
          <small class="text-gray-500 mt-1 block">Inactive warehouses cannot be used for transactions</small>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end gap-3 pt-4">
          <button
            pButton
            type="button"
            label="Cancel"
            icon="pi pi-times"
            class="p-button-text"
            (click)="onCancel()"
          ></button>
          <button
            pButton
            type="submit"
            [label]="isEditMode ? 'Update Warehouse' : 'Create Warehouse'"
            icon="pi pi-check"
            [loading]="loading"
            [disabled]="warehouseForm.invalid || loading"
          ></button>
        </div>
      </form>
    </div>
  `
})
export class WarehouseFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private warehouseService = inject(WarehouseDemoService);

    // Icons
    WarehouseIconImg = WarehouseIcon;
    SaveIconImg = Save;
    XIconImg = X;

    // Form
    warehouseForm!: FormGroup;
    isEditMode = false;
    warehouseId: string | null = null;
    loading = false;
    error: string | null = null;

    // Dropdown options
    warehouseTypeOptions = [
        { label: 'Raw Material', value: WarehouseType.RAW_MATERIAL },
        { label: 'Work In Progress', value: WarehouseType.WIP },
        { label: 'Finished Goods', value: WarehouseType.FINISHED_GOODS },
        { label: 'Quarantine', value: WarehouseType.QUARANTINE }
    ];

    ngOnInit(): void {
        this.initializeForm();
        this.checkEditMode();
        this.setupBondedValidation();
    }

    initializeForm(): void {
        this.warehouseForm = this.fb.group({
            warehouse_code: ['', Validators.required],
            warehouse_name: ['', Validators.required],
            location: ['', Validators.required],
            warehouse_type: [WarehouseType.RAW_MATERIAL, Validators.required],
            capacity: [null],
            current_utilization: [0],
            manager_id: [''],
            address: [''],
            phone: [''],
            is_bonded: [false],
            license_number: [''],
            license_expiry: [null],
            active: [true]
        });
    }

    setupBondedValidation(): void {
        // Add conditional validation for bonded warehouse fields
        this.warehouseForm.get('is_bonded')?.valueChanges.subscribe(isBonded => {
            const licenseNumberControl = this.warehouseForm.get('license_number');
            const licenseExpiryControl = this.warehouseForm.get('license_expiry');

            if (isBonded) {
                licenseNumberControl?.setValidators([Validators.required]);
                licenseExpiryControl?.setValidators([Validators.required]);
            } else {
                licenseNumberControl?.clearValidators();
                licenseExpiryControl?.clearValidators();
                licenseNumberControl?.setValue('');
                licenseExpiryControl?.setValue(null);
            }

            licenseNumberControl?.updateValueAndValidity();
            licenseExpiryControl?.updateValueAndValidity();
        });
    }

    checkEditMode(): void {
        this.warehouseId = this.route.snapshot.paramMap.get('id');
        if (this.warehouseId) {
            this.isEditMode = true;
            this.loadWarehouse(this.warehouseId);
        }
    }

    loadWarehouse(id: string): void {
        this.loading = true;
        this.warehouseService.getById(id).subscribe({
            next: (warehouse) => {
                this.warehouseForm.patchValue({
                    ...warehouse,
                    license_expiry: warehouse.license_expiry ? new Date(warehouse.license_expiry) : null
                });
                this.loading = false;
            },
            error: (error) => {
                this.error = error.error?.message || 'Failed to load warehouse';
                this.loading = false;
            }
        });
    }

    onSubmit(): void {
        if (this.warehouseForm.invalid) {
            Object.keys(this.warehouseForm.controls).forEach(key => {
                this.warehouseForm.get(key)?.markAsTouched();
            });
            return;
        }

        this.loading = true;
        this.error = null;

        const warehouseData = this.warehouseForm.value;

        const operation = this.isEditMode && this.warehouseId
            ? this.warehouseService.update(this.warehouseId, warehouseData)
            : this.warehouseService.create(warehouseData);

        operation.subscribe({
            next: () => {
                this.router.navigate(['/warehouses']);
            },
            error: (error) => {
                this.error = error.error?.message || 'Failed to save warehouse';
                this.loading = false;
            }
        });
    }

    onCancel(): void {
        this.router.navigate(['/warehouses']);
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.warehouseForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    getUtilizationPercentage(): number {
        const capacity = this.warehouseForm.get('capacity')?.value || 0;
        const utilization = this.warehouseForm.get('current_utilization')?.value || 0;

        if (capacity === 0) {
            return 0;
        }

        return Math.round((utilization / capacity) * 100);
    }

    isLicenseExpiringSoon(): boolean {
        const licenseExpiry = this.warehouseForm.get('license_expiry')?.value;
        if (!licenseExpiry) {
            return false;
        }

        const now = new Date();
        const expiryDate = new Date(licenseExpiry);
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
    }
}
