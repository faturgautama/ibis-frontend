# Design Document

## Overview

KEK IT Inventory System adalah aplikasi web-based yang dibangun menggunakan Angular 20 dengan arsitektur standalone components. Sistem ini dirancang untuk mengelola inventory di kawasan industri kepabeanan dengan fokus pada traceability, compliance, dan auditability.

### Key Design Principles

1. **Traceability First**: Setiap transaksi harus dapat dilacak dari awal hingga akhir
2. **Audit-Ready**: Semua perubahan data tercatat dengan lengkap
3. **Compliance by Design**: Sistem dirancang untuk memenuhi regulasi Bea Cukai
4. **Dual-Mode Operation**: Support demo mode (localStorage) dan production mode (API)
5. **Modern & Minimalist UI**: Clean, professional, dengan Inter font dan sky-blue accents

### Technology Stack

- **Frontend**: Angular 20.3.0 (Standalone Components)
- **State Management**: NgRx 20.1.0
- **UI Library**: PrimeNG 20.4.0
- **Styling**: TailwindCSS 4.1.18
- **Icons**: Lucide Angular (1,555+ icons)
- **Typography**: Inter font family
- **Language**: TypeScript 5.9.2

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Components  │  │   Layouts    │  │   Guards     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    State Management Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Store     │  │   Actions    │  │   Effects    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  API Service │  │ Demo Service │  │ Core Service │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
┌───────▼────────┐                    ┌────────▼────────┐
│  Backend API   │                    │  LocalStorage   │
│  (Production)  │                    │  (Demo Mode)    │
└────────────────┘                    └─────────────────┘
        │
        ├─── IT Inventory API
        └─── CEISA API
```

### Feature-Based Architecture

```
src/app/
├── core/                    # Singleton services
│   ├── guards/
│   ├── interceptors/
│   └── services/
├── shared/                  # Reusable components
│   ├── components/
│   ├── directives/
│   └── pipes/
├── features/                # Feature modules
│   ├── auth/
│   ├── dashboard/
│   ├── inventory/
│   ├── purchasing/
│   ├── warehouse/
│   ├── production/
│   ├── customs/
│   ├── traceability/
│   ├── reports/
│   └── settings/
├── store/                   # NgRx store
│   ├── auth/
│   ├── inventory/
│   ├── production/
│   └── ...
└── layouts/                 # Layout components
    ├── main-layout/
    └── auth-layout/
```

---

## Components and Interfaces

### Core Services

#### 1. DataProvider (Abstract Service)

```typescript
export abstract class DataProvider<T> {
  abstract getAll(): Observable<T[]>;
  abstract getById(id: string): Observable<T>;
  abstract create(item: T): Observable<T>;
  abstract update(id: string, item: T): Observable<T>;
  abstract delete(id: string): Observable<void>;
}
```

**Purpose**: Provide consistent interface for API and Demo services

#### 2. LocalStorageService

```typescript
export class LocalStorageService {
  setItem<T>(key: string, value: T): void;
  getItem<T>(key: string): T | null;
  removeItem(key: string): void;
  clear(): void;
}
```

**Purpose**: Wrapper for localStorage operations with type safety

#### 3. AuthService

```typescript
export class AuthService {
  login(credentials: LoginCredentials): Observable<AuthResponse>;
  logout(): void;
  getCurrentUser(): Observable<User | null>;
  isAuthenticated(): boolean;
  hasRole(role: UserRole): boolean;
}
```

**Purpose**: Handle authentication and authorization

#### 4. NotificationService

```typescript
export class NotificationService {
  success(message: string): void;
  error(message: string): void;
  warning(message: string): void;
  info(message: string): void;
}
```

**Purpose**: Display toast notifications using PrimeNG Toast

### Feature Services

#### 1. InventoryApiService (Production)

```typescript
export class InventoryApiService extends DataProvider<Item> {
  private apiUrl = `${environment.apiUrl}/items`;

  getAll(): Observable<Item[]>;
  getById(id: string): Observable<Item>;
  create(item: Item): Observable<Item>;
  update(id: string, item: Item): Observable<Item>;
  delete(id: string): Observable<void>;
  getLowStockItems(): Observable<Item[]>;
  getExpiringItems(days: number): Observable<Item[]>;
}
```

#### 2. InventoryDemoService (Demo Mode)

```typescript
export class InventoryDemoService extends DataProvider<Item> {
  private storageKey = 'inventory_items';

  getAll(): Observable<Item[]>;
  getById(id: string): Observable<Item>;
  create(item: Item): Observable<Item>;
  update(id: string, item: Item): Observable<Item>;
  delete(id: string): Observable<void>;

  private initializeDemoData(): void;
  private simulateDelay(): Observable<void>;
}
```

#### 3. CustomsIntegrationService

```typescript
export class CustomsIntegrationService {
  syncToITInventory(transaction: Transaction): Observable<SyncResponse>;
  submitToCEISA(document: BCDocument): Observable<CEISAResponse>;
  checkCEISAStatus(docNumber: string): Observable<CEISAStatus>;
  retryFailedSync(transactionId: string): Observable<SyncResponse>;
}
```

#### 4. TraceabilityService

```typescript
export class TraceabilityService {
  traceForward(itemId: string): Observable<TraceabilityChain>;
  traceBackward(itemId: string): Observable<TraceabilityChain>;
  getProductionHistory(fgItemId: string): Observable<ProductionHistory[]>;
  getRawMaterialUsage(rmItemId: string): Observable<MaterialUsage[]>;
}
```

### State Management (NgRx)

#### Store Structure

```typescript
// Root State
export interface AppState {
  auth: AuthState;
  inventory: InventoryState;
  production: ProductionState;
  customs: CustomsState;
  ui: UIState;
}

// Inventory State
export interface InventoryState {
  items: Item[];
  selectedItem: Item | null;
  loading: boolean;
  error: string | null;
  filters: InventoryFilters;
}

// Actions
export const InventoryActions = createActionGroup({
  source: 'Inventory',
  events: {
    'Load Items': emptyProps(),
    'Load Items Success': props<{ items: Item[] }>(),
    'Load Items Failure': props<{ error: string }>(),
    'Create Item': props<{ item: Item }>(),
    'Update Item': props<{ id: string; item: Item }>(),
    'Delete Item': props<{ id: string }>(),
  },
});

// Selectors
export const selectAllItems = createSelector(selectInventoryState, (state) => state.items);

export const selectLowStockItems = createSelector(selectAllItems, (items) =>
  items.filter((item) => item.qty_balance <= item.min_stock)
);
```

### UI Components

#### 1. DataTableComponent (Shared)

```typescript
@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  template: `
    <p-table
      [value]="data"
      [paginator]="true"
      [rows]="pageSize"
      [loading]="loading"
      styleClass="p-datatable-sm"
    >
      <ng-content></ng-content>
    </p-table>
  `,
})
export class DataTableComponent<T> {
  @Input() data: T[] = [];
  @Input() loading = false;
  @Input() pageSize = 50;
}
```

#### 2. PageHeaderComponent (Shared)

```typescript
@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">{{ title }}</h1>
        <p class="text-sm text-gray-600 mt-1">{{ subtitle }}</p>
      </div>
      <div class="flex gap-2">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class PageHeaderComponent {
  @Input() title!: string;
  @Input() subtitle?: string;
}
```

---

## Data Models

### Core Models

#### Item Model

```typescript
export interface Item {
  id: string;
  item_code: string;
  item_name: string;
  description?: string;
  hs_code: string;
  item_type: ItemType;
  unit: string;
  category_id?: string;
  brand?: string;
  min_stock?: number;
  max_stock?: number;
  reorder_point?: number;
  lead_time_days?: number;
  price?: number;
  currency?: string;
  image_url?: string;
  barcode?: string;
  rfid_tag?: string;
  shelf_life_days?: number;
  storage_condition?: string;
  is_hazardous: boolean;
  facility_status: FacilityStatus;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export enum ItemType {
  RAW = 'RAW',
  WIP = 'WIP',
  FG = 'FG',
  ASSET = 'ASSET',
}

export enum FacilityStatus {
  FASILITAS = 'FASILITAS',
  NON = 'NON',
}
```

#### Warehouse Model

```typescript
export interface Warehouse {
  id: string;
  warehouse_code: string;
  warehouse_name: string;
  location: string;
  warehouse_type: WarehouseType;
  capacity?: number;
  current_utilization?: number;
  manager_id?: string;
  address?: string;
  phone?: string;
  is_bonded: boolean;
  license_number?: string;
  license_expiry?: Date;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export enum WarehouseType {
  RAW_MATERIAL = 'RAW_MATERIAL',
  WIP = 'WIP',
  FINISHED_GOODS = 'FINISHED_GOODS',
  QUARANTINE = 'QUARANTINE',
}
```

#### BCDocument Model

```typescript
export interface BCDocument {
  id: string;
  doc_type: BCDocType;
  doc_number: string;
  doc_date: Date;
  reference_number?: string;
  supplier_id?: string;
  customer_id?: string;
  total_value?: number;
  currency?: string;
  exchange_rate?: number;
  status: BCDocStatus;
  submitted_date?: Date;
  approved_date?: Date;
  approved_by?: string;
  attachment_url?: string;
  remarks?: string;
  created_by: string;
  updated_by?: string;
  created_at: Date;
  updated_at: Date;
}

export enum BCDocType {
  BC23 = 'BC23',
  BC25 = 'BC25',
  BC30 = 'BC30',
  BC40 = 'BC40',
  BC27 = 'BC27',
}

export enum BCDocStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}
```

#### InboundHeader Model

```typescript
export interface InboundHeader {
  id: string;
  inbound_number: string;
  customs_doc_id: string;
  supplier_id: string;
  supplier_name?: string;
  inbound_date: Date;
  warehouse_id: string;
  po_number?: string;
  invoice_number?: string;
  vehicle_number?: string;
  driver_name?: string;
  received_by: string;
  checked_by?: string;
  status: InboundStatus;
  total_items: number;
  total_qty: number;
  total_value: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export enum InboundStatus {
  PENDING = 'PENDING',
  RECEIVED = 'RECEIVED',
  QUALITY_CHECK = 'QUALITY_CHECK',
  COMPLETED = 'COMPLETED',
}
```

#### InboundDetail Model

```typescript
export interface InboundDetail {
  id: string;
  inbound_id: string;
  item_id: string;
  qty: number;
  value: number;
  unit_price?: number;
  batch_number?: string;
  serial_number?: string;
  manufacturing_date?: Date;
  expiry_date?: Date;
  quality_status: QualityStatus;
  location_code?: string;
  notes?: string;
}

export enum QualityStatus {
  PASS = 'PASS',
  FAIL = 'FAIL',
  QUARANTINE = 'QUARANTINE',
}
```

#### ProductionOrder Model

```typescript
export interface ProductionOrder {
  id: string;
  production_no: string;
  production_date: Date;
  fg_item_id: string;
  fg_qty: number;
  wo_status: WOStatus;
  planned_start_date?: Date;
  actual_start_date?: Date;
  planned_end_date?: Date;
  actual_end_date?: Date;
  shift?: string;
  line_number?: string;
  supervisor_id?: string;
  operator_id?: string;
  yield_percentage?: number;
  scrap_qty?: number;
  scrap_reason?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export enum WOStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
```

#### ProductionMaterial Model

```typescript
export interface ProductionMaterial {
  id: string;
  production_id: string;
  raw_item_id: string;
  qty_used: number;
}
```

#### StockBalance Model

```typescript
export interface StockBalance {
  item_id: string;
  warehouse_id: string;
  qty_balance: number;
  last_updated: Date;
}
```

#### AuditLog Model

```typescript
export interface AuditLog {
  id: string;
  user_id: string;
  action: AuditAction;
  table_name: string;
  record_id: string;
  old_data: any;
  new_data: any;
  created_at: Date;
}

export enum AuditAction {
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}
```

---

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Authentication Success for Valid Credentials

_For any_ valid user credentials, authentication should succeed and grant access to the system.
**Validates: Requirements 1.1**

### Property 2: Authentication Failure for Invalid Credentials

_For any_ invalid user credentials, authentication should fail and display an error message.
**Validates: Requirements 1.2**

### Property 3: Role-Based Feature Access

_For any_ user with a specific role, the displayed features should match that role's permissions.
**Validates: Requirements 1.4**

### Property 4: Item CRUD Operations

_For any_ valid item data, create, read, update, and delete operations should work correctly.
**Validates: Requirements 2.1**

### Property 5: Item Required Fields Validation

_For any_ item creation attempt without required fields (item_code, item_name, hs_code, item_type, unit), the system should reject the operation.
**Validates: Requirements 2.2**

### Property 6: HS Code Format Validation

_For any_ HS code input, only 10-digit codes should be accepted.
**Validates: Requirements 2.3**

### Property 7: Low Stock Alert Generation

_For any_ item where qty_balance < min_stock, a low stock alert should be generated.
**Validates: Requirements 2.5, 7.4**

### Property 8: Hazardous Item Warning Display

_For any_ item where is_hazardous = true, warning indicators should be displayed.
**Validates: Requirements 2.9**

### Property 9: Item Deletion Prevention with History

_For any_ item that appears in transaction tables, deletion should be rejected.
**Validates: Requirements 2.10**

### Property 10: Warehouse Required Fields Validation

_For any_ warehouse creation attempt without required fields (warehouse_code, warehouse_name, location), the system should reject the operation.
**Validates: Requirements 3.2**

### Property 11: Bonded Warehouse License Validation

_For any_ warehouse where is_bonded = true, license_number and license_expiry must be present.
**Validates: Requirements 3.5**

### Property 12: Warehouse License Expiry Alert

_For any_ bonded warehouse where license_expiry is within 30 days, an alert should be generated.
**Validates: Requirements 3.6**

### Property 13: Inbound BC Document Reference Validation

_For any_ inbound transaction, it must reference an existing and valid BC document.
**Validates: Requirements 6.1, 10.1**

### Property 14: Inbound HS Code and Unit Validation

_For any_ inbound detail, the HS code and unit must match the referenced BC document.
**Validates: Requirements 6.2**

### Property 15: Stock Increase on Inbound

_For any_ completed inbound transaction, stock_balance in the specified warehouse should increase by the inbound quantity.
**Validates: Requirements 6.3**

### Property 16: Inbound Data Completeness

_For any_ inbound transaction, all required fields (supplier, inbound_date, received_by) must be captured.
**Validates: Requirements 6.4**

### Property 17: Inbound Detail Data Completeness

_For any_ inbound detail, batch_number, manufacturing_date, and expiry_date should be captured when applicable.
**Validates: Requirements 6.6**

### Property 18: Quarantine Warehouse Assignment

_For any_ inbound with quality_status = QUARANTINE, the warehouse_id should be a quarantine warehouse.
**Validates: Requirements 6.8**

### Property 19: Inbound Audit Trail Logging

_For any_ inbound transaction, there should be a corresponding audit log entry.
**Validates: Requirements 6.10**

### Property 20: Real-Time Stock Balance Update

_For any_ transaction (inbound, outbound, production, mutation), stock_balance should be updated immediately.
**Validates: Requirements 7.2**

### Property 21: Expiring Items Detection

_For any_ item where expiry_date is within the threshold (e.g., 30 days), it should appear in the expiring items list.
**Validates: Requirements 7.7**

### Property 22: Stock Mutation Required Fields Validation

_For any_ stock mutation, item, warehouse_from, warehouse_to, qty, and reason must be provided.
**Validates: Requirements 8.2**

### Property 23: Stock Mutation Sufficient Stock Validation

_For any_ stock mutation, qty_balance in warehouse_from must be >= qty.
**Validates: Requirements 8.3**

### Property 24: Stock Mutation Balance Update

_For any_ completed stock mutation, stock should decrease in warehouse_from and increase in warehouse_to by the same amount.
**Validates: Requirements 8.4**

### Property 25: Stock Mutation Same Warehouse Prevention

_For any_ stock mutation attempt, warehouse_from must not equal warehouse_to.
**Validates: Requirements 8.5**

### Property 26: Stock Mutation Audit Trail Logging

_For any_ stock mutation, there should be an audit log entry with the reason.
**Validates: Requirements 8.6**

### Property 27: Production Order Required Fields Validation

_For any_ production order creation, production_no, production_date, fg_item_id, and fg_qty must be provided.
**Validates: Requirements 9.2**

### Property 28: Production Stock Update

_For any_ completed production order, raw material stock should decrease and finished goods stock should increase.
**Validates: Requirements 9.4**

### Property 29: Production Traceability Link Creation

_For any_ completed production order, there should be production_materials records linking raw materials to the finished good.
**Validates: Requirements 9.5**

### Property 30: Finished Goods Production Requirement

_For any_ finished good item in stock, there must be a corresponding production_order record.
**Validates: Requirements 9.6**

### Property 31: Production Data Completeness

_For any_ production order, shift, line_number, supervisor, and operator should be recorded.
**Validates: Requirements 9.7**

### Property 32: Production Yield Calculation

_For any_ production order, yield_percentage should be calculated as (fg_qty / total_raw_qty) \* 100.
**Validates: Requirements 9.8**

### Property 33: Production Scrap Reason Requirement

_For any_ production order where scrap_qty > 0, scrap_reason must be present.
**Validates: Requirements 9.9**

### Property 34: Production Audit Trail Logging

_For any_ production transaction, there should be an audit log entry.
**Validates: Requirements 9.11**

### Property 35: Outbound Stock Decrease

_For any_ completed outbound transaction, stock_balance in the specified warehouse should decrease by the outbound quantity.
**Validates: Requirements 10.3**

### Property 36: Outbound Sufficient Stock Validation

_For any_ outbound transaction, qty_balance in the warehouse must be >= qty.
**Validates: Requirements 10.4**

### Property 37: Outbound Data Completeness

_For any_ outbound transaction, customer, destination, outbound_date must be recorded.
**Validates: Requirements 10.5**

### Property 38: Outbound Audit Trail Logging

_For any_ outbound transaction, there should be an audit log entry.
**Validates: Requirements 10.9**

### Property 39: Stock Opname Required Fields Validation

_For any_ stock opname creation, opname_date and warehouse_id must be provided.
**Validates: Requirements 11.2**

### Property 40: Stock Opname Difference Calculation

_For any_ stock opname detail, difference should be calculated as qty_physical - qty_system.
**Validates: Requirements 11.4**

### Property 41: Stock Opname Adjustment Reason Requirement

_For any_ stock opname detail where difference != 0, reason must be present.
**Validates: Requirements 11.5**

### Property 42: Stock Opname Balance Adjustment

_For any_ approved stock opname, stock_balance should be updated to match qty_physical.
**Validates: Requirements 11.7**

### Property 43: Stock Opname Audit Trail Logging

_For any_ stock opname adjustment, there should be an audit log entry with reason.
**Validates: Requirements 11.8**

### Property 44: Stock Opname Approval Requirement

_For any_ stock opname, stock_balance should not change until the opname is approved.
**Validates: Requirements 11.10**

### Property 45: Audit Log Creation for All Changes

_For any_ data change (INSERT, UPDATE, DELETE), there should be a corresponding audit log entry.
**Validates: Requirements 12.1**

### Property 46: Audit Log Data Completeness

_For any_ audit log entry, user_id, action, table_name, record_id, old_data, new_data, and timestamp must be recorded.
**Validates: Requirements 12.2**

### Property 47: Audit Log Immutability

_For any_ audit log record, UPDATE and DELETE operations should be prevented.
**Validates: Requirements 12.4**

### Property 48: Traceability Link Maintenance

_For any_ finished good, there should be production_materials records linking to the raw materials used.
**Validates: Requirements 13.1**

### Property 49: Forward Traceability - FG to Raw Materials

_For any_ finished good, we can retrieve all raw materials used in its production.
**Validates: Requirements 13.2**

### Property 50: Backward Traceability - Raw Material to FG

_For any_ raw material, we can retrieve all finished goods it was used to produce.
**Validates: Requirements 13.3**

### Property 51: End-to-End Forward Traceability

_For any_ raw material, we can trace through production to finished goods and then to outbound transactions.
**Validates: Requirements 13.4**

### Property 52: End-to-End Backward Traceability

_For any_ outbound transaction, we can trace back through finished goods to the raw materials used.
**Validates: Requirements 13.5**

### Property 53: Traceability Data Completeness

_For any_ traceability chain, dates, quantities, batch numbers, and document references should be included.
**Validates: Requirements 13.6**

---

## Error Handling

### Error Categories

#### 1. Validation Errors

- **HTTP Status**: 400 Bad Request
- **Examples**: Missing required fields, invalid format, constraint violations
- **Handling**: Display user-friendly error messages with field-specific details

#### 2. Authentication Errors

- **HTTP Status**: 401 Unauthorized
- **Examples**: Invalid credentials, expired token
- **Handling**: Redirect to login page, clear session

#### 3. Authorization Errors

- **HTTP Status**: 403 Forbidden
- **Examples**: Insufficient permissions, role mismatch
- **Handling**: Display "Access Denied" message, log attempt

#### 4. Not Found Errors

- **HTTP Status**: 404 Not Found
- **Examples**: Resource doesn't exist, invalid ID
- **Handling**: Display "Resource not found" message, suggest alternatives

#### 5. Conflict Errors

- **HTTP Status**: 409 Conflict
- **Examples**: Duplicate key, concurrent modification
- **Handling**: Display conflict details, offer resolution options

#### 6. Business Logic Errors

- **HTTP Status**: 422 Unprocessable Entity
- **Examples**: Insufficient stock, invalid state transition
- **Handling**: Display business rule violation message with context

#### 7. Integration Errors

- **HTTP Status**: 502 Bad Gateway / 503 Service Unavailable
- **Examples**: IT Inventory API down, CEISA timeout
- **Handling**: Queue for retry, notify admin, display user-friendly message

#### 8. Server Errors

- **HTTP Status**: 500 Internal Server Error
- **Examples**: Unexpected exceptions, database errors
- **Handling**: Log error details, display generic error message, notify admin

### Error Handling Strategy

#### Frontend Error Handling

```typescript
// HTTP Interceptor for Global Error Handling
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = error.error.message;
        } else {
          // Server-side error
          switch (error.status) {
            case 400:
              errorMessage = this.handleValidationError(error);
              break;
            case 401:
              this.handleAuthError();
              break;
            case 403:
              errorMessage = 'Access denied';
              break;
            case 404:
              errorMessage = 'Resource not found';
              break;
            case 409:
              errorMessage = this.handleConflictError(error);
              break;
            case 422:
              errorMessage = this.handleBusinessLogicError(error);
              break;
            case 502:
            case 503:
              errorMessage = 'Service temporarily unavailable';
              break;
            default:
              errorMessage = 'An unexpected error occurred';
          }
        }

        this.notificationService.error(errorMessage);
        return throwError(() => error);
      })
    );
  }
}
```

#### Demo Mode Error Handling

```typescript
// Demo Service Error Simulation
export class InventoryDemoService extends DataProvider<Item> {
  create(item: Item): Observable<Item> {
    // Validate required fields
    if (!item.item_code || !item.item_name || !item.hs_code) {
      return throwError(() => ({
        status: 400,
        error: { message: 'Missing required fields' },
      }));
    }

    // Check for duplicates
    const items = this.localStorage.getItem<Item[]>(this.storageKey) || [];
    if (items.some((i) => i.item_code === item.item_code)) {
      return throwError(() => ({
        status: 409,
        error: { message: 'Item code already exists' },
      }));
    }

    // Simulate success
    const newItem = { ...item, id: Date.now().toString() };
    items.push(newItem);
    this.localStorage.setItem(this.storageKey, items);
    return of(newItem).pipe(delay(300));
  }
}
```

### Retry Strategy for Integration Errors

```typescript
export class CustomsIntegrationService {
  syncToITInventory(transaction: Transaction): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(this.itInventoryUrl, transaction).pipe(
      retry({
        count: 3,
        delay: (error, retryCount) => {
          // Exponential backoff: 1s, 2s, 4s
          return timer(Math.pow(2, retryCount) * 1000);
        },
      }),
      catchError((error) => {
        // Queue for manual retry
        this.queueFailedSync(transaction);
        return throwError(() => error);
      })
    );
  }
}
```

---

## Testing Strategy

### Dual Testing Approach

The system will use both **unit tests** and **property-based tests** to ensure comprehensive coverage:

- **Unit Tests**: Verify specific examples, edge cases, and error conditions
- **Property Tests**: Verify universal properties across all inputs

Both types of tests are complementary and necessary for comprehensive coverage. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across a wide range of inputs.

### Unit Testing

#### Framework

- **Jasmine** for test framework
- **Karma** for test runner
- **Angular Testing Utilities** for component testing

#### Unit Test Focus Areas

1. **Specific Examples**: Test concrete scenarios with known inputs and outputs
2. **Edge Cases**: Test boundary conditions (empty arrays, null values, max values)
3. **Error Conditions**: Test error handling and validation
4. **Integration Points**: Test component interactions and service integrations

#### Example Unit Tests

```typescript
describe('InventoryDemoService', () => {
  let service: InventoryDemoService;
  let localStorage: LocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InventoryDemoService, LocalStorageService],
    });
    service = TestBed.inject(InventoryDemoService);
    localStorage = TestBed.inject(LocalStorageService);
  });

  it('should create an item with valid data', (done) => {
    const item: Item = {
      item_code: 'TEST001',
      item_name: 'Test Item',
      hs_code: '1234567890',
      item_type: ItemType.RAW,
      unit: 'pcs',
      is_hazardous: false,
      facility_status: FacilityStatus.FASILITAS,
      active: true,
    };

    service.create(item).subscribe({
      next: (result) => {
        expect(result.id).toBeDefined();
        expect(result.item_code).toBe('TEST001');
        done();
      },
    });
  });

  it('should reject item creation without required fields', (done) => {
    const invalidItem: Partial<Item> = {
      item_name: 'Test Item',
      // Missing item_code, hs_code, item_type, unit
    };

    service.create(invalidItem as Item).subscribe({
      error: (error) => {
        expect(error.status).toBe(400);
        done();
      },
    });
  });

  it('should reject duplicate item codes', (done) => {
    const item: Item = {
      item_code: 'DUP001',
      item_name: 'Duplicate Item',
      hs_code: '1234567890',
      item_type: ItemType.RAW,
      unit: 'pcs',
      is_hazardous: false,
      facility_status: FacilityStatus.FASILITAS,
      active: true,
    };

    service.create(item).subscribe(() => {
      service.create(item).subscribe({
        error: (error) => {
          expect(error.status).toBe(409);
          done();
        },
      });
    });
  });
});
```

### Property-Based Testing

#### Framework

- **fast-check** for property-based testing in TypeScript

#### Configuration

- **Minimum 100 iterations** per property test (due to randomization)
- Each property test must reference its design document property
- Tag format: `Feature: kek-inventory-traceability, Property {number}: {property_text}`

#### Property Test Focus Areas

1. **Universal Properties**: Test properties that should hold for all valid inputs
2. **Invariants**: Test conditions that should always be true
3. **Round-Trip Properties**: Test operations that should be reversible
4. **Metamorphic Properties**: Test relationships between inputs and outputs

#### Example Property Tests

```typescript
import * as fc from 'fast-check';

describe('Property Tests: Stock Balance', () => {
  let service: StockBalanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StockBalanceService, LocalStorageService],
    });
    service = TestBed.inject(StockBalanceService);
  });

  /**
   * Feature: kek-inventory-traceability
   * Property 15: Stock Increase on Inbound
   * Validates: Requirements 6.3
   */
  it('should increase stock balance by inbound quantity for any valid inbound', () => {
    fc.assert(
      fc.asyncProperty(
        fc.record({
          item_id: fc.uuid(),
          warehouse_id: fc.uuid(),
          qty: fc.integer({ min: 1, max: 1000 }),
        }),
        async (inbound) => {
          // Get initial balance
          const initialBalance = await service
            .getBalance(inbound.item_id, inbound.warehouse_id)
            .toPromise();

          // Process inbound
          await service.processInbound(inbound).toPromise();

          // Get final balance
          const finalBalance = await service
            .getBalance(inbound.item_id, inbound.warehouse_id)
            .toPromise();

          // Assert: final balance = initial balance + inbound qty
          expect(finalBalance).toBe((initialBalance || 0) + inbound.qty);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: kek-inventory-traceability
   * Property 24: Stock Mutation Balance Update
   * Validates: Requirements 8.4
   */
  it('should maintain total stock across warehouses after mutation', () => {
    fc.assert(
      fc.asyncProperty(
        fc
          .record({
            item_id: fc.uuid(),
            warehouse_from: fc.uuid(),
            warehouse_to: fc.uuid(),
            qty: fc.integer({ min: 1, max: 100 }),
          })
          .filter((m) => m.warehouse_from !== m.warehouse_to),
        async (mutation) => {
          // Setup: ensure source has sufficient stock
          await service
            .setBalance(mutation.item_id, mutation.warehouse_from, mutation.qty + 100)
            .toPromise();

          // Get initial total
          const initialTotal = await service.getTotalStock(mutation.item_id).toPromise();

          // Process mutation
          await service.processMutation(mutation).toPromise();

          // Get final total
          const finalTotal = await service.getTotalStock(mutation.item_id).toPromise();

          // Assert: total stock unchanged
          expect(finalTotal).toBe(initialTotal);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: kek-inventory-traceability
   * Property 28: Production Stock Update
   * Validates: Requirements 9.4
   */
  it('should decrease raw material and increase FG stock for any production', () => {
    fc.assert(
      fc.asyncProperty(
        fc.record({
          production_no: fc.string({ minLength: 5, maxLength: 20 }),
          fg_item_id: fc.uuid(),
          fg_qty: fc.integer({ min: 1, max: 100 }),
          materials: fc.array(
            fc.record({
              raw_item_id: fc.uuid(),
              qty_used: fc.integer({ min: 1, max: 50 }),
            }),
            { minLength: 1, maxLength: 5 }
          ),
        }),
        async (production) => {
          // Setup: ensure raw materials have sufficient stock
          for (const material of production.materials) {
            await service
              .setBalance(material.raw_item_id, 'production-warehouse', material.qty_used + 100)
              .toPromise();
          }

          // Get initial balances
          const initialRawBalances = await Promise.all(
            production.materials.map((m) =>
              service.getBalance(m.raw_item_id, 'production-warehouse').toPromise()
            )
          );
          const initialFgBalance = await service
            .getBalance(production.fg_item_id, 'fg-warehouse')
            .toPromise();

          // Process production
          await service.processProduction(production).toPromise();

          // Get final balances
          const finalRawBalances = await Promise.all(
            production.materials.map((m) =>
              service.getBalance(m.raw_item_id, 'production-warehouse').toPromise()
            )
          );
          const finalFgBalance = await service
            .getBalance(production.fg_item_id, 'fg-warehouse')
            .toPromise();

          // Assert: raw materials decreased
          production.materials.forEach((material, index) => {
            expect(finalRawBalances[index]).toBe(initialRawBalances[index] - material.qty_used);
          });

          // Assert: FG increased
          expect(finalFgBalance).toBe((initialFgBalance || 0) + production.fg_qty);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

#### Focus Areas

1. **Component Integration**: Test interactions between components
2. **Service Integration**: Test service dependencies
3. **State Management**: Test NgRx store, actions, effects, selectors
4. **API Integration**: Test HTTP calls and responses (mocked in tests)

#### Example Integration Test

```typescript
describe('Inbound Process Integration', () => {
  let store: MockStore;
  let service: InboundService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InboundService, provideMockStore({ initialState: {} })],
    });
    store = TestBed.inject(MockStore);
    service = TestBed.inject(InboundService);
  });

  it('should complete full inbound process and update store', (done) => {
    const inbound: InboundHeader = {
      // ... inbound data
    };

    store.dispatch(InboundActions.createInbound({ inbound }));

    store.select(selectInboundStatus).subscribe((status) => {
      if (status === 'COMPLETED') {
        store.select(selectStockBalance).subscribe((balance) => {
          expect(balance).toBeGreaterThan(0);
          done();
        });
      }
    });
  });
});
```

### Test Coverage Goals

- **Unit Test Coverage**: Minimum 80% code coverage
- **Property Test Coverage**: All critical properties (53 properties identified)
- **Integration Test Coverage**: All major user flows
- **E2E Test Coverage**: Critical business processes (inbound, production, outbound)

### Continuous Integration

- Tests run automatically on every commit
- Property tests run with 100 iterations in CI
- Failed tests block merge to main branch
- Coverage reports generated and tracked over time

---

## Deployment Strategy

### Demo Mode Deployment

1. Build application: `npm run build:demo`
2. Deploy static files to web server (Nginx, Apache, or CDN)
3. No backend required - all data stored in browser localStorage
4. Suitable for: demos, training, offline usage

### Production Mode Deployment

1. Build application: `npm run build:prod`
2. Deploy static files to web server
3. Configure API endpoints in environment.prod.ts
4. Setup backend API with database
5. Configure IT Inventory and CEISA integration
6. Setup SSL certificates for HTTPS
7. Configure CORS policies
8. Setup monitoring and logging

### Environment Configuration

```typescript
// environment.prod.ts
export const environment = {
  production: true,
  demoMode: false,
  apiUrl: 'https://api.kek-inventory.com',
  apiTimeout: 30000,
  features: {
    rfidScanner: true,
    customsIntegration: true,
  },
  customs: {
    itInventoryUrl: 'https://it-inventory.beacukai.go.id',
    ceisaUrl: 'https://ceisa.beacukai.go.id',
  },
};
```

---

## Performance Optimization

### Frontend Optimization

1. **Lazy Loading**: Feature modules loaded on-demand
2. **Code Splitting**: Separate bundles for each feature
3. **Tree Shaking**: Remove unused code
4. **AOT Compilation**: Ahead-of-time compilation for faster runtime
5. **Image Optimization**: Compress and lazy-load images
6. **Caching**: Cache API responses and static assets
7. **Virtual Scrolling**: For large lists (PrimeNG VirtualScroller)
8. **Pagination**: Limit data fetched per request (50 items per page)

### State Management Optimization

1. **Memoized Selectors**: Use createSelector for efficient state selection
2. **Entity Adapter**: Use @ngrx/entity for normalized state
3. **OnPush Change Detection**: Optimize component rendering
4. **Immutable Updates**: Prevent unnecessary re-renders

### Network Optimization

1. **HTTP Compression**: Enable gzip/brotli compression
2. **Request Batching**: Combine multiple requests when possible
3. **Debouncing**: Debounce search and filter inputs
4. **Retry Logic**: Automatic retry for failed requests
5. **Offline Support**: Queue operations when offline (production mode)

---

## Security Considerations

### Authentication & Authorization

1. **JWT Tokens**: Secure token-based authentication
2. **Token Refresh**: Automatic token refresh before expiry
3. **Role-Based Access Control**: Enforce permissions at component and route level
4. **Session Timeout**: Automatic logout after inactivity

### Data Security

1. **Input Validation**: Validate all user inputs
2. **Output Sanitization**: Prevent XSS attacks
3. **SQL Injection Prevention**: Use parameterized queries (backend)
4. **CSRF Protection**: Implement CSRF tokens
5. **HTTPS Only**: Enforce HTTPS in production
6. **Secure Headers**: Set security headers (CSP, X-Frame-Options, etc.)

### Audit & Compliance

1. **Audit Trail**: Log all data changes
2. **User Activity Logging**: Track user actions
3. **Data Retention**: Maintain logs for 5 years
4. **Access Logs**: Log all authentication attempts
5. **Compliance Reports**: Generate audit reports for Bea Cukai

---

## Conclusion

This design document provides a comprehensive blueprint for the KEK IT Inventory System. The system is built on modern Angular architecture with standalone components, NgRx state management, and a dual-mode operation (demo and production).

Key design principles include:

- **Traceability First**: Complete tracking from raw materials to finished goods
- **Audit-Ready**: Comprehensive audit trail for compliance
- **Dual-Mode**: Support both demo (localStorage) and production (API) modes
- **Property-Based Testing**: Ensure correctness through formal properties
- **Modern UI**: Clean, minimalist design with Inter font and sky-blue accents

The system is designed to meet all requirements specified in the requirements document, with 53 correctness properties ensuring system behavior is verifiable and testable.
