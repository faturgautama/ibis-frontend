/**
 * Stock Balance Models
 * Requirements: 7.1, 7.3
 */

/**
 * Stock Balance Interface
 * Represents current stock balance for an item in a warehouse
 */
export interface StockBalance {
    id: string;
    item_id: string;
    item_code: string;
    item_name: string;
    warehouse_id: string;
    warehouse_code: string;
    warehouse_name: string;

    // Quantities
    quantity: number;
    reserved_quantity: number;
    available_quantity: number;

    // Unit
    unit: string;

    // Value
    unit_cost: number;
    total_value: number;

    // Batch/Lot tracking
    batch_number?: string;
    lot_number?: string;
    serial_number?: string;

    // Expiry tracking
    expiry_date?: Date;
    manufacturing_date?: Date;

    // Location
    location_code?: string;
    bin_location?: string;

    // RFID tracking
    rfid_tag?: string;

    // Aging
    stock_age_days?: number;
    last_movement_date?: Date;

    // Audit fields
    last_updated: Date;
    updated_by: string;
}

/**
 * Stock History Interface
 * Tracks all stock movements
 */
export interface StockHistory {
    id: string;
    item_id: string;
    item_code: string;
    item_name: string;
    warehouse_id: string;
    warehouse_code: string;
    warehouse_name: string;

    // Movement details
    movement_type: StockMovementType;
    movement_date: Date;
    reference_number: string;
    reference_type: StockReferenceType;

    // Quantities
    quantity_before: number;
    quantity_change: number;
    quantity_after: number;

    // Unit
    unit: string;

    // Cost
    unit_cost: number;
    total_cost: number;

    // Batch/Lot
    batch_number?: string;
    lot_number?: string;

    // Additional info
    notes?: string;

    // User
    created_by: string;
    created_at: Date;
}

/**
 * Stock Movement Type Enum
 */
export enum StockMovementType {
    INBOUND = 'INBOUND',
    OUTBOUND = 'OUTBOUND',
    TRANSFER_IN = 'TRANSFER_IN',
    TRANSFER_OUT = 'TRANSFER_OUT',
    PRODUCTION_CONSUME = 'PRODUCTION_CONSUME',
    PRODUCTION_OUTPUT = 'PRODUCTION_OUTPUT',
    ADJUSTMENT_INCREASE = 'ADJUSTMENT_INCREASE',
    ADJUSTMENT_DECREASE = 'ADJUSTMENT_DECREASE',
    RETURN = 'RETURN',
    SCRAP = 'SCRAP'
}

/**
 * Stock Reference Type Enum
 */
export enum StockReferenceType {
    INBOUND_RECEIPT = 'INBOUND_RECEIPT',
    OUTBOUND_DELIVERY = 'OUTBOUND_DELIVERY',
    STOCK_TRANSFER = 'STOCK_TRANSFER',
    PRODUCTION_ORDER = 'PRODUCTION_ORDER',
    STOCK_ADJUSTMENT = 'STOCK_ADJUSTMENT',
    STOCK_OPNAME = 'STOCK_OPNAME',
    RETURN_NOTE = 'RETURN_NOTE',
    SCRAP_NOTE = 'SCRAP_NOTE'
}

/**
 * Stock Alert Interface
 * For low stock and expiring items alerts
 */
export interface StockAlert {
    id: string;
    alert_type: StockAlertType;
    severity: AlertSeverity;
    item_id: string;
    item_code: string;
    item_name: string;
    warehouse_id: string;
    warehouse_code: string;
    warehouse_name: string;
    current_quantity: number;
    threshold_quantity?: number;
    expiry_date?: Date;
    days_until_expiry?: number;
    message: string;
    is_acknowledged: boolean;
    acknowledged_by?: string;
    acknowledged_at?: Date;
    created_at: Date;
}

/**
 * Stock Alert Type Enum
 */
export enum StockAlertType {
    LOW_STOCK = 'LOW_STOCK',
    OUT_OF_STOCK = 'OUT_OF_STOCK',
    EXPIRING_SOON = 'EXPIRING_SOON',
    EXPIRED = 'EXPIRED',
    OVERSTOCK = 'OVERSTOCK'
}

/**
 * Alert Severity Enum
 */
export enum AlertSeverity {
    INFO = 'INFO',
    WARNING = 'WARNING',
    CRITICAL = 'CRITICAL'
}

/**
 * Stock Aging Report Interface
 */
export interface StockAgingReport {
    item_id: string;
    item_code: string;
    item_name: string;
    warehouse_id: string;
    warehouse_code: string;
    warehouse_name: string;
    total_quantity: number;
    total_value: number;
    aging_buckets: {
        '0-30_days': { quantity: number; value: number };
        '31-60_days': { quantity: number; value: number };
        '61-90_days': { quantity: number; value: number };
        '91-180_days': { quantity: number; value: number };
        'over_180_days': { quantity: number; value: number };
    };
    oldest_stock_date: Date;
    average_age_days: number;
}

/**
 * Helper function to calculate available quantity
 */
export function calculateAvailableQuantity(balance: StockBalance): number {
    return balance.quantity - balance.reserved_quantity;
}

/**
 * Helper function to check if stock is low
 */
export function isLowStock(balance: StockBalance, minStockLevel: number): boolean {
    return balance.available_quantity <= minStockLevel;
}

/**
 * Helper function to check if item is expiring soon
 */
export function isExpiringSoon(expiryDate: Date, daysThreshold: number): boolean {
    if (!expiryDate) return false;
    const today = new Date();
    const diffTime = new Date(expiryDate).getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= daysThreshold;
}

/**
 * Helper function to check if item is expired
 */
export function isExpired(expiryDate: Date): boolean {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
}

/**
 * Helper function to calculate stock age in days
 */
export function calculateStockAge(lastMovementDate: Date): number {
    const today = new Date();
    const diffTime = today.getTime() - new Date(lastMovementDate).getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Helper function to get movement type label
 */
export function getMovementTypeLabel(type: StockMovementType): string {
    const labels: Record<StockMovementType, string> = {
        [StockMovementType.INBOUND]: 'Inbound Receipt',
        [StockMovementType.OUTBOUND]: 'Outbound Delivery',
        [StockMovementType.TRANSFER_IN]: 'Transfer In',
        [StockMovementType.TRANSFER_OUT]: 'Transfer Out',
        [StockMovementType.PRODUCTION_CONSUME]: 'Production Consumption',
        [StockMovementType.PRODUCTION_OUTPUT]: 'Production Output',
        [StockMovementType.ADJUSTMENT_INCREASE]: 'Adjustment (+)',
        [StockMovementType.ADJUSTMENT_DECREASE]: 'Adjustment (-)',
        [StockMovementType.RETURN]: 'Return',
        [StockMovementType.SCRAP]: 'Scrap'
    };
    return labels[type];
}

/**
 * Helper function to get alert severity color
 */
export function getAlertSeverityColor(severity: AlertSeverity): string {
    const colors: Record<AlertSeverity, string> = {
        [AlertSeverity.INFO]: 'blue',
        [AlertSeverity.WARNING]: 'orange',
        [AlertSeverity.CRITICAL]: 'red'
    };
    return colors[severity];
}
