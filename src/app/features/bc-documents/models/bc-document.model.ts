/**
 * BC Document Models and Enums
 * Requirements: 5.2, 5.3
 */

/**
 * BC Document Type Enum
 * BC23: Import for processing
 * BC25: Import for use
 * BC30: Export
 * BC40: Re-export
 * BC27: Subcontracting
 */
export enum BCDocType {
    BC23 = 'BC23',
    BC25 = 'BC25',
    BC30 = 'BC30',
    BC40 = 'BC40',
    BC27 = 'BC27'
}

/**
 * BC Document Status Enum
 */
export enum BCDocStatus {
    DRAFT = 'DRAFT',
    SUBMITTED = 'SUBMITTED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

/**
 * BC Document Interface
 */
export interface BCDocument {
    id: string;
    doc_number: string;
    doc_type: BCDocType;
    doc_date: Date;
    status: BCDocStatus;

    // Supplier/Customer info
    partner_id: string;
    partner_name: string;
    partner_npwp: string;

    // Document details
    invoice_number?: string;
    invoice_date?: Date;
    bl_awb_number?: string;
    bl_awb_date?: Date;

    // Customs office
    customs_office_code?: string;
    customs_office_name?: string;

    // Values
    total_value: number;
    currency: string;
    exchange_rate: number;

    // File attachments
    attachment_files?: string[];

    // Approval info
    submitted_date?: Date;
    approved_date?: Date;
    rejected_date?: Date;
    rejection_reason?: string;
    approved_by?: string;

    // CEISA integration
    ceisa_response_number?: string;
    ceisa_submission_date?: Date;

    // Audit fields
    created_at: Date;
    created_by: string;
    updated_at?: Date;
    updated_by?: string;

    // Additional notes
    notes?: string;
}

/**
 * BC Document Detail Interface (for items in the document)
 */
export interface BCDocumentDetail {
    id: string;
    bc_document_id: string;
    item_id: string;
    item_code: string;
    item_name: string;
    hs_code: string;
    quantity: number;
    unit: string;
    unit_price: number;
    total_price: number;
    country_of_origin?: string;
}

/**
 * Helper function to get BC Doc Type label
 */
export function getBCDocTypeLabel(type: BCDocType): string {
    const labels: Record<BCDocType, string> = {
        [BCDocType.BC23]: 'BC 2.3 - Import untuk Diolah',
        [BCDocType.BC25]: 'BC 2.5 - Import untuk Dipakai',
        [BCDocType.BC30]: 'BC 3.0 - Ekspor',
        [BCDocType.BC40]: 'BC 4.0 - Re-Ekspor',
        [BCDocType.BC27]: 'BC 2.7 - Subkontrak'
    };
    return labels[type];
}

/**
 * Helper function to get BC Doc Status label
 */
export function getBCDocStatusLabel(status: BCDocStatus): string {
    const labels: Record<BCDocStatus, string> = {
        [BCDocStatus.DRAFT]: 'Draft',
        [BCDocStatus.SUBMITTED]: 'Submitted',
        [BCDocStatus.APPROVED]: 'Approved',
        [BCDocStatus.REJECTED]: 'Rejected'
    };
    return labels[status];
}

/**
 * Helper function to get status color for UI
 */
export function getBCDocStatusColor(status: BCDocStatus): string {
    const colors: Record<BCDocStatus, string> = {
        [BCDocStatus.DRAFT]: 'gray',
        [BCDocStatus.SUBMITTED]: 'blue',
        [BCDocStatus.APPROVED]: 'green',
        [BCDocStatus.REJECTED]: 'red'
    };
    return colors[status];
}
