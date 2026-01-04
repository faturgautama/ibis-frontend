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
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';

// Lucide icons
import { LucideAngularModule, PackageCheck, Plus, Trash2 } from 'lucide-angular';

// Services
import { InboundDemoService } from '../../services/inbound-demo.service';
import { BCDocumentDemoService } from '../../../bc-documents/services/bc-document-demo.service';
import { InventoryDemoService } from '../../../inventory/services/inventory-demo.service';
import { SupplierDemoService } from '../../../suppliers-customers/services/supplier-demo.service';
import { WarehouseDemoService } from '../../../warehouse/services/warehouse-demo.service';

// Models
import { InboundHeader, InboundStatus, InboundDetail, QualityStatus } from '../../models/inbound.model';
import { BCDocument } from '../../../bc-documents/models/bc-document.model';
import { Item } from '../../../inventory/models/item.model';
import { Supplier } from '../../../suppliers-customers/models/supplier.model';
import { Warehouse } from '../../../warehouse/models/warehouse.model';

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
    DialogModule,
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
                <p-select
                  formControlName="bc_document_number"
                  [options]="bcDocumentOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select BC Document"
                  [filter]="true"
                  filterBy="label"
                  class="w-full"
                  (onChange)="onBCDocumentChange($event)"
                />
                <small *ngIf="isFieldInvalid('bc_document_number')" class="text-red-600 mt-1">BC document number is required</small>
              </div>

              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">
                  Supplier Name <span class="text-red-500">*</span>
                </label>
                <p-select
                  formControlName="supplier_name"
                  [options]="supplierOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select Supplier"
                  [filter]="true"
                  filterBy="label"
                  class="w-full"
                  (onChange)="onSupplierChange($event)"
                />
                <small *ngIf="isFieldInvalid('supplier_name')" class="text-red-600 mt-1">Supplier name is required</small>
              </div>

              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">
                  Warehouse <span class="text-red-500">*</span>
                </label>
                <p-select
                  formControlName="warehouse_name"
                  [options]="warehouseOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select Warehouse"
                  [filter]="true"
                  filterBy="label"
                  class="w-full"
                  (onChange)="onWarehouseChange($event)"
                />
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

          <!-- Items/Details Section -->
          <div class="mb-6">
            <div class="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Items</h2>
              <button
                pButton
                type="button"
                label="Add Item"
                icon="pi pi-plus"
                class="p-button-sm"
                (click)="showAddItemDialog()"
                [disabled]="isEditMode"
              ></button>
            </div>

            <p-table [value]="details" [paginator]="false">
              <ng-template pTemplate="header">
                <tr>
                  <th>Item Code</th>
                  <th>Item Name</th>
                  <th>Ordered Qty</th>
                  <th>Received Qty</th>
                  <th>Unit</th>
                  <th>Unit Cost</th>
                  <th>Total Cost</th>
                  <th>Batch</th>
                  <th>Actions</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-detail let-rowIndex="rowIndex">
                <tr>
                  <td>{{ detail.item_code }}</td>
                  <td>{{ detail.item_name }}</td>
                  <td>{{ detail.ordered_quantity }}</td>
                  <td>{{ detail.received_quantity }}</td>
                  <td>{{ detail.unit }}</td>
                  <td>{{ detail.unit_cost | number: '1.2-2' }}</td>
                  <td>{{ detail.total_cost | number: '1.2-2' }}</td>
                  <td>{{ detail.batch_number || '-' }}</td>
                  <td>
                    <div class="flex gap-2">
                      <button
                        pButton
                        icon="pi pi-pencil"
                        class="p-button-text p-button-sm"
                        (click)="showEditItemDialog(rowIndex)"
                        [disabled]="isEditMode"
                      ></button>
                      <button
                        pButton
                        icon="pi pi-trash"
                        class="p-button-text p-button-sm p-button-danger"
                        (click)="removeItem(rowIndex)"
                        [disabled]="isEditMode"
                      ></button>
                    </div>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="9" class="text-center text-gray-500 py-4">
                    No items added yet. Click "Add Item" to start.
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </div>

          <!-- Totals (Read-only) -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Summary</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-600 mb-1">Total Items</p>
                <p class="text-2xl font-semibold text-gray-900">{{ details.length }}</p>
              </div>

              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-600 mb-1">Total Quantity</p>
                <p class="text-2xl font-semibold text-gray-900">{{ calculateTotalQuantity() }}</p>
              </div>

              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-600 mb-1">Total Value</p>
                <p class="text-2xl font-semibold text-gray-900">{{ calculateTotalValue() | number: '1.2-2' }}</p>
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

      <!-- Add/Edit Item Dialog -->
      <p-dialog
        [(visible)]="displayItemDialog"
        [header]="isEditingItem ? 'Edit Item' : 'Add Item'"
        [modal]="true"
        [style]="{width: '800px'}"
        [draggable]="false"
      >
        <form [formGroup]="itemForm" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Item Selection -->
            <div class="flex flex-col md:col-span-2">
              <label class="text-sm font-medium text-gray-700 mb-1">
                Item <span class="text-red-500">*</span>
              </label>
              <p-select
                formControlName="item_id"
                [options]="itemOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select Item"
                [filter]="true"
                filterBy="label"
                class="w-full"
                (onChange)="onItemSelect($event)"
              />
            </div>

            <!-- Ordered Quantity -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">
                Ordered Quantity <span class="text-red-500">*</span>
              </label>
              <p-inputNumber
                formControlName="ordered_quantity"
                [min]="0"
                class="w-full"
              />
            </div>

            <!-- Received Quantity -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">
                Received Quantity <span class="text-red-500">*</span>
              </label>
              <p-inputNumber
                formControlName="received_quantity"
                [min]="0"
                class="w-full"
                (onInput)="calculateItemTotal()"
              />
            </div>

            <!-- Unit Cost -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">
                Unit Cost <span class="text-red-500">*</span>
              </label>
              <p-inputNumber
                formControlName="unit_cost"
                mode="currency"
                currency="IDR"
                locale="id-ID"
                [min]="0"
                class="w-full"
                (onInput)="calculateItemTotal()"
              />
            </div>

            <!-- Total Cost (Read-only) -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">Total Cost</label>
              <p-inputNumber
                formControlName="total_cost"
                mode="currency"
                currency="IDR"
                locale="id-ID"
                [readonly]="true"
                class="w-full"
              />
            </div>

            <!-- Batch Number -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">Batch Number</label>
              <input pInputText formControlName="batch_number" class="w-full" />
            </div>

            <!-- Lot Number -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">Lot Number</label>
              <input pInputText formControlName="lot_number" class="w-full" />
            </div>

            <!-- Manufacturing Date -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">Manufacturing Date</label>
              <p-datepicker
                formControlName="manufacturing_date"
                dateFormat="dd/mm/yy"
                [showIcon]="true"
                class="w-full"
              />
            </div>

            <!-- Expiry Date -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <p-datepicker
                formControlName="expiry_date"
                dateFormat="dd/mm/yy"
                [showIcon]="true"
                class="w-full"
              />
            </div>

            <!-- Quality Status -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">Quality Status</label>
              <p-select
                formControlName="quality_status"
                [options]="qualityStatusOptions"
                class="w-full"
              />
            </div>

            <!-- Location Code -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">Location Code</label>
              <input pInputText formControlName="location_code" class="w-full" />
            </div>

            <!-- Notes -->
            <div class="flex flex-col md:col-span-2">
              <label class="text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                pInputTextarea
                formControlName="notes"
                rows="2"
                class="w-full"
              ></textarea>
            </div>
          </div>
        </form>

        <ng-template pTemplate="footer">
          <button
            pButton
            label="Cancel"
            icon="pi pi-times"
            class="p-button-text"
            (click)="displayItemDialog = false"
          ></button>
          <button
            pButton
            [label]="isEditingItem ? 'Update' : 'Add'"
            icon="pi pi-check"
            (click)="saveItem()"
            [disabled]="itemForm.invalid"
          ></button>
        </ng-template>
      </p-dialog>

      <p-toast />
    </div>
  `
})
export class InboundFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private inboundService = inject(InboundDemoService);
  private bcDocumentService = inject(BCDocumentDemoService);
  private inventoryService = inject(InventoryDemoService);
  private supplierService = inject(SupplierDemoService);
  private warehouseService = inject(WarehouseDemoService);
  private messageService = inject(MessageService);

  // Icons
  PackageCheckIcon = PackageCheck;
  PlusIcon = Plus;
  Trash2Icon = Trash2;

  // Form
  inboundForm!: FormGroup;
  itemForm!: FormGroup;
  isEditMode = false;
  inboundId: string | null = null;
  loading = false;
  error: string | null = null;

  // Dialog
  displayItemDialog = false;
  isEditingItem = false;
  editingItemIndex: number = -1;

  // Data
  bcDocuments: BCDocument[] = [];
  bcDocumentOptions: { label: string; value: string }[] = [];
  suppliers: Supplier[] = [];
  supplierOptions: { label: string; value: string }[] = [];
  warehouses: Warehouse[] = [];
  warehouseOptions: { label: string; value: string }[] = [];
  items: Item[] = [];
  itemOptions: { label: string; value: string }[] = [];
  details: InboundDetail[] = [];

  // Dropdown options
  statusOptions = [
    { label: 'Pending', value: InboundStatus.PENDING },
    { label: 'Received', value: InboundStatus.RECEIVED },
    { label: 'Quality Check', value: InboundStatus.QUALITY_CHECK },
    { label: 'Completed', value: InboundStatus.COMPLETED }
  ];

  qualityStatusOptions = [
    { label: 'Pass', value: QualityStatus.PASS },
    { label: 'Fail', value: QualityStatus.FAIL },
    { label: 'Quarantine', value: QualityStatus.QUARANTINE }
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.initializeItemForm();
    this.loadBCDocuments();
    this.loadSuppliers();
    this.loadWarehouses();
    this.loadItems();
    this.checkEditMode();
  }

  loadBCDocuments(): void {
    this.bcDocumentService.getAll().subscribe({
      next: (documents) => {
        this.bcDocuments = documents;
        this.bcDocumentOptions = documents.map(doc => ({
          label: `${doc.doc_number} - ${doc.doc_type}`,
          value: doc.doc_number
        }));
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load BC documents'
        });
      }
    });
  }

  loadSuppliers(): void {
    this.supplierService.getAll().subscribe({
      next: (suppliers) => {
        this.suppliers = suppliers;
        this.supplierOptions = suppliers.map(supplier => ({
          label: `${supplier.supplier_name} (${supplier.supplier_code})`,
          value: supplier.supplier_name
        }));
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load suppliers'
        });
      }
    });
  }

  loadWarehouses(): void {
    this.warehouseService.getAll().subscribe({
      next: (warehouses) => {
        this.warehouses = warehouses;
        this.warehouseOptions = warehouses.map(warehouse => ({
          label: `${warehouse.warehouse_name} (${warehouse.warehouse_code})`,
          value: warehouse.warehouse_name
        }));
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load warehouses'
        });
      }
    });
  }

  onBCDocumentChange(event: any): void {
    const selectedDocNumber = event.value;
    const selectedDoc = this.bcDocuments.find(doc => doc.doc_number === selectedDocNumber);

    if (selectedDoc) {
      this.inboundForm.patchValue({
        bc_document_id: selectedDoc.id
      });
    }
  }

  onSupplierChange(event: any): void {
    const selectedSupplierName = event.value;
    const selectedSupplier = this.suppliers.find(s => s.supplier_name === selectedSupplierName);

    if (selectedSupplier) {
      this.inboundForm.patchValue({
        supplier_id: selectedSupplier.id,
        supplier_code: selectedSupplier.supplier_code
      });
    }
  }

  onWarehouseChange(event: any): void {
    const selectedWarehouseName = event.value;
    const selectedWarehouse = this.warehouses.find(w => w.warehouse_name === selectedWarehouseName);

    if (selectedWarehouse) {
      this.inboundForm.patchValue({
        warehouse_id: selectedWarehouse.id,
        warehouse_code: selectedWarehouse.warehouse_code
      });
    }
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
          detail: this.error || 'An error occurred'
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

    if (this.details.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please add at least one item'
      });
      return;
    }

    this.loading = true;
    this.error = null;

    const formValue = {
      ...this.inboundForm.value,
      total_items: this.details.length,
      total_quantity: this.calculateTotalQuantity(),
      total_value: this.calculateTotalValue(),
      created_by: 'admin',
      updated_by: 'admin'
    };

    this.inboundService.create(formValue, this.details).subscribe({
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
          detail: this.error || 'An error occurred'
        });
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/inbound']);
  }

  // Item Dialog Methods
  initializeItemForm(): void {
    this.itemForm = this.fb.group({
      item_id: ['', Validators.required],
      item_code: [''],
      item_name: [''],
      hs_code: [''],
      unit: [''],
      ordered_quantity: [0, [Validators.required, Validators.min(0)]],
      received_quantity: [0, [Validators.required, Validators.min(0)]],
      accepted_quantity: [0],
      rejected_quantity: [0],
      unit_cost: [0, [Validators.required, Validators.min(0)]],
      total_cost: [0],
      batch_number: [''],
      lot_number: [''],
      manufacturing_date: [null],
      expiry_date: [null],
      quality_status: [QualityStatus.PASS],
      location_code: [''],
      notes: ['']
    });
  }

  loadItems(): void {
    this.inventoryService.getAll().subscribe({
      next: (items) => {
        this.items = items;
        this.itemOptions = items.map(item => ({
          label: `${item.item_code} - ${item.item_name}`,
          value: item.id
        }));
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load items'
        });
      }
    });
  }

  showAddItemDialog(): void {
    this.isEditingItem = false;
    this.editingItemIndex = -1;
    this.itemForm.reset({
      ordered_quantity: 0,
      received_quantity: 0,
      accepted_quantity: 0,
      rejected_quantity: 0,
      unit_cost: 0,
      total_cost: 0,
      quality_status: QualityStatus.PASS
    });
    this.displayItemDialog = true;
  }

  showEditItemDialog(index: number): void {
    this.isEditingItem = true;
    this.editingItemIndex = index;
    const detail = this.details[index];
    this.itemForm.patchValue(detail);
    this.displayItemDialog = true;
  }

  onItemSelect(event: any): void {
    const selectedItemId = event.value;
    const selectedItem = this.items.find(item => item.id === selectedItemId);

    if (selectedItem) {
      this.itemForm.patchValue({
        item_code: selectedItem.item_code,
        item_name: selectedItem.item_name,
        hs_code: selectedItem.hs_code,
        unit: selectedItem.unit,
        unit_cost: selectedItem.price || 0
      });
      this.calculateItemTotal();
    }
  }

  calculateItemTotal(): void {
    const receivedQty = this.itemForm.get('received_quantity')?.value || 0;
    const unitCost = this.itemForm.get('unit_cost')?.value || 0;
    const totalCost = receivedQty * unitCost;

    this.itemForm.patchValue({
      total_cost: totalCost,
      accepted_quantity: receivedQty // Default accepted = received
    });
  }

  saveItem(): void {
    if (this.itemForm.invalid) {
      return;
    }

    const itemData = this.itemForm.value;
    const detail: InboundDetail = {
      id: this.isEditingItem ? this.details[this.editingItemIndex].id : `detail_${Date.now()}`,
      inbound_header_id: this.inboundId || '',
      line_number: this.isEditingItem ? this.details[this.editingItemIndex].line_number : this.details.length + 1,
      ...itemData
    };

    if (this.isEditingItem) {
      this.details[this.editingItemIndex] = detail;
    } else {
      this.details.push(detail);
    }

    this.displayItemDialog = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: this.isEditingItem ? 'Item updated' : 'Item added'
    });
  }

  removeItem(index: number): void {
    this.details.splice(index, 1);
    // Renumber line numbers
    this.details.forEach((detail, idx) => {
      detail.line_number = idx + 1;
    });
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Item removed'
    });
  }

  calculateTotalQuantity(): number {
    return this.details.reduce((sum, detail) => sum + (detail.received_quantity || 0), 0);
  }

  calculateTotalValue(): number {
    return this.details.reduce((sum, detail) => sum + (detail.total_cost || 0), 0);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.inboundForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
