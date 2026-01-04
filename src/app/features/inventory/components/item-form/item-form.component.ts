import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';

// PrimeNG imports
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';

// Lucide icons
import { LucideAngularModule, Save, X, Upload, Package } from 'lucide-angular';

// Services
import { InventoryDemoService } from '../../services/inventory-demo.service';

// Models
import { Item, ItemType, FacilityStatus, CreateItemDto, UpdateItemDto } from '../../models/item.model';

/**
 * Item Form Component
 * 
 * Form for creating and editing inventory items.
 * Uses Tailwind CSS inline styling (no separate .scss file).
 * 
 * Requirements: 2.2, 2.3, 2.7, 2.8
 */
@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    SelectModule,
    CheckboxModule,
    ButtonModule,
    FileUploadModule,
    CardModule,
    ToastModule,
    LucideAngularModule
  ],
  providers: [MessageService],
  template: `
    <div class="main-layout overflow-hidden">
      <!-- Page Header -->
      <div class="mb-6">
        <div class="flex items-center gap-2 mb-2">
          <lucide-icon [img]="PackageIcon" class="w-6 h-6 text-sky-600"></lucide-icon>
          <h1 class="text-2xl font-semibold text-gray-900">
            {{ pageTitle }}
          </h1>
        </div>
        <p class="text-sm text-gray-600">
          {{ pageDescription }}
        </p>
      </div>

      <!-- Form Card -->
      <div class="bg-white rounded-lg shadow-sm p-6" style="max-height: calc(100vh - 13rem); overflow-x: auto">
        <form [formGroup]="itemForm" (ngSubmit)="onSubmit()">
          <!-- Basic Information Section -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Basic Information
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Item Code -->
              <div class="flex flex-col">
                <label for="item_code" class="text-sm font-medium text-gray-700 mb-1">
                  Item Code <span class="text-red-500">*</span>
                </label>
                <input
                  id="item_code"
                  type="text"
                  pInputText
                  formControlName="item_code"
                  placeholder="e.g., RM-001"
                  class="w-full"
                  [class.ng-invalid]="isItemCodeInvalid"
                />
                <small
                  *ngIf="isItemCodeInvalid"
                  class="text-red-500 text-xs mt-1"
                >
                  Item code is required
                </small>
              </div>

              <!-- Item Name -->
              <div class="flex flex-col">
                <label for="item_name" class="text-sm font-medium text-gray-700 mb-1">
                  Item Name <span class="text-red-500">*</span>
                </label>
                <input
                  id="item_name"
                  type="text"
                  pInputText
                  formControlName="item_name"
                  placeholder="e.g., Steel Plate A36"
                  class="w-full"
                  [class.ng-invalid]="isItemNameInvalid"
                />
                <small
                  *ngIf="isItemNameInvalid"
                  class="text-red-500 text-xs mt-1"
                >
                  Item name is required
                </small>
              </div>

              <!-- HS Code -->
              <div class="flex flex-col">
                <label for="hs_code" class="text-sm font-medium text-gray-700 mb-1">
                  HS Code (10 digits) <span class="text-red-500">*</span>
                </label>
                <input
                  id="hs_code"
                  type="text"
                  pInputText
                  formControlName="hs_code"
                  placeholder="e.g., 7208390000"
                  maxlength="10"
                  class="w-full font-mono"
                  [class.ng-invalid]="isHsCodeInvalid"
                />
                <small
                  *ngIf="hasHsCodeRequiredError"
                  class="text-red-500 text-xs mt-1"
                >
                  HS Code is required
                </small>
                <small
                  *ngIf="hasHsCodePatternError"
                  class="text-red-500 text-xs mt-1"
                >
                  HS Code must be exactly 10 digits
                </small>
              </div>

              <!-- Item Type -->
              <div class="flex flex-col">
                <label for="item_type" class="text-sm font-medium text-gray-700 mb-1">
                  Item Type <span class="text-red-500">*</span>
                </label>
                <p-select
                  id="item_type"
                  [options]="itemTypeOptions"
                  formControlName="item_type"
                  placeholder="Select item type"
                  styleClass="w-full"
                  [class.ng-invalid]="isItemTypeInvalid"
                ></p-select>
                <small
                  *ngIf="isItemTypeInvalid"
                  class="text-red-500 text-xs mt-1"
                >
                  Item type is required
                </small>
              </div>

              <!-- Unit -->
              <div class="flex flex-col">
                <label for="unit" class="text-sm font-medium text-gray-700 mb-1">
                  Unit <span class="text-red-500">*</span>
                </label>
                <p-select
                  id="unit"
                  [options]="unitOptions"
                  formControlName="unit"
                  placeholder="Select unit"
                  [editable]="true"
                  styleClass="w-full"
                  [class.ng-invalid]="isUnitInvalid"
                ></p-select>
                <small
                  *ngIf="isUnitInvalid"
                  class="text-red-500 text-xs mt-1"
                >
                  Unit is required
                </small>
              </div>

              <!-- Facility Status -->
              <div class="flex flex-col">
                <label for="facility_status" class="text-sm font-medium text-gray-700 mb-1">
                  Facility Status <span class="text-red-500">*</span>
                </label>
                <p-select
                  id="facility_status"
                  [options]="facilityStatusOptions"
                  formControlName="facility_status"
                  placeholder="Select facility status"
                  styleClass="w-full"
                ></p-select>
              </div>

              <!-- Description (Full Width) -->
              <div class="flex flex-col md:col-span-2">
                <label for="description" class="text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  pInputTextarea
                  formControlName="description"
                  placeholder="Enter item description..."
                  rows="3"
                  class="w-full"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Additional Details Section -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Additional Details
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Brand -->
              <div class="flex flex-col">
                <label for="brand" class="text-sm font-medium text-gray-700 mb-1">Brand</label>
                <input
                  id="brand"
                  type="text"
                  pInputText
                  formControlName="brand"
                  placeholder="e.g., Krakatau Steel"
                  class="w-full"
                />
              </div>

              <!-- Category ID -->
              <div class="flex flex-col">
                <label for="category_id" class="text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  id="category_id"
                  type="text"
                  pInputText
                  formControlName="category_id"
                  placeholder="Category ID"
                  class="w-full"
                />
              </div>

              <!-- Barcode -->
              <div class="flex flex-col">
                <label for="barcode" class="text-sm font-medium text-gray-700 mb-1">Barcode</label>
                <input
                  id="barcode"
                  type="text"
                  pInputText
                  formControlName="barcode"
                  placeholder="Barcode number"
                  class="w-full font-mono"
                />
              </div>

              <!-- RFID Tag -->
              <div class="flex flex-col">
                <label for="rfid_tag" class="text-sm font-medium text-gray-700 mb-1">RFID Tag</label>
                <input
                  id="rfid_tag"
                  type="text"
                  pInputText
                  formControlName="rfid_tag"
                  placeholder="RFID tag number"
                  class="w-full font-mono"
                />
              </div>
            </div>
          </div>

          <!-- Stock Management Section -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Stock Management
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Min Stock -->
              <div class="flex flex-col">
                <label for="min_stock" class="text-sm font-medium text-gray-700 mb-1">
                  Minimum Stock
                </label>
                <p-inputNumber
                  id="min_stock"
                  formControlName="min_stock"
                  [min]="0"
                  placeholder="0"
                  styleClass="w-full"
                ></p-inputNumber>
              </div>

              <!-- Max Stock -->
              <div class="flex flex-col">
                <label for="max_stock" class="text-sm font-medium text-gray-700 mb-1">
                  Maximum Stock
                </label>
                <p-inputNumber
                  id="max_stock"
                  formControlName="max_stock"
                  [min]="0"
                  placeholder="0"
                  styleClass="w-full"
                ></p-inputNumber>
              </div>

              <!-- Reorder Point -->
              <div class="flex flex-col">
                <label for="reorder_point" class="text-sm font-medium text-gray-700 mb-1">
                  Reorder Point
                </label>
                <p-inputNumber
                  id="reorder_point"
                  formControlName="reorder_point"
                  [min]="0"
                  placeholder="0"
                  styleClass="w-full"
                ></p-inputNumber>
              </div>

              <!-- Lead Time Days -->
              <div class="flex flex-col">
                <label for="lead_time_days" class="text-sm font-medium text-gray-700 mb-1">
                  Lead Time (days)
                </label>
                <p-inputNumber
                  id="lead_time_days"
                  formControlName="lead_time_days"
                  [min]="0"
                  placeholder="0"
                  styleClass="w-full"
                ></p-inputNumber>
              </div>

              <!-- Shelf Life Days -->
              <div class="flex flex-col">
                <label for="shelf_life_days" class="text-sm font-medium text-gray-700 mb-1">
                  Shelf Life (days)
                </label>
                <p-inputNumber
                  id="shelf_life_days"
                  formControlName="shelf_life_days"
                  [min]="0"
                  placeholder="0"
                  styleClass="w-full"
                ></p-inputNumber>
              </div>

              <!-- Storage Condition -->
              <div class="flex flex-col">
                <label for="storage_condition" class="text-sm font-medium text-gray-700 mb-1">
                  Storage Condition
                </label>
                <input
                  id="storage_condition"
                  type="text"
                  pInputText
                  formControlName="storage_condition"
                  placeholder="e.g., Cool, dry place"
                  class="w-full"
                />
              </div>
            </div>
          </div>

          <!-- Pricing Section -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Pricing
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Price -->
              <div class="flex flex-col">
                <label for="price" class="text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                <p-inputNumber
                  id="price"
                  formControlName="price"
                  mode="currency"
                  currency="IDR"
                  locale="id-ID"
                  [min]="0"
                  placeholder="0"
                  styleClass="w-full"
                ></p-inputNumber>
              </div>

              <!-- Currency -->
              <div class="flex flex-col">
                <label for="currency" class="text-sm font-medium text-gray-700 mb-1">Currency</label>
                <p-select
                  id="currency"
                  [options]="currencyOptions"
                  formControlName="currency"
                  placeholder="Select currency"
                  styleClass="w-full"
                ></p-select>
              </div>
            </div>
          </div>

          <!-- Flags Section -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Item Flags
            </h2>
            <div class="flex flex-col gap-3">
              <!-- Is Hazardous -->
              <div class="flex items-center gap-2">
                <p-checkbox
                  formControlName="is_hazardous"
                  [binary]="true"
                  inputId="is_hazardous"
                ></p-checkbox>
                <label for="is_hazardous" class="text-sm font-medium text-gray-700 cursor-pointer">
                  Hazardous Material
                  <span class="text-xs text-gray-500 ml-1">(Requires special handling)</span>
                </label>
              </div>

              <!-- Active -->
              <div class="flex items-center gap-2">
                <p-checkbox
                  formControlName="active"
                  [binary]="true"
                  inputId="active"
                ></p-checkbox>
                <label for="active" class="text-sm font-medium text-gray-700 cursor-pointer">
                  Active
                  <span class="text-xs text-gray-500 ml-1">(Item is available for transactions)</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Image Upload Section -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Item Image
            </h2>
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-2">Upload Image</label>
              <p-fileUpload
                mode="basic"
                chooseLabel="Choose Image"
                [auto]="true"
                accept="image/*"
                [maxFileSize]="2000000"
                (onUpload)="onImageUpload($event)"
                styleClass="w-full"
              ></p-fileUpload>
              <small class="text-gray-500 text-xs mt-1">
                Maximum file size: 2MB. Supported formats: JPG, PNG, GIF
              </small>
              <div *ngIf="hasImageUrl" class="mt-3">
                <img
                  [src]="imageUrl"
                  alt="Item image"
                  class="w-32 h-32 object-cover rounded-lg border border-gray-200"
                />
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              pButton
              label="Cancel"
              icon="pi pi-times"
              class="p-button-text p-button-secondary"
              (click)="onCancel()"
            ></button>
            <button
              type="submit"
              pButton
              [label]="submitButtonLabel"
              icon="pi pi-check"
              [disabled]="itemForm.invalid || loading"
              [loading]="loading"
            ></button>
          </div>
        </form>
      </div>
      
      <p-toast />
    </div>
  `
})
export class ItemFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private inventoryService = inject(InventoryDemoService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Icons
  PackageIcon = Package;
  SaveIcon = Save;
  XIcon = X;
  UploadIcon = Upload;

  // Form
  itemForm!: FormGroup;
  isEditMode = false;
  itemId: string | null = null;
  loading = false;

  // Dropdown options
  itemTypeOptions = [
    { label: 'Raw Material', value: ItemType.RAW },
    { label: 'Work In Progress', value: ItemType.WIP },
    { label: 'Finished Goods', value: ItemType.FG },
    { label: 'Asset', value: ItemType.ASSET }
  ];

  facilityStatusOptions = [
    { label: 'Fasilitas (Bonded)', value: FacilityStatus.FASILITAS },
    { label: 'Non-Fasilitas', value: FacilityStatus.NON }
  ];

  unitOptions = [
    { label: 'Pieces (pcs)', value: 'pcs' },
    { label: 'Kilogram (kg)', value: 'kg' },
    { label: 'Meter (m)', value: 'm' },
    { label: 'Liter (liter)', value: 'liter' },
    { label: 'Box (box)', value: 'box' }
  ];

  currencyOptions = [
    { label: 'IDR - Indonesian Rupiah', value: 'IDR' },
    { label: 'USD - US Dollar', value: 'USD' },
    { label: 'EUR - Euro', value: 'EUR' },
    { label: 'SGD - Singapore Dollar', value: 'SGD' }
  ];

  ngOnInit(): void {
    // Check if we're in edit mode
    this.itemId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.itemId;

    if (this.isEditMode && this.itemId) {
      this.loadItemForEditing(this.itemId);
    }
  }

  /**
   * Computed property: Get page title based on mode
   */
  get pageTitle(): string {
    return this.isEditMode ? 'Edit Item' : 'Create New Item';
  }

  /**
   * Computed property: Get page description based on mode
   */
  get pageDescription(): string {
    return this.isEditMode ? 'Update item information' : 'Add a new item to your inventory';
  }

  /**
   * Computed property: Get submit button label based on mode
   */
  get submitButtonLabel(): string {
    return this.isEditMode ? 'Update Item' : 'Create Item';
  }

  /**
   * Computed property: Check if item code field is invalid and touched
   */
  get isItemCodeInvalid(): boolean {
    return this.isFieldInvalid('item_code');
  }

  /**
   * Computed property: Check if item name field is invalid and touched
   */
  get isItemNameInvalid(): boolean {
    return this.isFieldInvalid('item_name');
  }

  /**
   * Computed property: Check if HS code field is invalid and touched
   */
  get isHsCodeInvalid(): boolean {
    return this.isFieldInvalid('hs_code');
  }

  /**
   * Computed property: Check if HS code has required error
   */
  get hasHsCodeRequiredError(): boolean {
    return this.hasFieldError('hs_code', 'required');
  }

  /**
   * Computed property: Check if HS code has pattern error
   */
  get hasHsCodePatternError(): boolean {
    return this.hasFieldError('hs_code', 'pattern');
  }

  /**
   * Computed property: Check if item type field is invalid and touched
   */
  get isItemTypeInvalid(): boolean {
    return this.isFieldInvalid('item_type');
  }

  /**
   * Computed property: Check if unit field is invalid and touched
   */
  get isUnitInvalid(): boolean {
    return this.isFieldInvalid('unit');
  }

  /**
   * Computed property: Check if image URL exists
   */
  get hasImageUrl(): boolean {
    return !!this.itemForm.get('image_url')?.value;
  }

  /**
   * Computed property: Get image URL value
   */
  get imageUrl(): string {
    return this.itemForm.get('image_url')?.value || '';
  }

  /**
   * Check if a form field is invalid and touched
   */
  private isFieldInvalid(fieldName: string): boolean {
    const field = this.itemForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  /**
   * Check if a form field has a specific error
   */
  private hasFieldError(fieldName: string, errorType: string): boolean {
    const field = this.itemForm.get(fieldName);
    return !!(field?.hasError(errorType) && field?.touched);
  }

  /**
   * Load item data for editing
   */
  private loadItemForEditing(itemId: string): void {
    this.loading = true;
    this.inventoryService.getById(itemId).subscribe({
      next: (item) => {
        this.populateForm(item);
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load item'
        });
        this.loading = false;
        this.navigateToItemsList();
      }
    });
  }

  /**
   * Initialize the form with validators
   */
  private initializeForm(): void {
    this.itemForm = this.fb.group({
      item_code: ['', Validators.required],
      item_name: ['', Validators.required],
      hs_code: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      item_type: [null, Validators.required],
      unit: ['', Validators.required],
      facility_status: [FacilityStatus.FASILITAS, Validators.required],
      description: [''],
      brand: [''],
      category_id: [''],
      barcode: [''],
      rfid_tag: [''],
      min_stock: [null],
      max_stock: [null],
      reorder_point: [null],
      lead_time_days: [null],
      shelf_life_days: [null],
      storage_condition: [''],
      price: [null],
      currency: ['IDR'],
      is_hazardous: [false],
      active: [true],
      image_url: ['']
    });
  }

  /**
   * Populate form with item data
   */
  private populateForm(item: Item): void {
    this.itemForm.patchValue({
      item_code: item.item_code,
      item_name: item.item_name,
      hs_code: item.hs_code,
      item_type: item.item_type,
      unit: item.unit,
      facility_status: item.facility_status,
      description: item.description || '',
      brand: item.brand || '',
      category_id: item.category_id || '',
      barcode: item.barcode || '',
      rfid_tag: item.rfid_tag || '',
      min_stock: item.min_stock || null,
      max_stock: item.max_stock || null,
      reorder_point: item.reorder_point || null,
      lead_time_days: item.lead_time_days || null,
      shelf_life_days: item.shelf_life_days || null,
      storage_condition: item.storage_condition || '',
      price: item.price || null,
      currency: item.currency || 'IDR',
      is_hazardous: item.is_hazardous,
      active: item.active,
      image_url: item.image_url || ''
    });
  }

  /**
   * Mark all form fields as touched to show validation errors
   */
  private markAllFieldsAsTouched(): void {
    Object.keys(this.itemForm.controls).forEach(key => {
      this.itemForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Dispatch create or update action based on mode
   */
  private submitFormData(): void {
    const formValue = this.itemForm.value;
    this.loading = true;

    if (this.isEditMode && this.itemId) {
      const updateData: UpdateItemDto = { ...formValue };
      this.inventoryService.update(this.itemId, updateData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Item updated successfully'
          });
          this.loading = false;
          setTimeout(() => this.navigateToItemsList(), 500);
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Failed to update item'
          });
          this.loading = false;
        }
      });
    } else {
      const createData: CreateItemDto = { ...formValue };
      this.inventoryService.create(createData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Item created successfully'
          });
          this.loading = false;
          setTimeout(() => this.navigateToItemsList(), 500);
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Failed to create item'
          });
          this.loading = false;
        }
      });
    }
  }

  /**
   * Navigate back to items list
   */
  private navigateToItemsList(): void {
    this.router.navigate(['/inventory']);
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.submitFormData();
  }

  /**
   * Handle cancel button click
   */
  onCancel(): void {
    this.navigateToItemsList();
  }

  /**
   * Handle image upload
   */
  onImageUpload(event: any): void {
    const file = event.files[0];
    if (file) {
      this.convertImageToDataUrl(file);
    }
  }

  /**
   * Convert uploaded image file to data URL
   */
  private convertImageToDataUrl(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.itemForm.patchValue({ image_url: e.target.result });
    };
    reader.readAsDataURL(file);
  }
}
