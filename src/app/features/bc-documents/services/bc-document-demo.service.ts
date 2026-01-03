import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { BCDocument, BCDocumentDetail, BCDocType, BCDocStatus } from '../models/bc-document.model';
import { LocalStorageService } from '../../../core/services/local-storage.service';

/**
 * BC Document Demo Service
 * Implements CRUD operations using localStorage
 * Requirements: 5.1, 5.5, 5.6, 5.7
 */
@Injectable({
    providedIn: 'root'
})
export class BCDocumentDemoService {
    private localStorageService = inject(LocalStorageService);
    private readonly STORAGE_KEY = 'bc_documents';
    private readonly DETAILS_STORAGE_KEY = 'bc_document_details';

    constructor() {
        this.initializeDemoData();
    }

    /**
     * Initialize demo data
     */
    private initializeDemoData(): void {
        const existingDocs = this.localStorageService.getItem<BCDocument[]>(this.STORAGE_KEY);
        if (!existingDocs || existingDocs.length === 0) {
            const demoDocuments: BCDocument[] = [
                {
                    id: '1',
                    doc_number: 'BC23-2024-001',
                    doc_type: BCDocType.BC23,
                    doc_date: new Date('2024-01-15'),
                    status: BCDocStatus.APPROVED,
                    partner_id: '1',
                    partner_name: 'PT Supplier Indonesia',
                    partner_npwp: '01.234.567.8-901.000',
                    invoice_number: 'INV-2024-001',
                    invoice_date: new Date('2024-01-10'),
                    bl_awb_number: 'BL-2024-001',
                    bl_awb_date: new Date('2024-01-12'),
                    customs_office_code: '040300',
                    customs_office_name: 'Kantor Pabean Tanjung Priok',
                    total_value: 50000000,
                    currency: 'IDR',
                    exchange_rate: 1,
                    attachment_files: ['bc23-001.pdf'],
                    submitted_date: new Date('2024-01-16'),
                    approved_date: new Date('2024-01-17'),
                    approved_by: 'admin',
                    ceisa_response_number: 'CEISA-2024-001',
                    ceisa_submission_date: new Date('2024-01-16'),
                    created_at: new Date('2024-01-15'),
                    created_by: 'admin',
                    notes: 'Import bahan baku untuk produksi'
                },
                {
                    id: '2',
                    doc_number: 'BC30-2024-001',
                    doc_type: BCDocType.BC30,
                    doc_date: new Date('2024-01-20'),
                    status: BCDocStatus.SUBMITTED,
                    partner_id: '1',
                    partner_name: 'ABC Trading Co',
                    partner_npwp: '02.345.678.9-012.000',
                    invoice_number: 'INV-EXP-001',
                    invoice_date: new Date('2024-01-18'),
                    bl_awb_number: 'AWB-2024-001',
                    bl_awb_date: new Date('2024-01-19'),
                    customs_office_code: '040300',
                    customs_office_name: 'Kantor Pabean Tanjung Priok',
                    total_value: 75000000,
                    currency: 'IDR',
                    exchange_rate: 1,
                    attachment_files: ['bc30-001.pdf'],
                    submitted_date: new Date('2024-01-21'),
                    ceisa_submission_date: new Date('2024-01-21'),
                    created_at: new Date('2024-01-20'),
                    created_by: 'admin',
                    notes: 'Ekspor barang jadi'
                },
                {
                    id: '3',
                    doc_number: 'BC25-2024-001',
                    doc_type: BCDocType.BC25,
                    doc_date: new Date('2024-01-25'),
                    status: BCDocStatus.DRAFT,
                    partner_id: '2',
                    partner_name: 'PT Global Supplier',
                    partner_npwp: '03.456.789.0-123.000',
                    invoice_number: 'INV-2024-002',
                    invoice_date: new Date('2024-01-23'),
                    total_value: 30000000,
                    currency: 'IDR',
                    exchange_rate: 1,
                    created_at: new Date('2024-01-25'),
                    created_by: 'admin',
                    notes: 'Import mesin produksi'
                }
            ];
            this.localStorageService.setItem(this.STORAGE_KEY, demoDocuments);

            // Initialize demo details
            const demoDetails: BCDocumentDetail[] = [
                {
                    id: '1',
                    bc_document_id: '1',
                    item_id: '1',
                    item_code: 'RM-001',
                    item_name: 'Raw Material A',
                    hs_code: '3901.10.00',
                    quantity: 1000,
                    unit: 'KG',
                    unit_price: 50000,
                    total_price: 50000000,
                    country_of_origin: 'China'
                },
                {
                    id: '2',
                    bc_document_id: '2',
                    item_id: '3',
                    item_code: 'FG-001',
                    item_name: 'Finished Product A',
                    hs_code: '3926.90.99',
                    quantity: 500,
                    unit: 'PCS',
                    unit_price: 150000,
                    total_price: 75000000,
                    country_of_origin: 'Indonesia'
                }
            ];
            this.localStorageService.setItem(this.DETAILS_STORAGE_KEY, demoDetails);
        }
    }

    /**
     * Get all BC documents
     */
    getAll(): Observable<BCDocument[]> {
        const documents = this.localStorageService.getItem<BCDocument[]>(this.STORAGE_KEY) || [];
        return of(documents).pipe(delay(300));
    }

    /**
     * Get BC document by ID
     */
    getById(id: string): Observable<BCDocument> {
        const documents = this.localStorageService.getItem<BCDocument[]>(this.STORAGE_KEY) || [];
        const document = documents.find(d => d.id === id);

        if (!document) {
            return throwError(() => ({ error: { message: 'BC Document not found' } }));
        }

        return of(document).pipe(delay(300));
    }

    /**
     * Create new BC document
     */
    create(document: Partial<BCDocument>): Observable<BCDocument> {
        const documents = this.localStorageService.getItem<BCDocument[]>(this.STORAGE_KEY) || [];

        // Validation
        if (!document.doc_number || !document.doc_type || !document.doc_date) {
            return throwError(() => ({ error: { message: 'Required fields missing' } }));
        }

        // Check duplicate document number
        if (documents.some(d => d.doc_number === document.doc_number)) {
            return throwError(() => ({ error: { message: 'Document number already exists' } }));
        }

        const newDocument: BCDocument = {
            id: Date.now().toString(),
            doc_number: document.doc_number,
            doc_type: document.doc_type,
            doc_date: new Date(document.doc_date),
            status: document.status || BCDocStatus.DRAFT,
            partner_id: document.partner_id || '',
            partner_name: document.partner_name || '',
            partner_npwp: document.partner_npwp || '',
            invoice_number: document.invoice_number,
            invoice_date: document.invoice_date ? new Date(document.invoice_date) : undefined,
            bl_awb_number: document.bl_awb_number,
            bl_awb_date: document.bl_awb_date ? new Date(document.bl_awb_date) : undefined,
            customs_office_code: document.customs_office_code,
            customs_office_name: document.customs_office_name,
            total_value: document.total_value || 0,
            currency: document.currency || 'IDR',
            exchange_rate: document.exchange_rate || 1,
            attachment_files: document.attachment_files || [],
            created_at: new Date(),
            created_by: document.created_by || 'system',
            notes: document.notes
        };

        documents.push(newDocument);
        this.localStorageService.setItem(this.STORAGE_KEY, documents);

        return of(newDocument).pipe(delay(300));
    }

    /**
     * Update BC document
     */
    update(id: string, updates: Partial<BCDocument>): Observable<BCDocument> {
        const documents = this.localStorageService.getItem<BCDocument[]>(this.STORAGE_KEY) || [];
        const index = documents.findIndex(d => d.id === id);

        if (index === -1) {
            return throwError(() => ({ error: { message: 'BC Document not found' } }));
        }

        // Check duplicate document number (excluding current document)
        if (updates.doc_number && documents.some(d => d.id !== id && d.doc_number === updates.doc_number)) {
            return throwError(() => ({ error: { message: 'Document number already exists' } }));
        }

        const updatedDocument: BCDocument = {
            ...documents[index],
            ...updates,
            id,
            updated_at: new Date(),
            updated_by: updates.updated_by || 'system'
        };

        documents[index] = updatedDocument;
        this.localStorageService.setItem(this.STORAGE_KEY, documents);

        return of(updatedDocument).pipe(delay(300));
    }

    /**
     * Delete BC document
     */
    delete(id: string): Observable<void> {
        const documents = this.localStorageService.getItem<BCDocument[]>(this.STORAGE_KEY) || [];
        const filteredDocuments = documents.filter(d => d.id !== id);

        if (documents.length === filteredDocuments.length) {
            return throwError(() => ({ error: { message: 'BC Document not found' } }));
        }

        // Also delete related details
        const details = this.localStorageService.getItem<BCDocumentDetail[]>(this.DETAILS_STORAGE_KEY) || [];
        const filteredDetails = details.filter(d => d.bc_document_id !== id);
        this.localStorageService.setItem(this.DETAILS_STORAGE_KEY, filteredDetails);

        this.localStorageService.setItem(this.STORAGE_KEY, filteredDocuments);
        return of(void 0).pipe(delay(300));
    }

    /**
     * Submit document (change status to SUBMITTED)
     * Requirement: 5.5
     */
    submitDocument(id: string, submittedBy: string): Observable<BCDocument> {
        const documents = this.localStorageService.getItem<BCDocument[]>(this.STORAGE_KEY) || [];
        const index = documents.findIndex(d => d.id === id);

        if (index === -1) {
            return throwError(() => ({ error: { message: 'BC Document not found' } }));
        }

        if (documents[index].status !== BCDocStatus.DRAFT) {
            return throwError(() => ({ error: { message: 'Only DRAFT documents can be submitted' } }));
        }

        documents[index] = {
            ...documents[index],
            status: BCDocStatus.SUBMITTED,
            submitted_date: new Date(),
            updated_at: new Date(),
            updated_by: submittedBy
        };

        this.localStorageService.setItem(this.STORAGE_KEY, documents);
        return of(documents[index]).pipe(delay(300));
    }

    /**
     * Approve document
     * Requirement: 5.6, 5.7
     */
    approveDocument(id: string, approvedBy: string): Observable<BCDocument> {
        const documents = this.localStorageService.getItem<BCDocument[]>(this.STORAGE_KEY) || [];
        const index = documents.findIndex(d => d.id === id);

        if (index === -1) {
            return throwError(() => ({ error: { message: 'BC Document not found' } }));
        }

        if (documents[index].status !== BCDocStatus.SUBMITTED) {
            return throwError(() => ({ error: { message: 'Only SUBMITTED documents can be approved' } }));
        }

        documents[index] = {
            ...documents[index],
            status: BCDocStatus.APPROVED,
            approved_date: new Date(),
            approved_by: approvedBy,
            updated_at: new Date(),
            updated_by: approvedBy
        };

        this.localStorageService.setItem(this.STORAGE_KEY, documents);
        return of(documents[index]).pipe(delay(300));
    }

    /**
     * Reject document
     * Requirement: 5.6, 5.7
     */
    rejectDocument(id: string, rejectedBy: string, reason: string): Observable<BCDocument> {
        const documents = this.localStorageService.getItem<BCDocument[]>(this.STORAGE_KEY) || [];
        const index = documents.findIndex(d => d.id === id);

        if (index === -1) {
            return throwError(() => ({ error: { message: 'BC Document not found' } }));
        }

        if (documents[index].status !== BCDocStatus.SUBMITTED) {
            return throwError(() => ({ error: { message: 'Only SUBMITTED documents can be rejected' } }));
        }

        if (!reason) {
            return throwError(() => ({ error: { message: 'Rejection reason is required' } }));
        }

        documents[index] = {
            ...documents[index],
            status: BCDocStatus.REJECTED,
            rejected_date: new Date(),
            rejection_reason: reason,
            updated_at: new Date(),
            updated_by: rejectedBy
        };

        this.localStorageService.setItem(this.STORAGE_KEY, documents);
        return of(documents[index]).pipe(delay(300));
    }

    /**
     * Add file attachment
     * Requirement: 5.5
     */
    addAttachment(id: string, fileName: string): Observable<BCDocument> {
        const documents = this.localStorageService.getItem<BCDocument[]>(this.STORAGE_KEY) || [];
        const index = documents.findIndex(d => d.id === id);

        if (index === -1) {
            return throwError(() => ({ error: { message: 'BC Document not found' } }));
        }

        const attachments = documents[index].attachment_files || [];
        attachments.push(fileName);

        documents[index] = {
            ...documents[index],
            attachment_files: attachments,
            updated_at: new Date()
        };

        this.localStorageService.setItem(this.STORAGE_KEY, documents);
        return of(documents[index]).pipe(delay(300));
    }

    /**
     * Remove file attachment
     */
    removeAttachment(id: string, fileName: string): Observable<BCDocument> {
        const documents = this.localStorageService.getItem<BCDocument[]>(this.STORAGE_KEY) || [];
        const index = documents.findIndex(d => d.id === id);

        if (index === -1) {
            return throwError(() => ({ error: { message: 'BC Document not found' } }));
        }

        const attachments = (documents[index].attachment_files || []).filter(f => f !== fileName);

        documents[index] = {
            ...documents[index],
            attachment_files: attachments,
            updated_at: new Date()
        };

        this.localStorageService.setItem(this.STORAGE_KEY, documents);
        return of(documents[index]).pipe(delay(300));
    }

    /**
     * Get documents by status
     */
    getByStatus(status: BCDocStatus): Observable<BCDocument[]> {
        const documents = this.localStorageService.getItem<BCDocument[]>(this.STORAGE_KEY) || [];
        const filtered = documents.filter(d => d.status === status);
        return of(filtered).pipe(delay(300));
    }

    /**
     * Get documents by type
     */
    getByType(type: BCDocType): Observable<BCDocument[]> {
        const documents = this.localStorageService.getItem<BCDocument[]>(this.STORAGE_KEY) || [];
        const filtered = documents.filter(d => d.doc_type === type);
        return of(filtered).pipe(delay(300));
    }

    /**
     * Get document details
     */
    getDetails(documentId: string): Observable<BCDocumentDetail[]> {
        const details = this.localStorageService.getItem<BCDocumentDetail[]>(this.DETAILS_STORAGE_KEY) || [];
        const filtered = details.filter(d => d.bc_document_id === documentId);
        return of(filtered).pipe(delay(300));
    }

    /**
     * Add document detail
     */
    addDetail(detail: Partial<BCDocumentDetail>): Observable<BCDocumentDetail> {
        const details = this.localStorageService.getItem<BCDocumentDetail[]>(this.DETAILS_STORAGE_KEY) || [];

        const newDetail: BCDocumentDetail = {
            id: Date.now().toString(),
            bc_document_id: detail.bc_document_id!,
            item_id: detail.item_id!,
            item_code: detail.item_code!,
            item_name: detail.item_name!,
            hs_code: detail.hs_code!,
            quantity: detail.quantity!,
            unit: detail.unit!,
            unit_price: detail.unit_price!,
            total_price: detail.total_price!,
            country_of_origin: detail.country_of_origin
        };

        details.push(newDetail);
        this.localStorageService.setItem(this.DETAILS_STORAGE_KEY, details);

        return of(newDetail).pipe(delay(300));
    }

    /**
     * Delete document detail
     */
    deleteDetail(id: string): Observable<void> {
        const details = this.localStorageService.getItem<BCDocumentDetail[]>(this.DETAILS_STORAGE_KEY) || [];
        const filtered = details.filter(d => d.id !== id);
        this.localStorageService.setItem(this.DETAILS_STORAGE_KEY, filtered);
        return of(void 0).pipe(delay(300));
    }
}
