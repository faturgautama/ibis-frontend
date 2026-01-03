# Build Fixes Needed

## Critical Issues Found

### 1. PrimeNG Module Names Changed in v20

PrimeNG 20 menggunakan nama module yang berbeda:

| Old (v19)        | New (v20)          |
| ---------------- | ------------------ |
| `DropdownModule` | `SelectModule`     |
| `CalendarModule` | `DatePickerModule` |
| `TabViewModule`  | `TabsModule`       |

**Files yang perlu diupdate:**

- `src/app/features/alerts/components/notification-panel/notification-panel.component.ts`
- `src/app/features/audit-trail/components/audit-trail-view/audit-trail-view.component.ts`
- `src/app/features/configuration/components/configuration-panel/configuration-panel.component.ts`
- `src/app/features/customs-integration/components/customs-sync-dashboard/customs-sync-dashboard.component.ts`
- `src/app/features/import-export/components/import-export-panel/import-export-panel.component.ts`
- `src/app/features/reporting/components/report-generator/report-generator.component.ts`
- `src/app/features/stock-mutation/components/stock-mutation-form/stock-mutation-form.component.ts`
- `src/app/features/traceability/components/traceability-view/traceability-view.component.ts`
- `src/app/features/user-management/components/user-list/user-list.component.ts`

**Template changes:**

- `<p-dropdown>` → `<p-select>`
- `<p-calendar>` → `<p-datepicker>`
- `<p-tabView>` → `<p-tabs>`
- `<p-tabPanel>` → `<p-tabpanel>`

### 2. Missing Components

**Warehouse List Component** belum dibuat:

- File: `src/app/features/warehouses/components/warehouse-list/warehouse-list.component.ts`

### 3. Duplicate Identifier

**Traceability View Component** memiliki duplicate `searchRFID`:

- Line 184: property `searchRFID = ''`
- Line 222: method `searchRFID(): void`

**Fix:** Rename property menjadi `searchRFIDValue` atau method menjadi `searchByRFID()`

### 4. Missing Service Methods

**OutboundDemoService** missing method:

- `getAllOutbounds()` - perlu ditambahkan

**ProductionDemoService** missing method:

- `getAllWorkOrders()` - perlu ditambahkan

**StockOpnameService** missing method:

- `getAllOpnames()` - perlu ditambahkan

**StockMutationService** missing method:

- `createMutation()` - perlu ditambahkan

**AuditLogService** missing methods:

- `queryLogs()` - perlu ditambahkan
- `exportLogs()` - perlu ditambahkan

### 5. Type Issues

**BC Document List** - severity type mismatch:

- `getStatusSeverity()` return type harus match PrimeNG Tag severity

**Stock Balance View** - severity type mismatch:

- `getSeverityTag()` return type harus match PrimeNG Tag severity

### 6. FormsModule Missing

Beberapa component menggunakan `[(ngModel)]` tapi tidak import `FormsModule`:

- `bc-document-list.component.ts`
- `stock-balance-view.component.ts`

### 7. Duplicate Exports

**suppliers-customers/models/index.ts** - duplicate exports:

- `NPWP_REGEX`, `formatNPWP`, `validateNPWP` exported dari both supplier dan customer models

### 8. Main Layout Still Using SidebarModule

File `main-layout.component.ts` masih import `SidebarModule` padahal sudah diganti ke `DrawerModule`

## Quick Fix Commands

### Install chart.js (DONE)

```bash
npm install chart.js
```

### Global Find & Replace Needed

1. Replace all `DropdownModule` with `SelectModule`
2. Replace all `from 'primeng/dropdown'` with `from 'primeng/select'`
3. Replace all `CalendarModule` with `DatePickerModule`
4. Replace all `from 'primeng/calendar'` with `from 'primeng/datepicker'`
5. Replace all `TabViewModule` with `TabsModule`
6. Replace all `from 'primeng/tabview'` with `from 'primeng/tabs'`
7. Replace all `<p-dropdown` with `<p-select`
8. Replace all `</p-dropdown>` with `</p-select>`
9. Replace all `<p-calendar` with `<p-datepicker`
10. Replace all `</p-calendar>` with `</p-datepicker>`
11. Replace all `<p-tabView` with `<p-tabs`
12. Replace all `<p-tabPanel` with `<p-tabpanel`

## Estimated Time to Fix

- PrimeNG module updates: ~30 minutes (automated find/replace)
- Missing components: ~15 minutes
- Missing service methods: ~20 minutes
- Type fixes: ~10 minutes
- Other fixes: ~10 minutes

**Total: ~1.5 hours**

## Priority Order

1. Fix PrimeNG imports (blocks everything)
2. Create missing warehouse component
3. Fix duplicate searchRFID
4. Add missing service methods
5. Fix type issues
6. Add FormsModule where needed
7. Fix duplicate exports
