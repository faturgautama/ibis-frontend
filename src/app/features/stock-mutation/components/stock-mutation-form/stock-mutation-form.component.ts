import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { StockMutationService } from '../../services/stock-mutation.service';

@Component({
    selector: 'app-stock-mutation-form',
    standalone: true,
    imports: [CommonModule, FormsModule, InputTextModule, InputNumberModule, SelectModule, ButtonModule, TextareaModule],
    template: `
        <div class="p-6">
            <div class="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">Stock Mutation / Transfer</h2>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Item</label>
                        <p-select 
                            [(ngModel)]="mutation.item_id"
                            [options]="items"
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Select Item"
                            class="w-full"
                        ></p-select>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">From Warehouse</label>
                            <p-select 
                                [(ngModel)]="mutation.from_warehouse_id"
                                [options]="warehouses"
                                optionLabel="name"
                                optionValue="id"
                                placeholder="Select Warehouse"
                                class="w-full"
                            ></p-select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">To Warehouse</label>
                            <p-select 
                                [(ngModel)]="mutation.to_warehouse_id"
                                [options]="warehouses"
                                optionLabel="name"
                                optionValue="id"
                                placeholder="Select Warehouse"
                                class="w-full"
                            ></p-select>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                        <p-inputNumber 
                            [(ngModel)]="mutation.quantity"
                            [min]="1"
                            class="w-full"
                        ></p-inputNumber>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                        <textarea 
                            pInputTextarea 
                            [(ngModel)]="mutation.reason"
                            rows="3"
                            class="w-full"
                        ></textarea>
                    </div>

                    <div class="flex gap-3 pt-4">
                        <button 
                            pButton 
                            label="Submit Transfer" 
                            icon="pi pi-check"
                            (click)="submitMutation()"
                            class="p-button-primary"
                        ></button>
                        <button 
                            pButton 
                            label="Cancel" 
                            icon="pi pi-times"
                            class="p-button-secondary"
                        ></button>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class StockMutationFormComponent {
    private mutationService = inject(StockMutationService);

    mutation: any = {
        item_id: '',
        from_warehouse_id: '',
        to_warehouse_id: '',
        quantity: 0,
        reason: ''
    };

    items = [
        { id: '1', name: 'Raw Material A' },
        { id: '2', name: 'Work in Progress A' },
        { id: '3', name: 'Finished Product A' }
    ];

    warehouses = [
        { id: '1', name: 'Raw Material Warehouse' },
        { id: '2', name: 'WIP Warehouse' },
        { id: '3', name: 'Finished Goods Warehouse' }
    ];

    submitMutation(): void {
        this.mutationService.createMutation(
            this.mutation.item_id,
            this.mutation.from_warehouse_id,
            this.mutation.to_warehouse_id,
            this.mutation.quantity,
            this.mutation.reason,
            'current_user'
        ).subscribe({
            next: () => {
                alert('Stock mutation created successfully');
                this.resetForm();
            },
            error: (err) => alert('Failed: ' + err.error?.message)
        });
    }

    resetForm(): void {
        this.mutation = {
            item_id: '',
            from_warehouse_id: '',
            to_warehouse_id: '',
            quantity: 0,
            reason: ''
        };
    }
}
