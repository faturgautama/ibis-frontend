import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';

// Lucide icons
import { LucideAngularModule, Users } from 'lucide-angular';

// Services
import { SupplierDemoService } from '../../services/supplier-demo.service';

// Models
import { Supplier, validateNPWP, formatNPWP } from '../../models/supplier.model';

/**
 * Supplier Form Component
 * Requirements: 4.1, 4.2, 4.3
 */
@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    CheckboxModule,
    MessageModule,
    LucideAngularModule
  ],
  template: `
    <div class="main-layout overflow-hidden">
      <!-- Page Header -->
      <div class="mb-6">
        <div class="flex items-center gap-2 mb-2">
          <lucide-icon [img]="UsersIcon" class="w-6 h-6 text-sky-600"></lucide-icon>
          <h1 class="text-2xl font-semibold text-gray-900">
            {{ isEditMode ? 'Edit Supplier' : 'Create Supplier' }}
          </h1>
        </div>
        <p class="text-sm text-gray-600">
          {{ isEditMode ? 'Update supplier information' : 'Add a new supplier to the system' }}
        </p>
      </div>

      <!-- Form Card -->
      <div class="bg-white rounded-lg shadow-sm p-6" style="max-height: calc(100vh - 13rem); overflow-y: auto">
        <form [formGroup]="supplierForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Basic Information -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Basic Information</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">
                Supplier Code <span class="text-red-500">*</span>
              </label>
              <input pInputText formControlName="supplier_code" class="w-full" />
              <small *ngIf="isFieldInvalid('supplier_code')" class="text-red-600 mt-1">Supplier code is required</small>
            </div>

            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">
                Supplier Name <span class="text-red-500">*</span>
              </label>
              <input pInputText formControlName="supplier_name" class="w-full" />
              <small *ngIf="isFieldInvalid('supplier_name')" class="text-red-600 mt-1">Supplier name is required</small>
            </div>

            <div class="flex flex-col md:col-span-2">
              <label class="text-sm font-medium text-gray-700 mb-1">
                Address <span class="text-red-500">*</span>
              </label>
              <textarea pInputTextarea formControlName="address" rows="2" class="w-full"></textarea>
              <small *ngIf="isFieldInvalid('address')" class="text-red-600 mt-1">Address is required</small>
            </div>

            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">City</label>
              <input pInputText formControlName="city" class="w-full" />
            </div>

            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">
                Tax ID (NPWP) <span class="text-red-500">*</span>
              </label>
              <input
                pInputText
                formControlName="tax_id"
                placeholder="XX.XXX.XXX.X-XXX.XXX"
                (blur)="onNPWPBlur()"
                class="w-full font-mono"
              />
              <small *ngIf="isFieldInvalid('tax_id')" class="text-red-600 mt-1">
                {{ supplierForm.get('tax_id')?.hasError('required') ? 'Tax ID is required' : 'Invalid NPWP format' }}
              </small>
              <small class="text-gray-500 mt-1">Format: XX.XXX.XXX.X-XXX.XXX</small>
            </div>

            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">Contact Person</label>
              <input pInputText formControlName="contact_person" class="w-full" />
            </div>

            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input pInputText formControlName="phone" class="w-full" />
            </div>

            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">Email</label>
              <input pInputText type="email" formControlName="email" class="w-full" />
            </div>
          </div>
        </div>

        <!-- Status -->
        <div class="mb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Status</h2>
          <div class="flex items-center gap-2">
            <p-checkbox formControlName="active" [binary]="true" inputId="active"></p-checkbox>
            <label for="active" class="text-sm font-medium text-gray-700 cursor-pointer">Active</label>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button pButton type="button" label="Cancel" icon="pi pi-times" class="p-button-text p-button-secondary" (click)="onCancel()"></button>
          <button pButton type="submit" [label]="isEditMode ? 'Update' : 'Create'" icon="pi pi-check" [loading]="loading" [disabled]="supplierForm.invalid || loading"></button>
        </div>
      </form>
      </div>
    </div>
  `
})
export class SupplierFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private supplierService = inject(SupplierDemoService);

  UsersIcon = Users;
  supplierForm!: FormGroup;
  isEditMode = false;
  supplierId: string | null = null;
  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.initializeForm();
    this.checkEditMode();
  }

  initializeForm(): void {
    this.supplierForm = this.fb.group({
      supplier_code: ['', Validators.required],
      supplier_name: ['', Validators.required],
      address: ['', Validators.required],
      city: [''],
      postal_code: [''],
      country: ['Indonesia'],
      contact_person: [''],
      phone: [''],
      email: ['', Validators.email],
      tax_id: ['', [Validators.required, this.npwpValidator]],
      active: [true]
    });
  }

  npwpValidator(control: any) {
    if (!control.value) return null;
    return validateNPWP(control.value) ? null : { invalidNPWP: true };
  }

  onNPWPBlur(): void {
    const taxIdControl = this.supplierForm.get('tax_id');
    if (taxIdControl?.value) {
      const formatted = formatNPWP(taxIdControl.value);
      taxIdControl.setValue(formatted, { emitEvent: false });
    }
  }

  checkEditMode(): void {
    this.supplierId = this.route.snapshot.paramMap.get('id');
    if (this.supplierId) {
      this.isEditMode = true;
      this.loadSupplier(this.supplierId);
    }
  }

  loadSupplier(id: string): void {
    this.loading = true;
    this.supplierService.getById(id).subscribe({
      next: (supplier) => {
        this.supplierForm.patchValue(supplier);
        this.loading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to load supplier';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.supplierForm.invalid) {
      Object.keys(this.supplierForm.controls).forEach(key => {
        this.supplierForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.error = null;

    const operation = this.isEditMode && this.supplierId
      ? this.supplierService.update(this.supplierId, this.supplierForm.value)
      : this.supplierService.create(this.supplierForm.value);

    operation.subscribe({
      next: () => {
        this.router.navigate(['/suppliers']);
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to save supplier';
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/suppliers']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.supplierForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
