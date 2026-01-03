# IBIS Navigation Guide

## Struktur Menu Navigasi

Sistem IBIS menggunakan sidebar navigation dengan struktur hierarkis sebagai berikut:

### 1. Dashboard

- **Route**: `/dashboard`
- **Component**: `MainDashboardComponent`
- **Fitur**: Metrics cards, charts, recent activities, pending transactions

### 2. Master Data

Menu dengan submenu untuk data master:

#### 2.1 Items

- **Route**: `/items`
- **Component**: `ItemListComponent`
- **Fitur**: CRUD items, HS Code validation, RFID integration

#### 2.2 Warehouses

- **Route**: `/warehouses`
- **Component**: `WarehouseListComponent`
- **Fitur**: CRUD warehouses, capacity tracking, license management

#### 2.3 Suppliers

- **Route**: `/suppliers`
- **Component**: `SupplierListComponent`
- **Fitur**: CRUD suppliers, NPWP validation

#### 2.4 Customers

- **Route**: `/customers`
- **Component**: `CustomerListComponent`
- **Fitur**: CRUD customers, NPWP validation

### 3. Transactions

Menu untuk transaksi operasional:

#### 3.1 Inbound

- **Route**: `/inbound`
- **Component**: `InboundListComponent`
- **Fitur**: Penerimaan barang, BC document linking, quality inspection

#### 3.2 Outbound

- **Route**: `/outbound`
- **Component**: `OutboundListComponent`
- **Fitur**: Pengiriman barang, BC document linking, delivery tracking

#### 3.3 Production

- **Route**: `/production`
- **Component**: `ProductionListComponent`
- **Fitur**: Work orders, material consumption, yield tracking

#### 3.4 Stock Mutation

- **Route**: `/stock-mutation`
- **Component**: `StockMutationFormComponent`
- **Fitur**: Transfer antar gudang, stock movement tracking

#### 3.5 Stock Opname

- **Route**: `/stock-opname`
- **Component**: `StockOpnameListComponent`
- **Fitur**: Physical count, adjustment, approval workflow

### 4. Stock Management

Menu untuk monitoring stock:

#### 4.1 Stock Balance

- **Route**: `/stock-balance`
- **Component**: `StockBalanceViewComponent`
- **Fitur**: Real-time balance, alerts, expiring items, aging report

#### 4.2 Stock History

- **Route**: `/stock-history`
- **Fitur**: Movement history, traceability

#### 4.3 Low Stock Alerts

- **Route**: `/low-stock`
- **Fitur**: Alert monitoring, threshold management

### 5. Customs

Menu untuk dokumen kepabeanan:

#### 5.1 BC Documents

- **Route**: `/bc-documents`
- **Component**: `BCDocumentListComponent`
- **Fitur**: BC23, BC25, BC30, BC40, BC27 management

#### 5.2 Customs Sync

- **Route**: `/customs-sync`
- **Component**: `CustomsSyncDashboardComponent`
- **Fitur**: IT Inventory sync, queue management, retry mechanism

#### 5.3 CEISA Status

- **Route**: `/ceisa-status`
- **Fitur**: CEISA submission tracking, approval status

### 6. Traceability

- **Route**: `/traceability`
- **Component**: `TraceabilityViewComponent`
- **Fitur**: Forward/backward tracing, RFID search, production history

### 7. Reports

Menu untuk reporting:

#### 7.1 Generate Reports

- **Route**: `/reports`
- **Component**: `ReportGeneratorComponent`
- **Fitur**: 7 jenis report, export Excel/PDF

#### 7.2 Scheduled Reports

- **Route**: `/scheduled-reports`
- **Fitur**: Report scheduling, automation

#### 7.3 Report History

- **Route**: `/report-history`
- **Fitur**: Export history, download previous reports

### 8. Audit Trail

- **Route**: `/audit-trail`
- **Component**: `AuditTrailViewComponent`
- **Fitur**: Change tracking, user activity logs, export

### 9. Import/Export

- **Route**: `/import-export`
- **Component**: `ImportExportPanelComponent`
- **Fitur**: Bulk import/export, templates, validation

### 10. Administration

Menu untuk administrasi sistem:

#### 10.1 User Management

- **Route**: `/users`
- **Component**: `UserListComponent`
- **Fitur**: CRUD users, role management, activity logs

#### 10.2 Configuration

- **Route**: `/configuration`
- **Component**: `ConfigurationPanelComponent`
- **Fitur**: Company info, system settings, API config, alerts

#### 10.3 System Logs

- **Route**: `/system-logs`
- **Fitur**: System event logs, error tracking

## Top Navigation Bar

### Notification Bell

- Real-time alerts
- Badge count untuk unread notifications
- Filter by severity
- Mark as read/delete

### User Menu

- Profile
- Change Password
- Settings
- Logout

## Responsive Behavior

### Desktop (>= 768px)

- Sidebar always visible
- Full menu labels
- Breadcrumb visible

### Mobile (< 768px)

- Sidebar collapsible
- Hamburger menu button
- Sidebar closes after navigation

## Role-Based Access

Menu items dapat di-filter berdasarkan user role:

- **ADMIN**: Full access
- **WAREHOUSE**: Master data, transactions, stock management
- **PRODUCTION**: Production, stock balance, traceability
- **AUDIT**: Read-only access, audit trail, reports

## Cara Menggunakan

1. **Login** ke sistem
2. **Sidebar** akan terbuka otomatis
3. **Klik menu item** untuk navigasi
4. **Expand submenu** dengan klik pada parent menu
5. **Active route** ditandai dengan background biru
6. **Notification bell** menampilkan alert count
7. **User menu** untuk profile dan logout

## Lazy Loading

Semua feature modules di-load secara lazy untuk optimasi performa:

- Initial bundle hanya load core dan layout
- Feature modules di-load on-demand saat route diakses
- Mengurangi initial load time
- Meningkatkan performance

## Keyboard Navigation

- **Tab**: Navigate between menu items
- **Enter**: Activate menu item
- **Escape**: Close sidebar/dialogs
- **Arrow keys**: Navigate in dropdowns/tables
