import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { StockOpname, StockOpnameDetail, OpnameType, calculateDifference } from '../models/stock-opname.model';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { StockBalanceService } from '../../stock-balance/services/stock-balance.service';
import { StockMovementType, StockReferenceType } from '../../stock-balance/models/stock-balance.model';

/**
 * Stock Opname Service
 * Requirements: 11.1, 11.2, 11.4, 11.5, 11.7, 11.10
 */
@Injectable({
    providedIn: 'root'
})
export class StockOpnameService {
    private localStorageService = inject(LocalStorageService);
    private stockBalanceService = inject(StockBalanceService);
    private readonly OPNAME_KEY = 'stock_opnames';
    private readonly DETAIL_KEY = 'stock_opname_details';

    getAll(): Observable<StockOpname[]> {
        const opnames = this.localStorageService.getItem<StockOpname[]>(this.OPNAME_KEY) || [];
        return of(opnames).pipe(delay(300));
    }

    create(opname: Partial<StockOpname>, details: Partial<StockOpnameDetail>[]): Observable<StockOpname> {
        if (!opname.warehouse_id || !opname.opname_type) {
            return throwError(() => ({ error: { message: 'Required fields missing' } }));
        }

        // Validate adjustment reason for differences (Requirement 11.5)
        for (const detail of details) {
            const diff = calculateDifference(detail.system_quantity || 0, detail.physical_quantity || 0);
            if (diff !== 0 && !detail.adjustment_reason) {
                return throwError(() => ({ error: { message: 'Adjustment reason required for differences' } }));
            }
        }

        const opnames = this.localStorageService.getItem<StockOpname[]>(this.OPNAME_KEY) || [];
        const existingDetails = this.localStorageService.getItem<StockOpnameDetail[]>(this.DETAIL_KEY) || [];

        const newOpname: StockOpname = {
            id: Date.now().toString(),
            opname_number: opname.opname_number || `OPN-${Date.now()}`,
            opname_date: new Date(opname.opname_date || new Date()),
            opname_type: opname.opname_type,
            warehouse_id: opname.warehouse_id,
            warehouse_code: opname.warehouse_code || '',
            warehouse_name: opname.warehouse_name || '',
            status: 'DRAFT',
            created_at: new Date(),
            created_by: opname.created_by || 'system',
            notes: opname.notes
        };

        opnames.push(newOpname);
        this.localStorageService.setItem(this.OPNAME_KEY, opnames);

        // Save details
        details.forEach((detail, index) => {
            const diff = calculateDifference(detail.system_quantity || 0, detail.physical_quantity || 0);
            const newDetail: StockOpnameDetail = {
                id: `${newOpname.id}-${index + 1}`,
                opname_id: newOpname.id,
                item_id: detail.item_id!,
                item_code: detail.item_code!,
                item_name: detail.item_name!,
                system_quantity: detail.system_quantity || 0,
                physical_quantity: detail.physical_quantity || 0,
                difference: diff,
                unit: detail.unit!,
                adjustment_reason: detail.adjustment_reason,
                batch_number: detail.batch_number
            };
            existingDetails.push(newDetail);
        });

        this.localStorageService.setItem(this.DETAIL_KEY, existingDetails);
        return of(newOpname).pipe(delay(300));
    }

    approve(id: string, userId: string): Observable<StockOpname> {
        const opnames = this.localStorageService.getItem<StockOpname[]>(this.OPNAME_KEY) || [];
        const index = opnames.findIndex(o => o.id === id);

        if (index === -1) {
            return throwError(() => ({ error: { message: 'Opname not found' } }));
        }

        opnames[index] = {
            ...opnames[index],
            status: 'APPROVED',
            approved_by: userId,
            approved_date: new Date()
        };

        this.localStorageService.setItem(this.OPNAME_KEY, opnames);

        // Apply adjustments to stock balance (Requirement 11.7)
        const details = this.localStorageService.getItem<StockOpnameDetail[]>(this.DETAIL_KEY) || [];
        const opnameDetails = details.filter(d => d.opname_id === id);

        opnameDetails.forEach(detail => {
            if (detail.difference !== 0) {
                const movementType = detail.difference > 0
                    ? StockMovementType.ADJUSTMENT_INCREASE
                    : StockMovementType.ADJUSTMENT_DECREASE;

                this.stockBalanceService.updateBalance(
                    detail.item_id,
                    opnames[index].warehouse_id,
                    detail.difference,
                    movementType,
                    opnames[index].opname_number,
                    StockReferenceType.STOCK_OPNAME,
                    0,
                    detail.batch_number,
                    userId
                ).subscribe();
            }
        });

        return of(opnames[index]).pipe(delay(300));
    }

    getDetails(opnameId: string): Observable<StockOpnameDetail[]> {
        const details = this.localStorageService.getItem<StockOpnameDetail[]>(this.DETAIL_KEY) || [];
        return of(details.filter(d => d.opname_id === opnameId)).pipe(delay(300));
    }

    /**
     * Get all opnames
     */
    getAllOpnames(): Observable<StockOpname[]> {
        const opnames = this.localStorageService.getItem<StockOpname[]>(this.OPNAME_KEY) || [];
        return of(opnames).pipe(delay(200));
    }
}
