# Fixes Applied

## ✅ Completed Fixes

### 1. Chart.js Installation

```bash
npm install chart.js
```

**Status**: ✅ DONE

### 2. PrimeNG Module Imports (Automated)

Script `fix-primeng-imports.sh` telah dijalankan untuk mengganti:

- `DropdownModule` → `SelectModule`
- `CalendarModule` → `DatePickerModule`
- `TabViewModule` → `TabsModule`
- `SidebarModule` → `DrawerModule`

**Status**: ✅ DONE (automated via script)

### 3. Traceability Component - Partial Fix

- Renamed property `searchRFID` → `searchRFIDValue`
- Updated template bindings

**Status**: ⚠️ PARTIAL (method masih perlu diupdate)

## ⏳ Remaining Fixes Needed

### Critical (Blocks Build)

1. **Missing Warehouse Component**

   - Create: `src/app/features/warehouses/components/warehouse-list/warehouse-list.component.ts`
   - Similar to other list components (items, suppliers, customers)

2. **Missing Service Methods**

   **OutboundDemoService**:

   ```typescript
   getAllOutbounds(): Observable<OutboundHeader[]> {
       const outbounds = this.localStorageService.getItem<OutboundHeader[]>(this.OUTBOUND_KEY) || [];
       return of(outbounds).pipe(delay(200));
   }
   ```

   **ProductionDemoService**:

   ```typescript
   getAllWorkOrders(): Observable<ProductionOrder[]> {
       const orders = this.localStorageService.getItem<ProductionOrder[]>(this.PRODUCTION_KEY) || [];
       return of(orders).pipe(delay(200));
   }
   ```

   **StockOpnameService**:

   ```typescript
   getAllOpnames(): Observable<StockOpname[]> {
       const opnames = this.localStorageService.getItem<StockOpname[]>(this.OPNAME_KEY) || [];
       return of(opnames).pipe(delay(200));
   }
   ```

   **StockMutationService**:

   ```typescript
   createMutation(
       itemId: string,
       fromWarehouseId: string,
       toWarehouseId: string,
       quantity: number,
       reason: string,
       userId: string
   ): Observable<StockMutation> {
       // Implementation needed
   }
   ```

   **AuditLogService**:

   ```typescript
   queryLogs(filters: any): Observable<AuditLog[]> {
       return this.query(filters);
   }

   exportLogs(filters: any): Observable<Blob> {
       return this.query(filters).pipe(
           map(logs => {
               const csv = this.convertToCSV(logs);
               return new Blob([csv], { type: 'text/csv' });
           })
       );
   }
   ```

3. **Add FormsModule**

   Files needing FormsModule:

   - `bc-document-list.component.ts`
   - `stock-balance-view.component.ts`

4. **Fix Duplicate Exports**

   In `suppliers-customers/models/index.ts`:

   ```typescript
   export * from './supplier.model';
   export { Customer, CustomerStatus } from './customer.model';
   // Don't re-export NPWP_REGEX, formatNPWP, validateNPWP from customer
   ```

5. **Fix Type Issues**

   Tag severity must be one of: `'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast'`

   Update methods:

   - `bc-document-list.component.ts` - `getStatusSeverity()`
   - `stock-balance-view.component.ts` - `getSeverityTag()`

6. **Fix Traceability searchRFID Method**

   Update the method to use `searchRFIDValue` property

## 🔧 Quick Fix Script

Saya sudah membuat dokumentasi lengkap di `BUILD_FIXES_NEEDED.md` dengan detail setiap fix yang diperlukan.

## 📝 Next Steps

1. Jalankan fixes untuk missing methods (copy-paste code di atas)
2. Create warehouse-list component
3. Fix type issues
4. Run `ng build` lagi untuk verify

## Estimated Time

- Missing methods: 10 minutes
- Warehouse component: 10 minutes
- Type fixes: 5 minutes
- Verification: 5 minutes

**Total: ~30 minutes**
