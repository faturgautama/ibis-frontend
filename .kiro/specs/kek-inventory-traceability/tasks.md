# Implementation Plan: IBIS Inventory Traceability

## Overview

Implementasi sistem IBIS (Integrated Bonded Inventory System) menggunakan Angular 20 dengan standalone components, NgRx untuk state management, PrimeNG untuk UI components, dan TailwindCSS untuk styling. Sistem akan mendukung dual-mode operation (demo mode dengan localStorage dan production mode dengan API backend) serta advanced features untuk enterprise usage.

## Styling Guidelines

**IMPORTANT**: Untuk semua komponen baru (Task 3 dan seterusnya):

- **Gunakan Tailwind CSS inline styling** di template HTML
- **JANGAN buat file .scss terpisah** untuk komponen baru
- Gunakan utility classes Tailwind untuk semua styling needs
- Hanya gunakan component SCSS jika benar-benar diperlukan untuk styling yang sangat kompleks atau custom
- Komponen yang sudah ada (auth/login) tetap menggunakan SCSS yang sudah ada

**Contoh Styling Approach:**

```html
<!-- ✅ GOOD: Tailwind inline -->
<div class="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 class="text-xl font-semibold text-gray-900">Title</h2>
  <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Action</button>
</div>

<!-- ❌ AVOID: Separate SCSS file -->
<div class="custom-container">
  <h2 class="custom-title">Title</h2>
  <button class="custom-button">Action</button>
</div>
```

## Tasks

- [x] 1. Setup Core Infrastructure

  - Setup core services (LocalStorageService, DataProvider abstract class)
  - Setup error handling (HTTP interceptor, error service)
  - Setup notification service using PrimeNG Toast
  - Configure environment files for demo and production modes
  - Setup HTTP client with interceptors
  - _Requirements: 20.1, 20.2, 20.3_

- [x] 2. Implement Authentication Module

  - [x] 2.1 Create auth models and interfaces (User, LoginCredentials, AuthResponse)

    - Define UserRole enum (admin, warehouse, production, audit)
    - Create authentication-related TypeScript interfaces
    - _Requirements: 1.3_

  - [x] 2.2 Implement AuthService with demo and production mode support

    - Implement login/logout functionality
    - Implement JWT token handling for production mode
    - Implement localStorage session for demo mode
    - Implement role-based authorization checks
    - Implement token refresh mechanism
    - Implement session timeout handling
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 1.6, 1.7_

  - [x] 2.3 Write property tests for authentication

    - **Property 1: Authentication Success for Valid Credentials**
    - **Property 2: Authentication Failure for Invalid Credentials**
    - **Property 3: Role-Based Feature Access**
    - **Validates: Requirements 1.1, 1.2, 1.4**

  - [x] 2.4 Create auth components (login page, auth layout)

    - Create login form component with validation
    - Create auth layout component
    - Implement auth guard for route protection
    - _Requirements: 1.1, 1.2_

  - [x] 2.5 Write unit tests for auth components
    - Test login form validation
    - Test auth guard behavior
    - Test token refresh mechanism
    - _Requirements: 1.1, 1.2, 1.5_

- [x] 3. Implement Master Data - Items Module

  - [x] 3.1 Create item models and enums

    - Define Item interface with all required fields
    - Define ItemType enum (RAW, WIP, FG, ASSET)
    - Define FacilityStatus enum (FASILITAS, NON)
    - _Requirements: 2.2, 2.4_

  - [x] 3.2 Implement InventoryDemoService

    - Implement CRUD operations using localStorage
    - Implement data validation (HS Code format, required fields)
    - Implement getLowStockItems() method
    - Implement getExpiringItems() method
    - Initialize demo data on first load
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [x] 3.3 Implement InventoryApiService (Production Mode)

    - Implement CRUD operations with HTTP client
    - Implement error handling and retry logic
    - Implement caching strategy
    - Implement getLowStockItems() API call
    - Implement getExpiringItems() API call
    - _Requirements: 2.1, 2.5, 14.2, 14.3_

  - [x] 3.4 Write property tests for item operations

    - **Property 4: Item CRUD Operations**
    - **Property 5: Item Required Fields Validation**
    - **Property 6: HS Code Format Validation**
    - **Property 7: Low Stock Alert Generation**
    - **Property 8: Hazardous Item Warning Display**
    - **Property 9: Item Deletion Prevention with History**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.5, 2.9, 2.10**

  - [x] 3.5 Setup NgRx store for inventory

    - Create inventory state interface
    - Create inventory actions (load, create, update, delete)
    - Create inventory effects for async operations
    - Create inventory selectors (selectAllItems, selectLowStockItems)
    - _Requirements: 2.1_

  - [x] 3.6 Create item list component

    - Create data table with PrimeNG Table
    - **Use Tailwind CSS inline styling** (no separate .scss file)
    - Implement pagination (50 items per page)
    - Implement filtering and search
    - Add action buttons (create, edit, delete)
    - Display hazardous warning indicators
    - Implement RFID scanner integration (production mode)
    - _Requirements: 2.1, 2.9, 7.8, 23.3_

  - [x] 3.7 Create item form component

    - Create form with all item fields
    - **Use Tailwind CSS inline styling** (no separate .scss file)
    - Implement form validation
    - Implement HS Code format validation
    - Add image upload functionality
    - Add RFID tag input
    - Implement barcode scanner integration
    - _Requirements: 2.2, 2.3, 2.7, 2.8_

  - [x] 3.8 Write unit tests for item components
    - Test item list rendering
    - Test item form validation
    - Test CRUD operations
    - Test RFID integration
    - _Requirements: 2.1, 2.2, 7.8_

- [ ] 4. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement Master Data - Warehouses Module

  - [x] 5.1 Create warehouse models and enums

    - Define Warehouse interface
    - Define WarehouseType enum (RAW_MATERIAL, WIP, FINISHED_GOODS, QUARANTINE)
    - _Requirements: 3.2, 3.3_

  - [x] 5.2 Implement WarehouseDemoService

    - Implement CRUD operations using localStorage
    - Implement validation for bonded warehouse license
    - Implement license expiry alert logic
    - _Requirements: 3.1, 3.5, 3.6_

  - [x] 5.3 Implement WarehouseApiService (Production Mode)

    - Implement CRUD operations with HTTP client
    - Implement capacity tracking
    - Implement utilization calculation
    - _Requirements: 3.1, 3.4_

  - [x]\* 5.4 Write property tests for warehouse operations

    - **Property 10: Warehouse Required Fields Validation**
    - **Property 11: Bonded Warehouse License Validation**
    - **Property 12: Warehouse License Expiry Alert**
    - **Validates: Requirements 3.2, 3.5, 3.6**

  - [x] 5.5 Create warehouse list and form components

    - Create warehouse list with data table
    - **Use Tailwind CSS inline styling** (no separate .scss file)
    - Create warehouse form with validation
    - Display license expiry alerts
    - Display capacity and utilization metrics
    - _Requirements: 3.1, 3.2, 3.4, 3.6_

  - [x]\* 5.6 Write unit tests for warehouse components
    - Test warehouse form validation
    - Test license expiry alerts
    - Test capacity calculations
    - _Requirements: 3.2, 3.4, 3.6_

- [ ] 6. Implement Master Data - Suppliers & Customers Module

  - [ ] 6.1 Create supplier and customer models

    - Define Supplier and Customer interfaces
    - _Requirements: 4.1, 4.2_

  - [ ] 6.2 Implement SupplierDemoService and CustomerDemoService

    - Implement CRUD operations
    - Implement NPWP validation
    - Implement active/inactive status
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ] 6.3 Implement SupplierApiService and CustomerApiService (Production Mode)

    - Implement CRUD operations with HTTP client
    - Implement search and filtering
    - _Requirements: 4.1, 4.2_

  - [ ] 6.4 Create supplier and customer list/form components

    - Create list components with data tables
    - **Use Tailwind CSS inline styling** (no separate .scss file)
    - Create form components with validation
    - Implement NPWP validation UI
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]\* 6.5 Write unit tests for supplier/customer components
    - Test NPWP validation
    - Test active/inactive toggle
    - _Requirements: 4.3, 4.4_

- [ ] 7. Implement Customs Document Management

  - [ ] 7.1 Create BC document models and enums

    - Define BCDocument interface
    - Define BCDocType enum (BC23, BC25, BC30, BC40, BC27)
    - Define BCDocStatus enum (DRAFT, SUBMITTED, APPROVED, REJECTED)
    - _Requirements: 5.2, 5.3_

  - [ ] 7.2 Implement BCDocumentDemoService

    - Implement CRUD operations
    - Implement document status workflow
    - Implement file attachment handling
    - Implement document approval logic
    - _Requirements: 5.1, 5.5, 5.6, 5.7_

  - [ ] 7.3 Implement BCDocumentApiService (Production Mode)

    - Implement CRUD operations with HTTP client
    - Implement document upload to server
    - Implement CEISA integration for document submission
    - _Requirements: 5.1, 5.4, 15.1, 15.2_

  - [ ] 7.4 Create BC document list and form components

    - Create document list with status indicators
    - Create document form with file upload
    - Implement status workflow UI
    - Implement CEISA submission UI
    - _Requirements: 5.1, 5.4, 5.5, 15.2_

  - [ ]\* 7.5 Write unit tests for BC document components
    - Test document workflow
    - Test file upload
    - Test CEISA integration
    - _Requirements: 5.5, 5.7, 15.2_

- [ ] 8. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement Stock Balance Management

  - [ ] 9.1 Create stock balance models

    - Define StockBalance interface
    - Define StockHistory interface
    - _Requirements: 7.1, 7.3_

  - [ ] 9.2 Implement StockBalanceService

    - Implement getBalance() method
    - Implement updateBalance() method
    - Implement real-time balance updates
    - Implement stock history tracking
    - Implement RFID-based tracking (production mode)
    - _Requirements: 7.1, 7.2, 7.3, 7.8_

  - [ ]\* 9.3 Write property tests for stock balance

    - **Property 20: Real-Time Stock Balance Update**
    - **Property 21: Expiring Items Detection**
    - **Validates: Requirements 7.2, 7.7**

  - [ ] 9.4 Create stock balance view component

    - Create stock balance table with filters
    - Display low stock alerts
    - Display expiring items
    - Show stock aging report
    - Implement RFID scanner integration
    - _Requirements: 7.1, 7.4, 7.5, 7.6, 7.7, 7.8_

  - [ ]\* 9.5 Write unit tests for stock balance components
    - Test balance calculations
    - Test alert generation
    - Test RFID integration
    - _Requirements: 7.2, 7.4, 7.8_

- [ ] 10. Implement Inbound Process

  - [ ] 10.1 Create inbound models and enums

    - Define InboundHeader interface
    - Define InboundDetail interface
    - Define InboundStatus enum (PENDING, RECEIVED, QUALITY_CHECK, COMPLETED)
    - Define QualityStatus enum (PASS, FAIL, QUARANTINE)
    - _Requirements: 6.4, 6.7_

  - [ ] 10.2 Implement InboundDemoService

    - Implement createInbound() with BC document validation
    - Implement HS Code and unit validation
    - Implement stock balance update on inbound
    - Implement quality inspection logic
    - Implement quarantine warehouse assignment
    - _Requirements: 6.1, 6.2, 6.3, 6.6, 6.8_

  - [ ] 10.3 Implement InboundApiService (Production Mode)

    - Implement createInbound() with API
    - Implement IT Inventory sync on inbound
    - Implement real-time sync status tracking
    - Implement retry mechanism for failed syncs
    - _Requirements: 6.1, 6.3, 14.1, 14.2, 14.6_

  - [ ]\* 10.4 Write property tests for inbound operations

    - **Property 13: Inbound BC Document Reference Validation**
    - **Property 14: Inbound HS Code and Unit Validation**
    - **Property 15: Stock Increase on Inbound**
    - **Property 16: Inbound Data Completeness**
    - **Property 17: Inbound Detail Data Completeness**
    - **Property 18: Quarantine Warehouse Assignment**
    - **Property 19: Inbound Audit Trail Logging**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.6, 6.8, 6.10**

  - [ ] 10.5 Create inbound header and detail components

    - Create inbound list with status indicators
    - Create inbound form with BC document selection
    - Create inbound detail form with quality status
    - Implement receipt document generation
    - Display IT Inventory sync status
    - _Requirements: 6.4, 6.5, 6.7, 6.9, 14.8_

  - [ ]\* 10.6 Write unit tests for inbound components
    - Test inbound form validation
    - Test quality status workflow
    - Test IT Inventory sync UI
    - _Requirements: 6.1, 6.7, 14.8_

- [ ] 11. Implement Stock Mutation (Transfer)

  - [ ] 11.1 Create stock mutation models

    - Define StockMutation interface
    - _Requirements: 8.2_

  - [ ] 11.2 Implement StockMutationService

    - Implement createMutation() with validation
    - Implement sufficient stock validation
    - Implement balance update for both warehouses
    - Implement same warehouse prevention
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ]\* 11.3 Write property tests for stock mutation

    - **Property 22: Stock Mutation Required Fields Validation**
    - **Property 23: Stock Mutation Sufficient Stock Validation**
    - **Property 24: Stock Mutation Balance Update**
    - **Property 25: Stock Mutation Same Warehouse Prevention**
    - **Property 26: Stock Mutation Audit Trail Logging**
    - **Validates: Requirements 8.2, 8.3, 8.4, 8.5, 8.6**

  - [ ] 11.4 Create stock mutation form component

    - Create mutation form with warehouse selection
    - Implement stock availability check
    - Add reason field
    - _Requirements: 8.1, 8.2, 8.6_

  - [ ]\* 11.5 Write unit tests for stock mutation components
    - Test mutation form validation
    - Test stock availability checks
    - _Requirements: 8.2, 8.3_

- [ ] 12. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Implement Production Process

  - [ ] 13.1 Create production models and enums

    - Define ProductionOrder interface
    - Define ProductionMaterial interface
    - Define WOStatus enum (PLANNED, IN_PROGRESS, COMPLETED, CANCELLED)
    - _Requirements: 9.2, 9.10_

  - [ ] 13.2 Implement ProductionDemoService

    - Implement createWorkOrder() with validation
    - Implement material consumption tracking
    - Implement stock balance updates (decrease RM, increase FG)
    - Implement traceability link creation
    - Implement yield calculation
    - Implement scrap tracking
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.8, 9.9_

  - [ ] 13.3 Implement ProductionApiService (Production Mode)

    - Implement createWorkOrder() with API
    - Implement IT Inventory sync for production data
    - Implement batch production support
    - _Requirements: 9.1, 9.4, 14.1, 14.4_

  - [ ]\* 13.4 Write property tests for production operations

    - **Property 27: Production Order Required Fields Validation**
    - **Property 28: Production Stock Update**
    - **Property 29: Production Traceability Link Creation**
    - **Property 30: Finished Goods Production Requirement**
    - **Property 31: Production Data Completeness**
    - **Property 32: Production Yield Calculation**
    - **Property 33: Production Scrap Reason Requirement**
    - **Property 34: Production Audit Trail Logging**
    - **Validates: Requirements 9.2, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.11**

  - [ ] 13.5 Create production order components

    - Create work order list with status
    - Create work order form with material selection
    - Implement yield and scrap tracking UI
    - Display IT Inventory sync status
    - _Requirements: 9.1, 9.2, 9.7, 9.8, 9.9, 9.10, 14.8_

  - [ ]\* 13.6 Write unit tests for production components
    - Test work order form validation
    - Test material selection
    - Test yield calculation display
    - Test IT Inventory sync
    - _Requirements: 9.2, 9.8, 14.4_

- [ ] 14. Implement Outbound Process

  - [ ] 14.1 Create outbound models and enums

    - Define OutboundHeader interface
    - Define OutboundDetail interface
    - Define OutboundStatus enum (PENDING, PREPARED, SHIPPED, DELIVERED)
    - Define OutboundType enum (EXPORT, LOCAL, RETURN, SAMPLE)
    - _Requirements: 10.2, 10.7_

  - [ ] 14.2 Implement OutboundDemoService

    - Implement createOutbound() with BC document validation
    - Implement stock decrease on outbound
    - Implement sufficient stock validation
    - Implement outbound status workflow
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.7, 10.10_

  - [ ] 14.3 Implement OutboundApiService (Production Mode)

    - Implement createOutbound() with API
    - Implement IT Inventory sync on outbound
    - Implement real-time sync status tracking
    - _Requirements: 10.1, 10.3, 14.1, 14.3_

  - [ ]\* 14.4 Write property tests for outbound operations

    - **Property 35: Outbound Stock Decrease**
    - **Property 36: Outbound Sufficient Stock Validation**
    - **Property 37: Outbound Data Completeness**
    - **Property 38: Outbound Audit Trail Logging**
    - **Validates: Requirements 10.3, 10.4, 10.5, 10.9**

  - [ ] 14.5 Create outbound components

    - Create outbound list with status
    - Create outbound form with BC document selection
    - Implement delivery document generation
    - Display IT Inventory sync status
    - _Requirements: 10.1, 10.5, 10.6, 10.8, 14.8_

  - [ ] 14.6 Write unit tests for outbound components
    - Test outbound form validation
    - Test stock validation
    - Test IT Inventory sync UI
    - _Requirements: 10.1, 10.4, 14.3_

- [ ] 15. Implement Stock Opname & Adjustment

  - [ ] 15.1 Create stock opname models and enums

    - Define StockOpname interface
    - Define StockOpnameDetail interface
    - Define OpnameType enum (PERIODIC, SPOT_CHECK, YEAR_END)
    - _Requirements: 11.2, 11.6_

  - [ ] 15.2 Implement StockOpnameService

    - Implement createOpname() with validation
    - Implement difference calculation
    - Implement adjustment with approval
    - Implement reason requirement for differences
    - _Requirements: 11.1, 11.2, 11.4, 11.5, 11.7, 11.10_

  - [ ]\* 15.3 Write property tests for stock opname

    - **Property 39: Stock Opname Required Fields Validation**
    - **Property 40: Stock Opname Difference Calculation**
    - **Property 41: Stock Opname Adjustment Reason Requirement**
    - **Property 42: Stock Opname Balance Adjustment**
    - **Property 43: Stock Opname Audit Trail Logging**
    - **Property 44: Stock Opname Approval Requirement**
    - **Validates: Requirements 11.2, 11.4, 11.5, 11.7, 11.8, 11.10**

  - [ ] 15.4 Create stock opname components

    - Create opname session list
    - Create opname form with physical count input
    - Display difference calculation
    - Implement approval workflow UI
    - Generate opname report
    - _Requirements: 11.1, 11.2, 11.3, 11.9_

  - [ ]\* 15.5 Write unit tests for stock opname components
    - Test opname form validation
    - Test difference calculations
    - Test approval workflow
    - _Requirements: 11.2, 11.4, 11.10_

- [ ] 16. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Implement Audit Trail System

  - [ ] 17.1 Create audit log models and enums

    - Define AuditLog interface
    - Define AuditAction enum (INSERT, UPDATE, DELETE)
    - _Requirements: 12.1, 12.2_

  - [ ] 17.2 Implement AuditLogService

    - Implement logChange() method
    - Implement JSON serialization for old/new data
    - Implement audit log query with filters
    - Implement export functionality
    - _Requirements: 12.1, 12.2, 12.3, 12.5, 12.7_

  - [ ]\* 17.3 Write property tests for audit trail

    - **Property 45: Audit Log Creation for All Changes**
    - **Property 46: Audit Log Data Completeness**
    - **Property 47: Audit Log Immutability**
    - **Validates: Requirements 12.1, 12.2, 12.4**

  - [ ] 17.4 Create audit trail view component

    - Create audit log table with filters
    - Display old/new data comparison
    - Implement date range filtering
    - Implement export to Excel/PDF
    - _Requirements: 12.5, 12.6, 12.7_

  - [ ]\* 17.5 Write unit tests for audit trail components
    - Test audit log filtering
    - Test data comparison display
    - Test export functionality
    - _Requirements: 12.5, 12.7_

- [ ] 18. Implement Traceability System

  - [ ] 18.1 Implement TraceabilityService

    - Implement traceForward() method (BB → FG → Outbound)
    - Implement traceBackward() method (Outbound → FG → BB)
    - Implement getProductionHistory() method
    - Implement getRawMaterialUsage() method
    - Implement RFID-based traceability (production mode)
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.7_

  - [ ]\* 18.2 Write property tests for traceability

    - **Property 48: Traceability Link Maintenance**
    - **Property 49: Forward Traceability - FG to Raw Materials**
    - **Property 50: Backward Traceability - Raw Material to FG**
    - **Property 51: End-to-End Forward Traceability**
    - **Property 52: End-to-End Backward Traceability**
    - **Property 53: Traceability Data Completeness**
    - **Validates: Requirements 13.1, 13.2, 13.3, 13.4, 13.5, 13.6**

  - [ ] 18.3 Create traceability view component

    - Create traceability chain visualization
    - Implement forward/backward trace UI
    - Display dates, quantities, batch numbers, documents
    - Generate traceability reports
    - Implement RFID scanner integration
    - _Requirements: 13.1, 13.2, 13.3, 13.6, 13.7, 13.8_

  - [ ]\* 18.4 Write unit tests for traceability components
    - Test traceability chain display
    - Test forward/backward navigation
    - Test RFID integration
    - _Requirements: 13.1, 13.7_

- [ ] 19. Implement Customs Integration (IT Inventory & CEISA)

  - [ ] 19.1 Create customs integration models

    - Define SyncResponse interface
    - Define CEISAResponse interface
    - Define CEISAStatus interface
    - Define SyncQueue interface
    - _Requirements: 14.1, 14.7, 15.3_

  - [ ] 19.2 Implement CustomsIntegrationService

    - Implement syncToITInventory() method
    - Implement submitToCEISA() method
    - Implement checkCEISAStatus() method
    - Implement retryFailedSync() method
    - Implement queue management for offline syncs
    - Implement exponential backoff retry strategy
    - _Requirements: 14.1, 14.2, 14.3, 14.6, 14.9, 15.1, 15.2_

  - [ ] 19.3 Create customs integration UI components

    - Create sync status dashboard
    - Create manual retry interface
    - Create CEISA submission form
    - Display sync queue and failed syncs
    - _Requirements: 14.8, 14.9, 15.2, 15.6_

  - [ ]\* 19.4 Write unit tests for customs integration
    - Test IT Inventory sync
    - Test CEISA submission
    - Test retry mechanism
    - Test queue management
    - _Requirements: 14.2, 14.3, 14.6, 15.2_

- [ ] 20. Implement Dashboard & Analytics

  - [ ] 20.1 Create dashboard service

    - Implement getDashboardMetrics() method
    - Implement getStockMovementTrends() method
    - Implement getWarehouseUtilization() method
    - Implement getProductionEfficiency() method
    - _Requirements: 16.1, 16.2, 16.3, 16.6_

  - [ ] 20.2 Create dashboard component

    - Display total stock value
    - Display inbound/outbound summary
    - Display low stock alerts
    - Display stock movement trends charts (Chart.js/PrimeNG Charts)
    - Display warehouse utilization
    - Display pending transactions
    - Display recent activities timeline
    - Display production efficiency metrics
    - Display customs document status
    - Implement auto-refresh every 5 minutes
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7, 16.8, 16.9_

  - [ ]\* 20.3 Write unit tests for dashboard components
    - Test metrics calculations
    - Test chart rendering
    - Test auto-refresh
    - _Requirements: 16.1, 16.9_

- [ ] 21. Implement Reporting Module

  - [ ] 21.1 Create report service

    - Implement generateInventoryBalanceReport()
    - Implement generateStockMovementReport()
    - Implement generateInboundOutboundReport()
    - Implement generateProductionReport()
    - Implement generateTraceabilityReport()
    - Implement generateCustomsDocumentReport()
    - Implement generateAuditTrailReport()
    - Implement export to Excel (using ExcelJS)
    - Implement export to PDF (using jsPDF)
    - Implement scheduled report generation
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7, 17.8, 17.10_

  - [ ] 21.2 Create report components

    - Create report selection UI
    - Create report parameter forms
    - Display report results with data tables
    - Implement export functionality
    - Implement report scheduling UI
    - Display report history
    - _Requirements: 17.1-17.10_

  - [ ]\* 21.3 Write unit tests for reporting module
    - Test report generation
    - Test export functionality
    - Test scheduling
    - _Requirements: 17.8, 17.10_

- [ ] 22. Implement Alerts & Notifications

  - [ ] 22.1 Create alert service

    - Implement alert generation logic
    - Implement alert severity levels (INFO, WARNING, CRITICAL)
    - Implement mark as read functionality
    - Implement email notification service (production mode)
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.8, 18.9_

  - [ ] 22.2 Create notification panel component

    - Display alerts in notification panel
    - Implement alert filtering by severity
    - Implement mark as read UI
    - Display notification badge count
    - Implement sound notifications for critical alerts
    - _Requirements: 18.6, 18.7, 18.8_

  - [ ]\* 22.3 Write unit tests for alerts & notifications
    - Test alert generation
    - Test severity filtering
    - Test email notifications
    - _Requirements: 18.1, 18.8, 18.9_

- [ ] 23. Implement User Management

  - [ ] 23.1 Create user management service

    - Implement CRUD operations for users
    - Implement password complexity validation
    - Implement password change functionality
    - Implement password reset functionality
    - Implement user activity logging
    - _Requirements: 19.1, 19.2, 19.4, 19.5, 19.6, 19.8_

  - [ ] 23.2 Create user management components

    - Create user list component
    - Create user form with role selection
    - Implement password change form
    - Display user activity logs
    - _Requirements: 19.1, 19.2, 19.3, 19.7, 19.8_

  - [ ]\* 23.3 Write unit tests for user management
    - Test password validation
    - Test user CRUD operations
    - Test activity logging
    - _Requirements: 19.4, 19.8_

- [ ] 24. Implement System Configuration

  - [ ] 24.1 Create configuration service

    - Implement configuration CRUD operations
    - Implement validation for configuration changes
    - Implement configuration backup/restore
    - _Requirements: 20.1-20.9_

  - [ ] 24.2 Create configuration components

    - Create company information form
    - Create kawasan type selection (KEK, KB, KITE)
    - Create demo/production mode toggle
    - Create IT Inventory API configuration form
    - Create CEISA API configuration form
    - Create alert threshold configuration
    - Create session timeout configuration
    - Create report template configuration
    - _Requirements: 20.1-20.9_

  - [ ]\* 24.3 Write unit tests for configuration
    - Test configuration validation
    - Test mode switching
    - Test API configuration
    - _Requirements: 20.3, 20.4, 20.5, 20.9_

- [ ] 25. Implement Data Import & Export

  - [ ] 25.1 Create import/export service

    - Implement Excel import for master data (using ExcelJS)
    - Implement data validation on import
    - Implement Excel export for master data
    - Implement Excel export for transaction data
    - Implement bulk operations
    - _Requirements: 21.1, 21.2, 21.4, 21.5, 21.6_

  - [ ] 25.2 Create import/export components

    - Create import form with file upload
    - Display import validation errors
    - Create export UI with data selection
    - Display import/export history
    - _Requirements: 21.1, 21.3, 21.4, 21.7_

  - [ ]\* 25.3 Write unit tests for import/export
    - Test Excel import validation
    - Test export functionality
    - Test bulk operations
    - _Requirements: 21.2, 21.6_

- [ ] 26. Implement Main Layout & Navigation

  - [ ] 26.1 Create main layout component

    - Create sidebar navigation with PrimeNG Menu
    - Create top navigation bar with user menu
    - Implement responsive layout (mobile, tablet, desktop)
    - Implement role-based menu visibility
    - Implement breadcrumb navigation
    - Implement theme switcher (light/dark mode)
    - _Requirements: 1.4, 22.1, 22.2_

  - [ ] 26.2 Create shared UI components

    - Create PageHeaderComponent
    - Create DataTableComponent wrapper
    - Create form field components (input, select, date picker)
    - Create loading indicators and skeletons
    - Create confirmation dialog component
    - Create file upload component
    - _Requirements: 22.1, 22.2, 23.3_

  - [ ]\* 26.3 Write unit tests for layout components
    - Test responsive behavior
    - Test role-based menu
    - Test theme switching
    - _Requirements: 1.4, 22.2_

- [ ] 27. Implement Advanced Features

  - [ ] 27.1 Implement offline support (PWA)

    - Configure service worker
    - Implement offline data caching
    - Implement sync queue for offline operations
    - Display offline indicator
    - _Requirements: 14.6_

  - [ ] 27.2 Implement real-time updates (WebSocket)

    - Setup WebSocket connection
    - Implement real-time stock updates
    - Implement real-time alert notifications
    - Implement real-time sync status updates
    - _Requirements: 7.2, 14.8_

  - [ ] 27.3 Implement advanced search & filtering

    - Implement global search across all modules
    - Implement advanced filter builder
    - Implement saved search/filter presets
    - _Requirements: 7.5_

  - [ ] 27.4 Implement data visualization enhancements

    - Implement interactive charts (Chart.js integration)
    - Implement stock heatmap visualization
    - Implement warehouse capacity visualization
    - Implement production timeline visualization
    - _Requirements: 16.2, 16.3, 16.6_

  - [ ] 27.5 Implement backup & recovery features

    - Implement manual backup trigger
    - Implement scheduled automatic backups
    - Implement backup integrity validation
    - Implement restore from backup
    - Display backup history
    - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5, 25.6, 25.7_

  - [ ]\* 27.6 Write unit tests for advanced features
    - Test offline sync queue
    - Test WebSocket connections
    - Test advanced search
    - Test backup/restore
    - _Requirements: 14.6, 25.2, 25.5_

- [ ] 28. Final Integration & Testing

  - [ ] 28.1 Integrate all modules

    - Wire all components together
    - Setup complete routing with lazy loading
    - Configure NgRx store with all feature states
    - Setup route guards and resolvers
    - _Requirements: All_

  - [ ]\* 28.2 Run comprehensive test suite

    - Run all unit tests
    - Run all property-based tests (100 iterations each)
    - Verify test coverage (minimum 80%)
    - Fix any failing tests
    - _Requirements: All_

  - [ ] 28.3 Performance optimization

    - Implement lazy loading for all feature modules
    - Optimize bundle sizes with code splitting
    - Implement caching strategies (HTTP cache, state cache)
    - Optimize images and assets
    - Implement virtual scrolling for large lists
    - Profile and optimize slow operations
    - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.5_

  - [ ] 28.4 Security hardening

    - Implement input validation across all forms
    - Implement output sanitization
    - Configure security headers (CSP, X-Frame-Options)
    - Implement CSRF protection
    - Audit and fix security vulnerabilities
    - _Requirements: 24.1, 24.3, 24.4, 24.5, 24.6, 24.7_

  - [ ] 28.5 Accessibility improvements

    - Ensure WCAG 2.1 AA compliance
    - Add ARIA labels and roles
    - Test keyboard navigation
    - Test screen reader compatibility
    - _Requirements: 22.1, 22.2_

  - [ ] 28.6 Documentation
    - Create user manual
    - Create API documentation
    - Create deployment guide
    - Create developer documentation
    - Create troubleshooting guide
    - _Requirements: All_

- [ ] 29. Final Checkpoint - Complete System Verification
  - Ensure all tests pass
  - Verify all requirements are met
  - Perform end-to-end testing
  - Verify production mode integration works
  - Verify all advanced features work
  - Ask the user for final review

## Notes

- All tests are now REQUIRED (no optional tasks)
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties with minimum 100 iterations
- Unit tests validate specific examples and edge cases
- Checkpoints ensure incremental validation throughout development
- Both demo mode AND production mode are implemented
- Advanced features include: PWA, WebSocket, offline support, backup/restore, advanced search
- Production mode integration includes: IT Inventory sync, CEISA integration, RFID support
- Focus on comprehensive implementation with full test coverage
- Security, performance, and accessibility are prioritized
- Complete documentation is included

## Implementation Strategy

1. **Phase 1 (Tasks 1-8)**: Core infrastructure and master data management
2. **Phase 2 (Tasks 9-16)**: Transaction processing (inbound, outbound, production, stock opname)
3. **Phase 3 (Tasks 17-19)**: Audit trail, traceability, and customs integration
4. **Phase 4 (Tasks 20-26)**: Dashboard, reporting, alerts, user management, configuration, layout
5. **Phase 5 (Tasks 27-29)**: Advanced features, final integration, testing, and documentation

## Technology Stack

- **Frontend**: Angular 20.3.0 (Standalone Components)
- **State Management**: NgRx 20.1.0
- **UI Library**: PrimeNG 20.4.0
- **Styling**: TailwindCSS 4.1.18
- **Icons**: Lucide Angular
- **Charts**: Chart.js / PrimeNG Charts
- **Excel**: ExcelJS
- **PDF**: jsPDF
- **Testing**: Jasmine, Karma, fast-check (property-based testing)
- **PWA**: Angular Service Worker
- **WebSocket**: Socket.io-client
- **Language**: TypeScript 5.9.2
