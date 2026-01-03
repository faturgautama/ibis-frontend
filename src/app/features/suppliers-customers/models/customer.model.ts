/**
 * Customer Model
 * 
 * Represents a customer in the KEK system
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

export interface Customer {
    id: string;
    customer_code: string;
    customer_name: string;
    address: string;
    city?: string;
    postal_code?: string;
    country?: string;
    contact_person?: string;
    phone?: string;
    email?: string;
    tax_id: string; // NPWP for Indonesia
    active: boolean;
    created_at: Date;
    updated_at: Date;
}

/**
 * NPWP (Nomor Pokok Wajib Pajak) Validation
 * Format: XX.XXX.XXX.X-XXX.XXX (15 digits with separators)
 * Example: 01.234.567.8-901.234
 */
export const NPWP_REGEX = /^\d{2}\.\d{3}\.\d{3}\.\d{1}-\d{3}\.\d{3}$/;

/**
 * Validate NPWP format
 * @param npwp - NPWP string to validate
 * @returns true if valid, false otherwise
 */
export function validateNPWP(npwp: string): boolean {
    if (!npwp) return false;
    return NPWP_REGEX.test(npwp);
}

/**
 * Format NPWP string (add separators)
 * @param npwp - Raw NPWP digits (15 digits)
 * @returns Formatted NPWP string
 */
export function formatNPWP(npwp: string): string {
    // Remove all non-digit characters
    const digits = npwp.replace(/\D/g, '');

    if (digits.length !== 15) {
        return npwp; // Return original if not 15 digits
    }

    // Format: XX.XXX.XXX.X-XXX.XXX
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}.${digits.slice(8, 9)}-${digits.slice(9, 12)}.${digits.slice(12, 15)}`;
}
