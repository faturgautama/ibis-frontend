import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';

// Lucide icons
import { LucideAngularModule, PackageOpen, Plus, Trash2 } from 'lucide-angular';

// Services
import { OutboundDemoService } from '../../services/outbound-demo.service';
import { BCDocumentDemoService } from '../../../bc-documents/services/bc-document-demo.service';
import { CustomerDemoService } from '../../../suppliers-customers/services/customer-demo.service';
import { InventoryDemoService } from '../../../inventory/services/inventory-demo.service';
import { WarehouseDemoService } from '../../../warehouse/services/warehouse-demo.service';

// Models
import { OutboundStatus, OutboundType, OutboundDetail } from '../../models/outbound.model';
import { Item } from '../../../inventory/models/item.model';
import { BCDocument } from '../../../bc-documents/models/bc-document.model';
import { Customer } from '../../../suppliers-customers/models/customer.model';
import { Warehouse } from '../../../warehouse/models/warehouse.model';

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
    DialogModule,
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
                  Customer <span class="text-red-500">*</span>
                </label>
                <p-select
                  formControlName="customer_name"
                  [options]="customerOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select Customer"
                  [filter]="true"
                  filterBy="label"
                  class="w-full"
                  (onChange)="onCustomerChange($event)"
                />
                <small *ngIf="isFieldInvalid('customer_name')" class="text-red-600 mt-1">Customer is required</small>
              </div>

              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">Customer Code</label>
                <input pInputText formControlName="customer_code" class="w-full" [readonly]="true" />
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

          <!-- Outbound Items -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Outbound Items</h2>
              <button
                pButton
                type="button"
                label="Add Item"
                icon="pi pi-plus"
                class="p-button-sm"
                (click)="showAddItemDialog()"
              ></button>
            </div>

            <p-table [value]="details" [paginator]="false">
              <ng-template pTemplate="header">
                <tr>
                  <th>Item Code</th>
                  <th>Item Name</th>
                  <th>Ordered Qty</th>
                  <th>Shipped Qty</th>
                  <th>Unit</th>
                  <th>Unit Price</th>
                  <th>Total Price</th>
                  <th>Batch</th>
                  <th>Actions</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-detail let-rowIndex="rowIndex">
                <tr>
                  <td>{{ detail.item_code }}</td>
                  <td>{{ detail.item_name }}</td>
                  <td>{{ detail.ordered_quantity }}</td>
                  <td>{{ detail.shipped_quantity }}</td>
                  <td>{{ detail.unit }}</td>
                  <td>{{ detail.unit_price | number: '1.2-2' }}</td>
                  <td>{{ detail.total_price | number: '1.2-2' }}</td>
                  <td>{{ detail.batch_number || '-' }}</td>
                  <td>
                    <div class="flex gap-2">
                      <button
                        pButton
                        icon="pi pi-pencil"
                        class="p-button-text p-button-sm"
                        (click)="showEditItemDialog(rowIndex)"
                      ></button>
                      <button
                        pButton
                        icon="pi pi-trash"
                        class="p-button-text p-button-sm p-button-danger"
                        (click)="removeItem(rowIndex)"
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

          <!-- Summary -->
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
                <p class="text-sm text-gray-600 mb-1">Total Value (IDR)</p>
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

            <!-- Shipped Quantity -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">
                Shipped Quantity <span class="text-red-500">*</span>
              </label>
              <p-inputNumber
                formControlName="shipped_quantity"
                [min]="0"
                class="w-full"
                (onInput)="calculateItemTotal()"
              />
            </div>

            <!-- Unit Price -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">
                Unit Price <span class="text-red-500">*</span>
              </label>
              <p-inputNumber
                formControlName="unit_price"
                mode="currency"
                currency="IDR"
                locale="id-ID"
                [min]="0"
                class="w-full"
                (onInput)="calculateItemTotal()"
              />
            </div>

            <!-- Total Price (Read-only) -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">Total Price</label>
              <p-inputNumber
                formControlName="total_price"
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
    </div>

    <p-toast />
  `
})
export class OutboundFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private outboundService = inject(OutboundDemoService);
  private bcDocumentService = inject(BCDocumentDemoService);
  private customerService = inject(CustomerDemoService);
  private inventoryService = inject(InventoryDemoService);
  private warehouseService = inject(WarehouseDemoService);
  private messageService = inject(MessageService);

  // Icons
  PackageOpenIcon = PackageOpen;
  PlusIcon = Plus;
  Trash2Icon = Trash2;

  // Form
  outboundForm!: FormGroup;
  itemForm!: FormGroup;
  isEditMode = false;
  outboundId: string | null = null;
  loading = false;

  // Dialog
  displayItemDialog = false;
  isEditingItem = false;
  editingItemIndex: number = -1;

  // Data
  bcDocuments: BCDocument[] = [];
  bcDocumentOptions: { label: string; value: string }[] = [];
  customers: Customer[] = [];
  customerOptions: { label: string; value: string }[] = [];
  warehouses: Warehouse[] = [];
  warehouseOptions: { label: string; value: string }[] = [];
  items: Item[] = [];
  itemOptions: { label: string; value: string }[] = [];
  details: OutboundDetail[] = [];

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
    this.initializeItemForm();
    this.loadBCDocuments();
    this.loadCustomers();
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

  loadCustomers(): void {
    this.customerService.getAll().subscribe({
      next: (customers) => {
        this.customers = customers;
        this.customerOptions = customers.map(customer => ({
          label: `${customer.customer_name} (${customer.customer_code})`,
          value: customer.customer_name
        }));
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load customers'
        });
      }
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
      this.outboundForm.patchValue({
        bc_document_id: selectedDoc.id
      });
    }
  }

  onCustomerChange(event: any): void {
    const selectedCustomerName = event.value;
    const selectedCustomer = this.customers.find(c => c.customer_name === selectedCustomerName);

    if (selectedCustomer) {
      this.outboundForm.patchValue({
        customer_id: selectedCustomer.id,
        customer_code: selectedCustomer.customer_code
      });
    }
  }

  onWarehouseChange(event: any): void {
    const selectedWarehouseName = event.value;
    const selectedWarehouse = this.warehouses.find(w => w.warehouse_name === selectedWarehouseName);

    if (selectedWarehouse) {
      this.outboundForm.patchValue({
        warehouse_id: selectedWarehouse.id,
        warehouse_code: selectedWarehouse.warehouse_code
      });
    }
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
      notes: ['']
    });
  }

  initializeItemForm(): void {
    this.itemForm = this.fb.group({
      item_id: ['', Validators.required],
      item_code: [''],
      item_name: [''],
      hs_code: [''],
      unit: [''],
      ordered_quantity: [0, [Validators.required, Validators.min(0)]],
      shipped_quantity: [0, [Validators.required, Validators.min(0)]],
      unit_price: [0, [Validators.required, Validators.min(0)]],
      total_price: [0],
      batch_number: [''],
      lot_number: [''],
      location_code: [''],
      notes: ['']
    });
  }

  showAddItemDialog(): void {
    this.isEditingItem = false;
    this.editingItemIndex = -1;
    this.itemForm.reset({
      ordered_quantity: 0,
      shipped_quantity: 0,
      unit_price: 0,
      total_price: 0
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
        unit_price: selectedItem.price || 0
      });
      this.calculateItemTotal();
    }
  }

  calculateItemTotal(): void {
    const shippedQty = this.itemForm.get('shipped_quantity')?.value || 0;
    const unitPrice = this.itemForm.get('unit_price')?.value || 0;
    const totalPrice = shippedQty * unitPrice;

    this.itemForm.patchValue({
      total_price: totalPrice
    });
  }

  saveItem(): void {
    if (this.itemForm.invalid) {
      return;
    }

    const itemData = this.itemForm.value;
    const detail: OutboundDetail = {
      id: this.isEditingItem ? this.details[this.editingItemIndex].id : `detail_${Date.now()}`,
      outbound_header_id: this.outboundId || '',
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
    return this.details.reduce((sum, detail) => sum + (detail.shipped_quantity || 0), 0);
  }

  calculateTotalValue(): number {
    return this.details.reduce((sum, detail) => sum + (detail.total_price || 0), 0);
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
            this.details = details;
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

      if (this.details.length === 0) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please add at least one item'
        });
      }
      return;
    }

    this.loading = true;

    const formValue = {
      ...this.outboundForm.value,
      total_items: this.details.length,
      total_quantity: this.calculateTotalQuantity(),
      total_value: this.calculateTotalValue(),
      created_by: 'admin'
    };

    this.outboundService.create(formValue, this.details).subscribe({
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
