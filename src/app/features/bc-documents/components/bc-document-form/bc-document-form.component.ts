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
import { FileUploadModule } from 'primeng/fileupload';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';

// Lucide icons
import { LucideAngularModule, FileText, Upload } from 'lucide-angular';

// Services
import { BCDocumentDemoService } from '../../services/bc-document-demo.service';
import { MessageService } from 'primeng/api';

// Models
import { BCDocument, BCDocType, BCDocStatus } from '../../models/bc-document.model';

/**
 * BC Document Form Component
 * Requirements: 5.1, 5.4, 5.5, 15.2
 */
@Component({
    selector: 'app-bc-document-form',
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
        FileUploadModule,
        MessageModule,
        ToastModule,
        LucideAngularModule
    ],
    providers: [MessageService],
    template: `
    <div class="p-6 max-w-6xl mx-auto">
      <div class="mb-6">
        <div class="flex items-center gap-2 mb-2">
          <lucide-icon [img]="FileTextIcon" class="w-6 h-6 text-sky-600"></lucide-icon>
          <h1 class="text-2xl font-semibold text-gray-900">
            {{ isEditMode ? 'Edit BC Document' : 'Create BC Document' }}
          </h1>
        </div>
      </div>

      @if (error) {
        <p-message severity="error" [text]="error" styleClass="mb-4 w-full"></p-message>
      }

      <form [formGroup]="documentForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Document Information -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Document Information</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">
                Document Number <span class="text-red-500">*</span>
              </label>
              <input pInputText formControlName="doc_number" class="w-full" />
              @if (isFieldInvalid('doc_number')) {
                <small class="text-red-600 mt-1">Document number is required</small>
              }
            </div>

            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">
                Document Type <span class="text-red-500">*</span>
              </label>
              <p-select
                formControlName="doc_type"
                [options]="typeOptions"
                placeholder="Select type"
                class="w-full"
              />
              @if (isFieldInvalid('doc_type')) {
                <small class="text-red-600 mt-1">Document type is required</small>
              }
            </div>

            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">
                Document Date <span class="text-red-500">*</span>
              </label>
              <p-datepicker
                formControlName="doc_date"
                dateFormat="dd/mm/yy"
                [showIcon]="true"
                class="w-full"
              />
              @if (isFieldInvalid('doc_date')) {
                <small class="text-red-600 mt-1">Document date is required</small>
              }
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

        <!-- Partner Information -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Partner Information</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">
                Partner Name <span class="text-red-500">*</span>
              </label>
              <input pInputText formControlName="partner_name" class="w-full" />
              @if (isFieldInvalid('partner_name')) {
                <small class="text-red-600 mt-1">Partner name is required</small>
              }
            </div>

            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">
                Partner NPWP <span class="text-red-500">*</span>
              </label>
              <input pInputText formControlName="partner_npwp" class="w-full" />
              @if (isFieldInvalid('partner_npwp')) {
                <small class="text-red-600 mt-1">Partner NPWP is required</small>
              }
            </div>
          </div>
        </div>

        <!-- Invoice & Shipping Information -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Invoice & Shipping Information</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
              <input pInputText formControlName="invoice_number" class="w-full" />
            </div>

            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
              <p-datepicker
                formControlName="invoice_date"
                dateFormat="dd/mm/yy"
                [showIcon]="true"
                class="w-full"
              />
            </div>

            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">BL/AWB Number</label>
              <input pInputText formControlName="bl_awb_number" class="w-full" />
            </div>

            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">BL/AWB Date</label>
              <p-datepicker
                formControlName="bl_awb_date"
                dateFormat="dd/mm/yy"
                [showIcon]="true"
                class="w-full"
              />
            </div>
          </div>
        </div>

        <!-- Customs Office -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Customs Office</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">Customs Office Code</label>
              <input pInputText formControlName="customs_office_code" class="w-full" />
            </div>

            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">Customs Office Name</label>
              <input pInputText formControlName="customs_office_name" class="w-full" />
            </div>
          </div>
        </div>

        <!-- Value Information -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Value Information</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">
                Total Value <span class="text-red-500">*</span>
              </label>
              <p-inputnumber
                formControlName="total_value"
                mode="decimal"
                [minFractionDigits]="0"
                [maxFractionDigits]="2"
                class="w-full"
              />
              @if (isFieldInvalid('total_value')) {
                <small class="text-red-600 mt-1">Total value is required</small>
              }
            </div>

            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">Currency</label>
              <p-select
                formControlName="currency"
                [options]="currencyOptions"
                class="w-full"
              />
            </div>

            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">Exchange Rate</label>
              <p-inputnumber
                formControlName="exchange_rate"
                mode="decimal"
                [minFractionDigits]="0"
                [maxFractionDigits]="4"
                class="w-full"
              />
            </div>
          </div>
        </div>

        <!-- File Attachments -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">File Attachments</h2>
          
          <p-fileupload
            mode="basic"
            chooseLabel="Upload File"
            [auto]="true"
            [maxFileSize]="10000000"
            (onSelect)="onFileSelect($event)"
            accept=".pdf,.jpg,.jpeg,.png"
          />
          
          @if (uploadedFiles.length > 0) {
            <div class="mt-4 space-y-2">
              @for (file of uploadedFiles; track file) {
                <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span class="text-sm">{{ file }}</span>
                  <button
                    pButton
                    icon="pi pi-times"
                    class="p-button-text p-button-sm p-button-danger"
                    (click)="removeFile(file)"
                    type="button"
                  ></button>
                </div>
              }
            </div>
          }
        </div>

        <!-- Notes -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
          
          <textarea
            pInputTextarea
            formControlName="notes"
            rows="3"
            class="w-full"
            placeholder="Additional notes..."
          ></textarea>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3">
          <button pButton type="button" label="Cancel" class="p-button-text" (click)="onCancel()"></button>
          <button
            pButton
            type="submit"
            [label]="isEditMode ? 'Update' : 'Create'"
            [loading]="loading"
            [disabled]="documentForm.invalid || loading"
          ></button>
        </div>
      </form>
    </div>

    <p-toast />
  `
})
export class BCDocumentFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private bcDocumentService = inject(BCDocumentDemoService);
    private messageService = inject(MessageService);

    FileTextIcon = FileText;
    UploadIcon = Upload;

    documentForm!: FormGroup;
    isEditMode = false;
    documentId: string | null = null;
    loading = false;
    error: string | null = null;
    uploadedFiles: string[] = [];

    typeOptions = [
        { label: 'BC 2.3 - Import untuk Diolah', value: BCDocType.BC23 },
        { label: 'BC 2.5 - Import untuk Dipakai', value: BCDocType.BC25 },
        { label: 'BC 3.0 - Ekspor', value: BCDocType.BC30 },
        { label: 'BC 4.0 - Re-Ekspor', value: BCDocType.BC40 },
        { label: 'BC 2.7 - Subkontrak', value: BCDocType.BC27 }
    ];

    statusOptions = [
        { label: 'Draft', value: BCDocStatus.DRAFT },
        { label: 'Submitted', value: BCDocStatus.SUBMITTED },
        { label: 'Approved', value: BCDocStatus.APPROVED },
        { label: 'Rejected', value: BCDocStatus.REJECTED }
    ];

    currencyOptions = [
        { label: 'IDR', value: 'IDR' },
        { label: 'USD', value: 'USD' },
        { label: 'EUR', value: 'EUR' },
        { label: 'JPY', value: 'JPY' },
        { label: 'SGD', value: 'SGD' }
    ];

    ngOnInit(): void {
        this.initializeForm();
        this.checkEditMode();
    }

    initializeForm(): void {
        this.documentForm = this.fb.group({
            doc_number: ['', Validators.required],
            doc_type: [null, Validators.required],
            doc_date: [new Date(), Validators.required],
            status: [BCDocStatus.DRAFT],
            partner_id: [''],
            partner_name: ['', Validators.required],
            partner_npwp: ['', Validators.required],
            invoice_number: [''],
            invoice_date: [null],
            bl_awb_number: [''],
            bl_awb_date: [null],
            customs_office_code: [''],
            customs_office_name: [''],
            total_value: [0, [Validators.required, Validators.min(0)]],
            currency: ['IDR'],
            exchange_rate: [1],
            notes: ['']
        });
    }

    checkEditMode(): void {
        this.documentId = this.route.snapshot.paramMap.get('id');
        if (this.documentId) {
            this.isEditMode = true;
            this.loadDocument(this.documentId);
        }
    }

    loadDocument(id: string): void {
        this.loading = true;
        this.bcDocumentService.getById(id).subscribe({
            next: (document) => {
                this.documentForm.patchValue({
                    ...document,
                    doc_date: new Date(document.doc_date),
                    invoice_date: document.invoice_date ? new Date(document.invoice_date) : null,
                    bl_awb_date: document.bl_awb_date ? new Date(document.bl_awb_date) : null
                });
                this.uploadedFiles = document.attachment_files || [];
                this.loading = false;
            },
            error: (error) => {
                this.error = error.error?.message || 'Failed to load BC document';
                this.loading = false;
            }
        });
    }

    onFileSelect(event: any): void {
        const file = event.files[0];
        if (file) {
            // In a real app, this would upload to server
            this.uploadedFiles.push(file.name);
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'File uploaded successfully'
            });
        }
    }

    removeFile(fileName: string): void {
        this.uploadedFiles = this.uploadedFiles.filter(f => f !== fileName);
    }

    onSubmit(): void {
        if (this.documentForm.invalid) {
            Object.keys(this.documentForm.controls).forEach(key => {
                this.documentForm.get(key)?.markAsTouched();
            });
            return;
        }

        this.loading = true;
        this.error = null;

        const formValue = {
            ...this.documentForm.value,
            attachment_files: this.uploadedFiles,
            created_by: 'admin',
            updated_by: 'admin'
        };

        const operation = this.isEditMode && this.documentId
            ? this.bcDocumentService.update(this.documentId, formValue)
            : this.bcDocumentService.create(formValue);

        operation.subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: `BC document ${this.isEditMode ? 'updated' : 'created'} successfully`
                });
                setTimeout(() => {
                    this.router.navigate(['/bc-documents']);
                }, 1000);
            },
            error: (error) => {
                this.error = error.error?.message || 'Failed to save BC document';
                this.loading = false;
            }
        });
    }

    onCancel(): void {
        this.router.navigate(['/bc-documents']);
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.documentForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }
}
