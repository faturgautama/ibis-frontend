import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';

// PrimeNG imports
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { CardModule } from 'primeng/card';

// Lucide icons
import { LucideAngularModule, Save, X, Upload, Package } from 'lucide-angular';

// Store
import { InventoryActions } from '../../../../store/inventory/inventory.actions';
import { selectSelectedItem, selectInventoryLoading } from '../../../../store/inventory/inventory.selectors';

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
        LucideAngularModule
    ],
    template: `
    <div class="p-6 max-w-5xl mx-auto">
      <!-- Page Header -->
      <div class="mb-6">
        <div class="flex items-center gap-2 mb-2">
          <lucide-icon [img]="PackageIcon" class="w-6 h-6 text-sky-600"></lucide-icon>
          <h1 class="text-2xl font-semibold text-gray-900">
            {{ isEditMode ? 'Edit Item' : 'Create New Item' }}
          </h1>
        </div>
        <p class="text-sm text-gray-600">
          {{ isEditMode ? 'Update item information' : 'Add a new item to your inventory' }}
        </p>
      </div>

      <!-- Form Card -->
      <div class="bg-white rounded-lg shadow-sm p-6">
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
                  [class.ng-invalid]="itemForm.get('item_code')?.invalid && itemForm.get('item_code')?.touched"
                />
                <small
                  *ngIf="itemForm.get('item_code')?.invalid && itemForm.get('item_code')?.touched"
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
                  [class.ng-invalid]="itemForm.get('item_name')?.invalid && itemForm.get('item_name')?.touched"
                />
                <small
                  *ngIf="itemForm.get('item_name')?.invalid && itemForm.get('item_name')?.touched"
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
                  [class.ng-invalid]="itemForm.get('hs_code')?.invalid && itemForm.get('hs_code')?.touched"
                />
                <small
                  *ngIf="itemForm.get('hs_code')?.hasError('required') && itemForm.get('hs_code')?.touched"
                  class="text-red-500 text-xs mt-1"
                >
                  HS Code is required
                </small>
                <small
                  *ngIf="itemForm.get('hs_code')?.hasError('pattern') && itemForm.get('hs_code')?.touched"
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
                  [class.ng-invalid]="itemForm.get('item_type')?.invalid && itemForm.get('item_type')?.touched"
                ></p-select>
                <small
                  *ngIf="itemForm.get('item_type')?.invalid && itemForm.get('item_type')?.touched"
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
                  [class.ng-invalid]="itemForm.get('unit')?.invalid && itemForm.get('unit')?.touched"
                ></p-select>
                <small
                  *ngIf="itemForm.get('unit')?.invalid && itemForm.get('unit')?.touched"
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
              <div *ngIf="itemForm.get('image_url')?.value" class="mt-3">
                <img
                  [src]="itemForm.get('image_url')?.value"
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
              [label]="isEditMode ? 'Update Item' : 'Create Item'"
              icon="pi pi-check"
              [loading]="(loading$ | async) || false"
              [disabled]="itemForm.invalid"
            ></button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ItemFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private store = inject(Store);
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

    // Observables
    loading$: Observable<boolean>;

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

    constructor() {
        this.loading$ = this.store.select(selectInventoryLoading);
        this.initializeForm();
    }

    ngOnInit(): void {
        // Check if we're in edit mode
        this.itemId = this.route.snapshot.paramMap.get('id');
        this.isEditMode = !!this.itemId;

        if (this.isEditMode && this.itemId) {
            // Load item data for editing
            this.store.dispatch(InventoryActions.loadItem({ id: this.itemId }));

            // Subscribe to selected item and populate form
            this.store
                .select(selectSelectedItem)
                .pipe(
                    filter(item => !!item),
                    take(1)
                )
                .subscribe(item => {
                    if (item) {
                        this.populateForm(item);
                    }
                });
        }
    }

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

    onSubmit(): void {
        if (this.itemForm.invalid) {
            // Mark all fields as touched to show validation errors
            Object.keys(this.itemForm.controls).forEach(key => {
                this.itemForm.get(key)?.markAsTouched();
            });
            return;
        }

        const formValue = this.itemForm.value;

        if (this.isEditMode && this.itemId) {
            // Update existing item
            const updateData: UpdateItemDto = {
                ...formValue
            };
            this.store.dispatch(InventoryActions.updateItem({ id: this.itemId, item: updateData }));
        } else {
            // Create new item
            const createData: CreateItemDto = {
                ...formValue
            };
            this.store.dispatch(InventoryActions.createItem({ item: createData }));
        }

        // Navigate back to list after a short delay
        setTimeout(() => {
            this.router.navigate(['/inventory/items']);
        }, 500);
    }

    onCancel(): void {
        this.router.navigate(['/inventory/items']);
    }

    onImageUpload(event: any): void {
        // In a real application, this would upload to a server
        // For demo purposes, we'll use a data URL
        const file = event.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.itemForm.patchValue({ image_url: e.target.result });
            };
            reader.readAsDataURL(file);
        }
    }
}
