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
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';

// Lucide icons
import { LucideAngularModule, ClipboardList, Plus, Trash2 } from 'lucide-angular';

// Services
import { StockOpnameService } from '../../services/stock-opname.service';
import { WarehouseDemoService } from '../../../warehouse/services/warehouse-demo.service';
import { InventoryDemoService } from '../../../inventory/services/inventory-demo.service';

// Models
import { OpnameType, calculateDifference } from '../../models/stock-opname.model';
import { Warehouse } from '../../../warehouse/models/warehouse.model';
import { Item } from '../../../inventory/models/item.model';

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
    DialogModule,
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
                <p-select
                  formControlName="warehouse_name"
                  [options]="warehouseOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select Warehouse"
                  [filter]="true"
                  filterBy="label"
                  class="w-full"
                  appendTo="body"
                  (onChange)="onWarehouseChange($event)"
                />
                <small *ngIf="isFieldInvalid('warehouse_name')" class="text-red-600 mt-1">Warehouse is required</small>
              </div>

              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">Warehouse Code</label>
                <input pInputText formControlName="warehouse_code" class="w-full" [readonly]="true" />
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
                (click)="showAddDetailDialog()"
              ></button>
            </div>

            <p-table [value]="details" [paginator]="false">
              <ng-template pTemplate="header">
                <tr>
                  <th>Item Code</th>
                  <th>Item Name</th>
                  <th>System Qty</th>
                  <th>Physical Qty</th>
                  <th>Difference</th>
                  <th>Unit</th>
                  <th>Batch</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-detail let-rowIndex="rowIndex">
                <tr>
                  <td>{{ detail.item_code }}</td>
                  <td>{{ detail.item_name }}</td>
                  <td>{{ detail.system_quantity }}</td>
                  <td>{{ detail.physical_quantity }}</td>
                  <td [class]="getDifferenceClass(detail.difference)">
                    {{ detail.difference || 0 }}
                  </td>
                  <td>{{ detail.unit }}</td>
                  <td>{{ detail.batch_number || '-' }}</td>
                  <td>{{ detail.adjustment_reason || '-' }}</td>
                  <td>
                    <div class="flex gap-2">
                      <button
                        pButton
                        icon="pi pi-pencil"
                        class="p-button-text p-button-sm"
                        (click)="showEditDetailDialog(rowIndex)"
                      ></button>
                      <button
                        pButton
                        icon="pi pi-trash"
                        class="p-button-text p-button-sm p-button-danger"
                        (click)="removeDetail(rowIndex)"
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

      <!-- Add/Edit Item Dialog -->
      <p-dialog
        [(visible)]="displayDetailDialog"
        [header]="isEditingDetail ? 'Edit Item' : 'Add Item'"
        [modal]="true"
        [style]="{width: '700px'}"
        [draggable]="false"
      >
        <form [formGroup]="detailForm" class="space-y-4">
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
                appendTo="body"
                (onChange)="onItemSelect($event)"
              />
            </div>

            <!-- Item Code (readonly) -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">Item Code</label>
              <input pInputText formControlName="item_code" class="w-full" [readonly]="true" />
            </div>

            <!-- Item Name (readonly) -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">Item Name</label>
              <input pInputText formControlName="item_name" class="w-full" [readonly]="true" />
            </div>

            <!-- System Quantity -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">
                System Quantity <span class="text-red-500">*</span>
              </label>
              <p-inputNumber
                formControlName="system_quantity"
                [min]="0"
                class="w-full"
              />
            </div>

            <!-- Physical Quantity -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">
                Physical Quantity <span class="text-red-500">*</span>
              </label>
              <p-inputNumber
                formControlName="physical_quantity"
                [min]="0"
                class="w-full"
              />
            </div>

            <!-- Difference (readonly) -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">Difference</label>
              <p-inputNumber
                formControlName="difference"
                [readonly]="true"
                class="w-full"
              />
            </div>

            <!-- Unit (readonly) -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">Unit</label>
              <input pInputText formControlName="unit" class="w-full" [readonly]="true" />
            </div>

            <!-- Batch Number -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">Batch Number</label>
              <input pInputText formControlName="batch_number" class="w-full" />
            </div>

            <!-- Adjustment Reason -->
            <div class="flex flex-col md:col-span-2">
              <label class="text-sm font-medium text-gray-700 mb-1">
                Adjustment Reason
                <span *ngIf="detailForm.get('difference')?.value !== 0" class="text-red-500">*</span>
              </label>
              <textarea
                pInputTextarea
                formControlName="adjustment_reason"
                rows="2"
                class="w-full"
                placeholder="Required when there is a difference..."
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
            (click)="displayDetailDialog = false"
          ></button>
          <button
            pButton
            [label]="isEditingDetail ? 'Update' : 'Add'"
            icon="pi pi-check"
            (click)="saveDetail()"
            [disabled]="detailForm.invalid"
          ></button>
        </ng-template>
      </p-dialog>
    </div>

    <p-toast />
  `
})
export class StockOpnameFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private opnameService = inject(StockOpnameService);
  private warehouseService = inject(WarehouseDemoService);
  private inventoryService = inject(InventoryDemoService);
  private messageService = inject(MessageService);

  // Icons
  ClipboardListIcon = ClipboardList;
  PlusIcon = Plus;
  Trash2Icon = Trash2;

  // Form
  opnameForm!: FormGroup;
  detailForm!: FormGroup;
  isEditMode = false;
  opnameId: string | null = null;
  loading = false;

  // Dialog
  displayDetailDialog = false;
  isEditingDetail = false;
  editingDetailIndex: number = -1;

  // Data
  warehouses: Warehouse[] = [];
  warehouseOptions: { label: string; value: string }[] = [];
  items: Item[] = [];
  itemOptions: { label: string; value: string }[] = [];
  details: any[] = [];

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
    this.initializeDetailForm();
    this.loadWarehouses();
    this.loadItems();
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
      notes: ['']
    });
  }

  initializeDetailForm(): void {
    this.detailForm = this.fb.group({
      item_id: ['', Validators.required],
      item_code: [''],
      item_name: [''],
      system_quantity: [0, [Validators.required, Validators.min(0)]],
      physical_quantity: [0, [Validators.required, Validators.min(0)]],
      difference: [0],
      unit: [''],
      batch_number: [''],
      adjustment_reason: ['']
    });

    // Auto-calculate difference when quantities change
    this.detailForm.get('system_quantity')?.valueChanges.subscribe(() => {
      this.calculateDetailDifference();
    });

    this.detailForm.get('physical_quantity')?.valueChanges.subscribe(() => {
      this.calculateDetailDifference();
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

  onWarehouseChange(event: any): void {
    const selectedWarehouseName = event.value;
    const selectedWarehouse = this.warehouses.find(w => w.warehouse_name === selectedWarehouseName);

    if (selectedWarehouse) {
      this.opnameForm.patchValue({
        warehouse_id: selectedWarehouse.id,
        warehouse_code: selectedWarehouse.warehouse_code
      });
    }
  }

  showAddDetailDialog(): void {
    this.isEditingDetail = false;
    this.editingDetailIndex = -1;
    this.detailForm.reset({
      system_quantity: 0,
      physical_quantity: 0,
      difference: 0
    });
    this.displayDetailDialog = true;
  }

  showEditDetailDialog(index: number): void {
    this.isEditingDetail = true;
    this.editingDetailIndex = index;
    const detail = this.details[index];
    this.detailForm.patchValue(detail);
    this.displayDetailDialog = true;
  }

  onItemSelect(event: any): void {
    const selectedItemId = event.value;
    const selectedItem = this.items.find(item => item.id === selectedItemId);

    if (selectedItem) {
      this.detailForm.patchValue({
        item_code: selectedItem.item_code,
        item_name: selectedItem.item_name,
        unit: selectedItem.unit
      });
    }
  }

  calculateDetailDifference(): void {
    const systemQty = this.detailForm.get('system_quantity')?.value || 0;
    const physicalQty = this.detailForm.get('physical_quantity')?.value || 0;
    const difference = calculateDifference(systemQty, physicalQty);

    this.detailForm.patchValue({ difference }, { emitEvent: false });
  }

  saveDetail(): void {
    if (this.detailForm.invalid) {
      return;
    }

    const detailData = this.detailForm.value;
    const difference = detailData.difference || 0;

    // Validate adjustment reason is required when difference !== 0
    if (difference !== 0 && !detailData.adjustment_reason?.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Adjustment reason is required when there is a difference'
      });
      return;
    }

    if (this.isEditingDetail) {
      this.details[this.editingDetailIndex] = detailData;
    } else {
      this.details.push(detailData);
    }

    this.displayDetailDialog = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: this.isEditingDetail ? 'Item updated' : 'Item added'
    });
  }

  removeDetail(index: number): void {
    this.details.splice(index, 1);
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Item removed'
    });
  }

  hasInvalidDetails(): boolean {
    return this.details.some(detail => {
      const difference = detail.difference || 0;
      const reason = detail.adjustment_reason || '';
      return difference !== 0 && !reason.trim();
    });
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
    return this.details.filter(detail => {
      const diff = detail.difference || 0;
      return diff !== 0;
    }).length;
  }

  getTotalDifference(): number {
    return this.details.reduce((sum, detail) => {
      return sum + (detail.difference || 0);
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
            next: (detailsData) => {
              this.details = detailsData;
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

      if (this.details.length === 0) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Validation Error',
          detail: 'Please add at least one item'
        });
      } else if (this.hasInvalidDetails()) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Validation Error',
          detail: 'Please provide adjustment reasons for all items with differences'
        });
      }
      return;
    }

    this.loading = true;

    const opnameData = {
      ...this.opnameForm.value,
      created_by: 'admin'
    };

    this.opnameService.create(opnameData, this.details).subscribe({
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
