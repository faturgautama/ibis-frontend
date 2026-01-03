import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

// Lucide icons
import { LucideAngularModule, FileText, Plus, Edit, Trash2, Send, CheckCircle, XCircle } from 'lucide-angular';

// Services
import { BCDocumentDemoService } from '../../services/bc-document-demo.service';
import { ConfirmationService, MessageService } from 'primeng/api';

// Models
import { BCDocument, BCDocType, BCDocStatus, getBCDocTypeLabel, getBCDocStatusLabel, getBCDocStatusColor } from '../../models/bc-document.model';

/**
 * BC Document List Component
 * Requirements: 5.1, 5.4, 5.5, 15.2
 */
@Component({
  selector: 'app-bc-document-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    SelectModule,
    ConfirmDialogModule,
    ToastModule,
    LucideAngularModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="p-6">
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <lucide-icon [img]="FileTextIcon" class="w-6 h-6 text-sky-600"></lucide-icon>
            <h1 class="text-2xl font-semibold text-gray-900">BC Documents</h1>
          </div>
          <button pButton (click)="onCreate()" class="flex items-center gap-2">
            <lucide-icon [img]="PlusIcon" class="w-4 h-4"></lucide-icon>
            <span>Create Document</span>
          </button>
        </div>

        <div class="flex gap-4 mb-4">
          <div class="flex-1">
            <input 
              pInputText 
              [(ngModel)]="searchTerm" 
              (input)="onSearch()" 
              placeholder="Search by document number, partner name..."
              class="w-full"
            />
          </div>
          <p-select
            [(ngModel)]="selectedType"
            [options]="typeOptions"
            placeholder="All Types"
            (onChange)="onFilterChange()"
            [showClear]="true"
            class="w-48"
          />
          <p-select
            [(ngModel)]="selectedStatus"
            [options]="statusOptions"
            placeholder="All Status"
            (onChange)="onFilterChange()"
            [showClear]="true"
            class="w-48"
          />
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm">
        <p-table
          [value]="filteredDocuments"
          [paginator]="true"
          [rows]="20"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} documents"
          [rowsPerPageOptions]="[10, 20, 50]"
          [loading]="loading"
          styleClass="p-datatable-sm"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>Document Number</th>
              <th>Type</th>
              <th>Date</th>
              <th>Partner</th>
              <th>Total Value</th>
              <th>Status</th>
              <th class="text-center">Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-doc>
            <tr>
              <td>
                <div class="font-medium text-gray-900">{{ doc.doc_number }}</div>
                @if (doc.ceisa_response_number) {
                  <div class="text-xs text-gray-500">CEISA: {{ doc.ceisa_response_number }}</div>
                }
              </td>
              <td>
                <span class="text-sm">{{ getBCDocTypeLabel(doc.doc_type) }}</span>
              </td>
              <td>
                <span class="text-sm">{{ doc.doc_date | date: 'dd MMM yyyy' }}</span>
              </td>
              <td>
                <div class="text-sm font-medium">{{ doc.partner_name }}</div>
                <div class="text-xs text-gray-500">{{ doc.partner_npwp }}</div>
              </td>
              <td>
                <span class="text-sm font-medium">{{ doc.total_value | number: '1.0-0' }} {{ doc.currency }}</span>
              </td>
              <td>
                <p-tag 
                  [value]="getBCDocStatusLabel(doc.status)" 
                  [severity]="getStatusSeverity(doc.status)"
                />
              </td>
              <td>
                <div class="flex items-center justify-center gap-2">
                  @if (doc.status === 'DRAFT') {
                    <button
                      pButton
                      icon="pi pi-send"
                      class="p-button-rounded p-button-text p-button-sm"
                      (click)="onSubmit(doc)"
                      pTooltip="Submit"
                    ></button>
                  }
                  @if (doc.status === 'SUBMITTED') {
                    <button
                      pButton
                      icon="pi pi-check"
                      class="p-button-rounded p-button-text p-button-success p-button-sm"
                      (click)="onApprove(doc)"
                      pTooltip="Approve"
                    ></button>
                    <button
                      pButton
                      icon="pi pi-times"
                      class="p-button-rounded p-button-text p-button-danger p-button-sm"
                      (click)="onReject(doc)"
                      pTooltip="Reject"
                    ></button>
                  }
                  <button
                    pButton
                    icon="pi pi-pencil"
                    class="p-button-rounded p-button-text p-button-sm"
                    (click)="onEdit(doc)"
                    pTooltip="Edit"
                    [disabled]="doc.status === 'APPROVED'"
                  ></button>
                  <button
                    pButton
                    icon="pi pi-trash"
                    class="p-button-rounded p-button-text p-button-danger p-button-sm"
                    (click)="onDelete(doc)"
                    pTooltip="Delete"
                    [disabled]="doc.status === 'APPROVED'"
                  ></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="7" class="text-center py-8 text-gray-500">
                No BC documents found
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-confirmDialog />
    <p-toast />
  `
})
export class BCDocumentListComponent implements OnInit {
  private router = inject(Router);
  private bcDocumentService = inject(BCDocumentDemoService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  // Icons
  FileTextIcon = FileText;
  PlusIcon = Plus;
  EditIcon = Edit;
  Trash2Icon = Trash2;
  SendIcon = Send;
  CheckCircleIcon = CheckCircle;
  XCircleIcon = XCircle;

  documents: BCDocument[] = [];
  filteredDocuments: BCDocument[] = [];
  loading = false;
  searchTerm = '';
  selectedType: BCDocType | null = null;
  selectedStatus: BCDocStatus | null = null;

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

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.loading = true;
    this.bcDocumentService.getAll().subscribe({
      next: (documents) => {
        this.documents = documents;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Failed to load BC documents'
        });
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.documents];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.doc_number.toLowerCase().includes(term) ||
        doc.partner_name.toLowerCase().includes(term) ||
        doc.partner_npwp.toLowerCase().includes(term)
      );
    }

    // Type filter
    if (this.selectedType) {
      filtered = filtered.filter(doc => doc.doc_type === this.selectedType);
    }

    // Status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(doc => doc.status === this.selectedStatus);
    }

    this.filteredDocuments = filtered;
  }

  onCreate(): void {
    this.router.navigate(['/bc-documents/create']);
  }

  onEdit(document: BCDocument): void {
    this.router.navigate(['/bc-documents/edit', document.id]);
  }

  onDelete(document: BCDocument): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete document ${document.doc_number}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.bcDocumentService.delete(document.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'BC document deleted successfully'
            });
            this.loadDocuments();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Failed to delete BC document'
            });
          }
        });
      }
    });
  }

  onSubmit(document: BCDocument): void {
    this.confirmationService.confirm({
      message: `Submit document ${document.doc_number} for approval?`,
      header: 'Confirm Submit',
      icon: 'pi pi-send',
      accept: () => {
        this.bcDocumentService.submitDocument(document.id, 'admin').subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Document submitted successfully'
            });
            this.loadDocuments();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Failed to submit document'
            });
          }
        });
      }
    });
  }

  onApprove(document: BCDocument): void {
    this.confirmationService.confirm({
      message: `Approve document ${document.doc_number}?`,
      header: 'Confirm Approval',
      icon: 'pi pi-check',
      accept: () => {
        this.bcDocumentService.approveDocument(document.id, 'admin').subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Document approved successfully'
            });
            this.loadDocuments();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Failed to approve document'
            });
          }
        });
      }
    });
  }

  onReject(document: BCDocument): void {
    // In a real app, this would open a dialog to get rejection reason
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      this.bcDocumentService.rejectDocument(document.id, 'admin', reason).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Document rejected'
          });
          this.loadDocuments();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to reject document'
          });
        }
      });
    }
  }

  getBCDocTypeLabel(type: BCDocType): string {
    return getBCDocTypeLabel(type);
  }

  getBCDocStatusLabel(status: BCDocStatus): string {
    return getBCDocStatusLabel(status);
  }

  getStatusSeverity(status: BCDocStatus): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    const severityMap: Record<BCDocStatus, 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast'> = {
      [BCDocStatus.DRAFT]: 'secondary',
      [BCDocStatus.SUBMITTED]: 'info',
      [BCDocStatus.APPROVED]: 'success',
      [BCDocStatus.REJECTED]: 'danger'
    };
    return severityMap[status];
  }
}
