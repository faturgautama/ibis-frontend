/**
 * Stock Mutation Model
 * Requirements: 8.2
 */

export interface StockMutation {
    id: string;
    mutation_number: string;
    mutation_date: Date;

    // Item
    item_id: string;
    item_code: string;
    item_name: string;

    // From warehouse
    from_warehouse_id: string;
    from_warehouse_code: string;
    from_warehouse_name: string;

    // To warehouse
    to_warehouse_id: string;
    to_warehouse_code: string;
    to_warehouse_name: string;

    // Quantity
    quantity: number;
    unit: string;

    // Reason
    reason: string;

    // Audit
    created_at: Date;
    created_by: string;

    notes?: string;
}

export interface StockMutationDetail {
    id: string;
    mutation_id: string;
    item_id: string;
    item_code: string;
    item_name: string;
    quantity: number;
    unit: string;
    batch_number?: string;
}
