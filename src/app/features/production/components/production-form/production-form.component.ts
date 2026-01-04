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
import { WarehouseDemoService } from '../../../warehouse/services/warehouse-demo.service';
import { InventoryDemoService } from '../../../inventory/services/inventory-demo.service';

// Models
import { WOStatus } from '../../models/production.model';
import { Warehouse } from '../../../warehouse/models/warehouse.model';
import { Item, ItemType } from '../../../inventory/models/item.model';
import { DialogModule } from 'primeng/dialog';

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
    DialogModule,
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

          <!-- Output Product -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Output Product (Finished Goods)</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">
                  Output Item <span class="text-red-500">*</span>
                </label>
                <p-select
                  formControlName="output_item_code"
                  [options]="itemOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select Output Item"
                  [filter]="true"
                  filterBy="label"
                  class="w-full"
                  (onChange)="onOutputItemChange($event)"
                />
                <small *ngIf="isFieldInvalid('output_item_code')" class="text-red-600 mt-1">Output item is required</small>
              </div>

              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">Output Item Name</label>
                <input pInputText formControlName="output_item_name" class="w-full" [readonly]="true" />
              </div>

              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">
                  Planned Quantity <span class="text-red-500">*</span>
                </label>
                <p-inputnumber formControlName="planned_quantity" [min]="0" class="w-full" />
                <small *ngIf="isFieldInvalid('planned_quantity')" class="text-red-600 mt-1">Planned quantity is required</small>
              </div>

              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">Unit</label>
                <input pInputText formControlName="unit" class="w-full" [readonly]="true" />
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
                (click)="showAddMaterialDialog()"
              ></button>
            </div>

            <p-table [value]="materials" [paginator]="false">
              <ng-template pTemplate="header">
                <tr>
                  <th>Material Code</th>
                  <th>Material Name</th>
                  <th>Required Qty</th>
                  <th>Consumed Qty</th>
                  <th>Unit</th>
                  <th>Batch Number</th>
                  <th>Warehouse</th>
                  <th>Actions</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-material let-rowIndex="rowIndex">
                <tr>
                  <td>{{ material.material_item_code }}</td>
                  <td>{{ material.material_item_name }}</td>
                  <td>{{ material.required_quantity }}</td>
                  <td>{{ material.consumed_quantity }}</td>
                  <td>{{ material.unit }}</td>
                  <td>{{ material.batch_number || '-' }}</td>
                  <td>{{ material.warehouse_name }}</td>
                  <td>
                    <div class="flex gap-2">
                      <button
                        pButton
                        icon="pi pi-pencil"
                        class="p-button-text p-button-sm"
                        (click)="showEditMaterialDialog(rowIndex)"
                      ></button>
                      <button
                        pButton
                        icon="pi pi-trash"
                        class="p-button-text p-button-sm p-button-danger"
                        (click)="removeMaterial(rowIndex)"
                      ></button>
                    </div>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="8" class="text-center text-gray-500 py-4">
                    No materials added yet. Click "Add Material" to start.
                  </td>
                </tr>
              </ng-template>
            </p-table>
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

      <!-- Add/Edit Material Dialog -->
      <p-dialog
        [(visible)]="displayMaterialDialog"
        [header]="isEditingMaterial ? 'Edit Material' : 'Add Material'"
        [modal]="true"
        [style]="{width: '700px'}"
        [draggable]="false"
      >
        <form [formGroup]="materialForm" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Material Selection -->
            <div class="flex flex-col md:col-span-2">
              <label class="text-sm font-medium text-gray-700 mb-1">
                Material (Raw Material) <span class="text-red-500">*</span>
              </label>
              <p-select
                formControlName="material_item_id"
                [options]="rawMaterialOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select Material"
                [filter]="true"
                filterBy="label"
                class="w-full"
                (onChange)="onMaterialSelect($event)"
              />
            </div>

            <!-- Material Code (readonly) -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">Material Code</label>
              <input pInputText formControlName="material_item_code" class="w-full" [readonly]="true" />
            </div>

            <!-- Material Name (readonly) -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">Material Name</label>
              <input pInputText formControlName="material_item_name" class="w-full" [readonly]="true" />
            </div>

            <!-- Required Quantity -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">
                Required Quantity <span class="text-red-500">*</span>
              </label>
              <p-inputNumber
                formControlName="required_quantity"
                [min]="0"
                class="w-full"
              />
            </div>

            <!-- Consumed Quantity -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">Consumed Quantity</label>
              <p-inputNumber
                formControlName="consumed_quantity"
                [min]="0"
                class="w-full"
                [disabled]="!isEditMode"
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

            <!-- Warehouse -->
            <div class="flex flex-col md:col-span-2">
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
                (onChange)="onMaterialWarehouseChange($event)"
              />
            </div>
          </div>
        </form>

        <ng-template pTemplate="footer">
          <button
            pButton
            label="Cancel"
            icon="pi pi-times"
            class="p-button-text"
            (click)="displayMaterialDialog = false"
          ></button>
          <button
            pButton
            [label]="isEditingMaterial ? 'Update' : 'Add'"
            icon="pi pi-check"
            (click)="saveMaterial()"
            [disabled]="materialForm.invalid"
          ></button>
        </ng-template>
      </p-dialog>
    </div>

    <p-toast />
  `
})
export class ProductionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private productionService = inject(ProductionDemoService);
  private warehouseService = inject(WarehouseDemoService);
  private inventoryService = inject(InventoryDemoService);
  private messageService = inject(MessageService);

  // Icons
  FactoryIcon = Factory;
  PlusIcon = Plus;
  Trash2Icon = Trash2;

  // Data
  warehouses: Warehouse[] = [];
  warehouseOptions: { label: string; value: string }[] = [];
  items: Item[] = [];
  itemOptions: { label: string; value: string }[] = [];
  rawMaterialOptions: { label: string; value: string }[] = [];
  materials: any[] = [];

  // Form
  productionForm!: FormGroup;
  materialForm!: FormGroup;
  isEditMode = false;
  productionId: string | null = null;
  loading = false;

  // Dialog
  displayMaterialDialog = false;
  isEditingMaterial = false;
  editingMaterialIndex: number = -1;

  // Dropdown options
  statusOptions = [
    { label: 'Planned', value: WOStatus.PLANNED },
    { label: 'In Progress', value: WOStatus.IN_PROGRESS },
    { label: 'Completed', value: WOStatus.COMPLETED },
    { label: 'Cancelled', value: WOStatus.CANCELLED }
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.initializeMaterialForm();
    this.loadWarehouses();
    this.loadItems();
    this.checkEditMode();
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
        // Filter only finished goods for output product
        const finishedGoods = items.filter(item => item.item_type === ItemType.FG);
        this.itemOptions = finishedGoods.map(item => ({
          label: `${item.item_code} - ${item.item_name}`,
          value: item.item_code
        }));

        // Filter raw materials for material requirements
        const rawMaterials = items.filter(item => item.item_type === ItemType.RAW);
        this.rawMaterialOptions = rawMaterials.map(item => ({
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
      this.productionForm.patchValue({
        warehouse_id: selectedWarehouse.id,
        warehouse_code: selectedWarehouse.warehouse_code
      });
    }
  }

  onOutputItemChange(event: any): void {
    const selectedItemCode = event.value;
    const selectedItem = this.items.find(item => item.item_code === selectedItemCode);

    if (selectedItem) {
      this.productionForm.patchValue({
        output_item_id: selectedItem.id,
        output_item_name: selectedItem.item_name,
        unit: selectedItem.unit
      });
    }
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

    // Auto-calculate yield percentage when actual or planned quantity changes
    this.productionForm.get('actual_quantity')?.valueChanges.subscribe(() => {
      this.calculateYieldPercentage();
    });

    this.productionForm.get('planned_quantity')?.valueChanges.subscribe(() => {
      this.calculateYieldPercentage();
    });
  }

  initializeMaterialForm(): void {
    this.materialForm = this.fb.group({
      material_item_id: ['', Validators.required],
      material_item_code: [''],
      material_item_name: [''],
      required_quantity: [0, [Validators.required, Validators.min(0)]],
      consumed_quantity: [0],
      unit: [''],
      batch_number: [''],
      warehouse_id: [''],
      warehouse_code: [''],
      warehouse_name: ['', Validators.required]
    });
  }

  calculateYieldPercentage(): void {
    const plannedQty = this.productionForm.get('planned_quantity')?.value || 0;
    const actualQty = this.productionForm.get('actual_quantity')?.value || 0;

    if (plannedQty > 0) {
      const yieldPercentage = (actualQty / plannedQty) * 100;
      this.productionForm.patchValue({
        yield_percentage: Math.round(yieldPercentage * 100) / 100 // Round to 2 decimal places
      }, { emitEvent: false });
    } else {
      this.productionForm.patchValue({
        yield_percentage: 0
      }, { emitEvent: false });
    }
  }

  showAddMaterialDialog(): void {
    this.isEditingMaterial = false;
    this.editingMaterialIndex = -1;
    this.materialForm.reset({
      required_quantity: 0,
      consumed_quantity: 0
    });
    this.displayMaterialDialog = true;
  }

  showEditMaterialDialog(index: number): void {
    this.isEditingMaterial = true;
    this.editingMaterialIndex = index;
    const material = this.materials[index];
    this.materialForm.patchValue(material);
    this.displayMaterialDialog = true;
  }

  onMaterialSelect(event: any): void {
    const selectedItemId = event.value;
    const selectedItem = this.items.find(item => item.id === selectedItemId);

    if (selectedItem) {
      this.materialForm.patchValue({
        material_item_code: selectedItem.item_code,
        material_item_name: selectedItem.item_name,
        unit: selectedItem.unit
      });
    }
  }

  onMaterialWarehouseChange(event: any): void {
    const selectedWarehouseName = event.value;
    const selectedWarehouse = this.warehouses.find(w => w.warehouse_name === selectedWarehouseName);

    if (selectedWarehouse) {
      this.materialForm.patchValue({
        warehouse_id: selectedWarehouse.id,
        warehouse_code: selectedWarehouse.warehouse_code
      });
    }
  }

  saveMaterial(): void {
    if (this.materialForm.invalid) {
      return;
    }

    const materialData = this.materialForm.value;

    if (this.isEditingMaterial) {
      this.materials[this.editingMaterialIndex] = materialData;
    } else {
      this.materials.push(materialData);
    }

    this.displayMaterialDialog = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: this.isEditingMaterial ? 'Material updated' : 'Material added'
    });
  }

  removeMaterial(index: number): void {
    this.materials.splice(index, 1);
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Material removed'
    });
  }

  addMaterial(): void {
    this.showAddMaterialDialog();
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
          next: (materialsData) => {
            this.materials = materialsData;
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

      if (this.materials.length === 0) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please add at least one material'
        });
      }
      return;
    }

    this.loading = true;

    const formValue = this.productionForm.value;
    const orderData = {
      ...formValue,
      created_by: 'admin'
    };
    delete orderData.materials;

    this.productionService.create(orderData, this.materials).subscribe({
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
