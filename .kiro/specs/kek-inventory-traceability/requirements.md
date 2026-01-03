# Requirements Document

## Introduction

Sistem Informasi Inventory Kawasan Ekonomi Khusus (KEK) adalah aplikasi web-based yang dirancang untuk mengelola inventory di kawasan industri kepabeanan dengan integrasi penuh ke sistem Bea Cukai Indonesia (IT Inventory dan CEISA). Sistem ini menyediakan traceability end-to-end dari bahan baku hingga barang jadi, memastikan compliance dengan regulasi kepabeanan, dan menyediakan audit trail lengkap untuk keperluan audit Bea Cukai.

Sistem ini mendukung dua mode operasi:

- **Demo Mode**: Menggunakan localStorage untuk data persistence (tidak memerlukan backend)
- **Production Mode**: Terintegrasi dengan API backend dan sistem Bea Cukai

## Glossary

- **System**: KEK IT Inventory System
- **User**: Pengguna sistem dengan role tertentu (admin, warehouse, production, audit)
- **BC Document**: Dokumen Bea Cukai (BC 2.3, BC 2.5, BC 4.0, dll)
- **HS Code**: Harmonized System Code - kode klasifikasi barang internasional
- **Inbound**: Proses pemasukan barang ke kawasan
- **Outbound**: Proses pengeluaran barang dari kawasan
- **FG**: Finished Goods - Barang jadi
- **BB**: Bahan Baku - Raw Material
- **WIP**: Work In Progress - Barang dalam proses
- **WO**: Work Order - Perintah produksi
- **Stock Opname**: Perhitungan fisik stock
- **Audit Trail**: Catatan perubahan data untuk keperluan audit
- **RFID**: Radio Frequency Identification - teknologi untuk tracking barang
- **Traceability**: Kemampuan melacak barang dari asal hingga tujuan
- **KEK**: Kawasan Ekonomi Khusus
- **KB**: Kawasan Berikat
- **KITE**: Kemudahan Impor Tujuan Ekspor
- **TLDDP**: Tempat Lain Dalam Daerah Pabean
- **IT Inventory**: Sistem inventory Bea Cukai
- **CEISA**: Customs Excise Information System and Automation

## Requirements

### Requirement 1: User Authentication & Authorization

**User Story:** As a user, I want to login to the system with my credentials, so that I can access features according to my role.

#### Acceptance Criteria

1. WHEN a user enters valid credentials, THE System SHALL authenticate the user and grant access
2. WHEN a user enters invalid credentials, THE System SHALL display an error message and deny access
3. THE System SHALL support multiple user roles: admin, warehouse, production, and audit
4. WHEN a user logs in, THE System SHALL display features based on their assigned role
5. WHEN a user is inactive for 30 minutes, THE System SHALL automatically log them out
6. THE System SHALL maintain user session securely using JWT tokens in production mode
7. THE System SHALL store user session in localStorage in demo mode

---

### Requirement 2: Master Data Management - Items

**User Story:** As an admin, I want to manage master data for items, so that I can maintain accurate inventory information.

#### Acceptance Criteria

1. THE System SHALL allow users to create, read, update, and delete item records
2. WHEN creating an item, THE System SHALL require: item_code, item_name, hs_code, item_type, and unit
3. THE System SHALL validate HS Code format (10 digits)
4. THE System SHALL support item types: RAW, WIP, FG, and ASSET
5. WHEN an item has minimum stock defined, THE System SHALL generate alerts when stock falls below threshold
6. THE System SHALL support multiple units: pcs, kg, m, liter, box
7. THE System SHALL allow uploading item images
8. THE System SHALL support RFID tag assignment for traceability
9. WHEN an item is marked as hazardous, THE System SHALL display warning indicators
10. THE System SHALL prevent deletion of items that have transaction history

---

### Requirement 3: Master Data Management - Warehouses

**User Story:** As an admin, I want to manage warehouse information, so that I can organize storage locations effectively.

#### Acceptance Criteria

1. THE System SHALL allow users to create, read, update, and delete warehouse records
2. WHEN creating a warehouse, THE System SHALL require: warehouse_code, warehouse_name, and location
3. THE System SHALL support warehouse types: RAW_MATERIAL, WIP, FINISHED_GOODS, QUARANTINE
4. THE System SHALL track warehouse capacity and current utilization
5. WHEN a warehouse is bonded, THE System SHALL require license_number and license_expiry
6. THE System SHALL generate alerts when warehouse license is expiring within 30 days
7. THE System SHALL assign a manager (PIC) to each warehouse

---

### Requirement 4: Master Data Management - Suppliers & Customers

**User Story:** As an admin, I want to manage supplier and customer information, so that I can track business partners.

#### Acceptance Criteria

1. THE System SHALL allow users to manage supplier records with: code, name, address, contact, tax_id
2. THE System SHALL allow users to manage customer records with: code, name, address, contact, tax_id
3. THE System SHALL validate tax_id format (NPWP format for Indonesia)
4. THE System SHALL support marking suppliers/customers as active or inactive
5. THE System SHALL prevent deletion of suppliers/customers with transaction history

---

### Requirement 5: Customs Document Management

**User Story:** As a warehouse user, I want to manage customs documents, so that all transactions comply with customs regulations.

#### Acceptance Criteria

1. THE System SHALL allow users to create and manage BC documents
2. THE System SHALL support document types: BC23, BC25, BC30, BC40, BC27
3. WHEN creating a BC document, THE System SHALL require: doc_type, doc_number, and doc_date
4. THE System SHALL allow uploading document attachments (PDF, images)
5. THE System SHALL track document status: DRAFT, SUBMITTED, APPROVED, REJECTED
6. WHEN a BC document is approved, THE System SHALL allow it to be used in transactions
7. THE System SHALL prevent modification of approved BC documents
8. THE System SHALL maintain document history with audit trail

---

### Requirement 6: Inbound Process (Pemasukan Barang)

**User Story:** As a warehouse user, I want to record incoming goods, so that inventory is updated accurately.

#### Acceptance Criteria

1. WHEN creating an inbound transaction, THE System SHALL require a valid BC document reference
2. THE System SHALL validate HS Code and unit against BC document
3. WHEN goods are received, THE System SHALL increase stock balance in the specified warehouse
4. THE System SHALL record: supplier, inbound_date, vehicle_number, driver_name, received_by
5. THE System SHALL support multiple items in a single inbound transaction
6. WHEN recording inbound details, THE System SHALL capture: batch_number, manufacturing_date, expiry_date
7. THE System SHALL support quality inspection status: PASS, FAIL, QUARANTINE
8. WHEN quality status is QUARANTINE, THE System SHALL move items to quarantine warehouse
9. THE System SHALL generate inbound receipt document
10. THE System SHALL log all inbound transactions to audit trail

---

### Requirement 7: Stock Balance & Tracking

**User Story:** As a warehouse user, I want to view real-time stock balances, so that I can monitor inventory levels.

#### Acceptance Criteria

1. THE System SHALL display current stock balance per item per warehouse
2. THE System SHALL update stock balance in real-time after each transaction
3. THE System SHALL show stock history with transaction details
4. WHEN stock falls below minimum level, THE System SHALL generate low stock alert
5. THE System SHALL support stock filtering by: warehouse, item_type, category
6. THE System SHALL display stock aging report
7. THE System SHALL show items nearing expiry date
8. THE System SHALL support RFID-based stock tracking in production mode

---

### Requirement 8: Stock Mutation (Transfer Antar Gudang)

**User Story:** As a warehouse user, I want to transfer stock between warehouses, so that I can optimize storage.

#### Acceptance Criteria

1. THE System SHALL allow users to create stock mutation transactions
2. WHEN creating a mutation, THE System SHALL require: item, warehouse_from, warehouse_to, qty, reason
3. THE System SHALL validate that source warehouse has sufficient stock
4. WHEN mutation is completed, THE System SHALL decrease stock in source warehouse and increase in destination warehouse
5. THE System SHALL prevent mutation to the same warehouse
6. THE System SHALL log all mutations to audit trail with reason

---

### Requirement 9: Production Process (Proses Produksi)

**User Story:** As a production user, I want to record production activities, so that finished goods are properly tracked.

#### Acceptance Criteria

1. THE System SHALL allow users to create Work Orders (WO)
2. WHEN creating a WO, THE System SHALL require: production_no, production_date, fg_item_id, fg_qty
3. THE System SHALL allow users to specify raw materials consumed with quantities
4. WHEN WO is completed, THE System SHALL decrease raw material stock and increase finished goods stock
5. THE System SHALL create traceability link between raw materials and finished goods
6. THE System SHALL prevent creating finished goods without production process
7. THE System SHALL record: shift, line_number, supervisor, operator
8. THE System SHALL calculate yield percentage: (fg_qty / total_raw_qty) \* 100
9. WHEN there is scrap/reject, THE System SHALL record scrap_qty and scrap_reason
10. THE System SHALL support WO status: PLANNED, IN_PROGRESS, COMPLETED, CANCELLED
11. THE System SHALL log all production transactions to audit trail

---

### Requirement 10: Outbound Process (Pengeluaran Barang)

**User Story:** As a warehouse user, I want to record outgoing goods, so that inventory and customs compliance are maintained.

#### Acceptance Criteria

1. WHEN creating an outbound transaction, THE System SHALL require a valid BC document reference
2. THE System SHALL support outbound types: EXPORT, LOCAL, RETURN, SAMPLE
3. WHEN goods are shipped, THE System SHALL decrease stock balance in the specified warehouse
4. THE System SHALL validate that warehouse has sufficient stock
5. THE System SHALL record: customer, destination, outbound_date, vehicle_number, driver_name
6. THE System SHALL support multiple items in a single outbound transaction
7. THE System SHALL track outbound status: PENDING, PREPARED, SHIPPED, DELIVERED
8. THE System SHALL generate outbound delivery document
9. THE System SHALL log all outbound transactions to audit trail
10. THE System SHALL prevent outbound of items without valid BC document

---

### Requirement 11: Stock Opname & Adjustment

**User Story:** As a warehouse user, I want to perform stock opname, so that system stock matches physical stock.

#### Acceptance Criteria

1. THE System SHALL allow users to create stock opname sessions
2. WHEN creating stock opname, THE System SHALL require: opname_date, warehouse_id
3. THE System SHALL display current system stock for counting
4. WHEN physical count is entered, THE System SHALL calculate difference automatically
5. WHEN there is a difference, THE System SHALL require a reason for adjustment
6. THE System SHALL support opname types: PERIODIC, SPOT_CHECK, YEAR_END
7. WHEN opname is approved, THE System SHALL adjust stock balance
8. THE System SHALL log all adjustments to audit trail with reason
9. THE System SHALL generate stock opname report
10. THE System SHALL prevent stock opname without approval

---

### Requirement 12: Audit Trail & Logging

**User Story:** As an audit user, I want to view complete audit trail, so that I can track all system changes.

#### Acceptance Criteria

1. THE System SHALL log all data changes (INSERT, UPDATE, DELETE) to audit_logs table
2. WHEN data is changed, THE System SHALL record: user_id, action, table_name, record_id, old_data, new_data, timestamp
3. THE System SHALL store old_data and new_data in JSON format
4. THE System SHALL prevent modification or deletion of audit logs
5. THE System SHALL allow filtering audit logs by: date range, user, table, action
6. THE System SHALL display audit trail in chronological order
7. THE System SHALL support exporting audit logs to Excel/PDF
8. THE System SHALL maintain audit logs for minimum 5 years

---

### Requirement 13: Traceability System

**User Story:** As an audit user, I want to trace items from raw material to finished goods, so that I can verify production compliance.

#### Acceptance Criteria

1. THE System SHALL maintain traceability links between raw materials and finished goods
2. WHEN viewing a finished good, THE System SHALL display all raw materials used in production
3. WHEN viewing a raw material, THE System SHALL display all finished goods it was used for
4. THE System SHALL support forward traceability: BB → FG → Outbound
5. THE System SHALL support backward traceability: Outbound → FG → BB
6. THE System SHALL display traceability chain with: dates, quantities, batch numbers, documents
7. THE System SHALL support RFID-based traceability in production mode
8. THE System SHALL generate traceability reports for audit purposes

---

### Requirement 14: Customs Integration (IT Inventory)

**User Story:** As a system administrator, I want to integrate with IT Inventory, so that data is synchronized with Bea Cukai.

#### Acceptance Criteria

1. WHERE production mode is enabled, THE System SHALL integrate with IT Inventory API
2. THE System SHALL send inbound transactions to IT Inventory in real-time
3. THE System SHALL send outbound transactions to IT Inventory in real-time
4. THE System SHALL send production data to IT Inventory daily
5. THE System SHALL send stock balance to IT Inventory daily
6. WHEN IT Inventory API is unavailable, THE System SHALL queue transactions for retry
7. THE System SHALL log all API calls and responses
8. THE System SHALL display sync status for each transaction
9. THE System SHALL support manual retry for failed syncs

---

### Requirement 15: Customs Integration (CEISA)

**User Story:** As a warehouse user, I want to submit BC documents to CEISA, so that customs clearance is automated.

#### Acceptance Criteria

1. WHERE production mode is enabled, THE System SHALL integrate with CEISA API
2. THE System SHALL allow users to submit BC documents to CEISA
3. WHEN BC document is submitted, THE System SHALL receive response number from CEISA
4. THE System SHALL track BC document status in CEISA: SUBMITTED, APPROVED, REJECTED
5. WHEN BC document is approved by CEISA, THE System SHALL update document status
6. THE System SHALL display CEISA response messages and errors
7. THE System SHALL log all CEISA API calls and responses

---

### Requirement 16: Dashboard & Analytics

**User Story:** As a manager, I want to view dashboard with key metrics, so that I can monitor operations.

#### Acceptance Criteria

1. THE System SHALL display dashboard with: total stock value, inbound/outbound summary, low stock alerts
2. THE System SHALL show stock movement trends (last 7 days, 30 days, 90 days)
3. THE System SHALL display warehouse utilization percentage
4. THE System SHALL show pending transactions count
5. THE System SHALL display recent activities timeline
6. THE System SHALL show production efficiency metrics
7. THE System SHALL display customs document status summary
8. THE System SHALL support date range filtering for all metrics
9. THE System SHALL refresh dashboard data every 5 minutes

---

### Requirement 17: Reporting

**User Story:** As a user, I want to generate various reports, so that I can analyze inventory data.

#### Acceptance Criteria

1. THE System SHALL support generating inventory balance report by warehouse
2. THE System SHALL support generating stock movement report by date range
3. THE System SHALL support generating inbound/outbound summary report
4. THE System SHALL support generating production report with material consumption
5. THE System SHALL support generating traceability report for specific items
6. THE System SHALL support generating customs document report
7. THE System SHALL support generating audit trail report
8. THE System SHALL allow exporting reports to Excel and PDF formats
9. THE System SHALL save report generation history
10. THE System SHALL support scheduling automatic report generation

---

### Requirement 18: Alerts & Notifications

**User Story:** As a user, I want to receive alerts for important events, so that I can take timely action.

#### Acceptance Criteria

1. THE System SHALL generate alerts for low stock items
2. THE System SHALL generate alerts for items nearing expiry date (30 days before)
3. THE System SHALL generate alerts for warehouse license expiring soon
4. THE System SHALL generate alerts for failed customs integration sync
5. THE System SHALL generate alerts for pending approvals
6. THE System SHALL display alerts in notification panel
7. THE System SHALL support marking alerts as read
8. THE System SHALL support alert severity levels: INFO, WARNING, CRITICAL
9. THE System SHALL send email notifications for critical alerts in production mode

---

### Requirement 19: User Management

**User Story:** As an admin, I want to manage user accounts, so that I can control system access.

#### Acceptance Criteria

1. THE System SHALL allow admin to create, read, update, and delete user accounts
2. WHEN creating a user, THE System SHALL require: name, email, password, role
3. THE System SHALL support user roles: admin, warehouse, production, audit
4. THE System SHALL enforce password complexity: minimum 8 characters, uppercase, lowercase, number
5. THE System SHALL allow users to change their own password
6. THE System SHALL allow admin to reset user passwords
7. THE System SHALL support marking users as active or inactive
8. THE System SHALL log all user management activities

---

### Requirement 20: System Configuration

**User Story:** As an admin, I want to configure system settings, so that the system operates according to business needs.

#### Acceptance Criteria

1. THE System SHALL allow admin to configure company information
2. THE System SHALL allow admin to configure kawasan type: KEK, KB, or KITE
3. THE System SHALL allow admin to toggle between demo mode and production mode
4. THE System SHALL allow admin to configure IT Inventory API endpoint and credentials
5. THE System SHALL allow admin to configure CEISA API endpoint and credentials
6. THE System SHALL allow admin to configure alert thresholds
7. THE System SHALL allow admin to configure session timeout duration
8. THE System SHALL allow admin to configure report templates
9. THE System SHALL validate all configuration changes before saving

---

### Requirement 21: Data Import & Export

**User Story:** As an admin, I want to import/export data, so that I can migrate data or backup information.

#### Acceptance Criteria

1. THE System SHALL support importing master data (items, warehouses, suppliers, customers) from Excel
2. THE System SHALL validate imported data before saving
3. WHEN import validation fails, THE System SHALL display error details
4. THE System SHALL support exporting master data to Excel
5. THE System SHALL support exporting transaction data to Excel
6. THE System SHALL support bulk data operations
7. THE System SHALL log all import/export activities

---

### Requirement 22: Mobile Responsiveness

**User Story:** As a user, I want to access the system from mobile devices, so that I can work from anywhere.

#### Acceptance Criteria

1. THE System SHALL be responsive and work on mobile devices (phones and tablets)
2. THE System SHALL adapt layout for screen sizes: mobile (< 768px), tablet (768-1024px), desktop (> 1024px)
3. THE System SHALL support touch gestures for mobile interactions
4. THE System SHALL optimize images and assets for mobile bandwidth
5. THE System SHALL maintain functionality across all screen sizes

---

### Requirement 23: Performance & Scalability

**User Story:** As a system administrator, I want the system to perform well under load, so that users have good experience.

#### Acceptance Criteria

1. THE System SHALL load dashboard within 2 seconds
2. THE System SHALL load list pages within 3 seconds
3. THE System SHALL support pagination for large datasets (50 items per page)
4. THE System SHALL implement lazy loading for images
5. THE System SHALL cache frequently accessed data
6. THE System SHALL support concurrent users (minimum 10 users)
7. THE System SHALL handle 1000+ items without performance degradation

---

### Requirement 24: Security

**User Story:** As a system administrator, I want the system to be secure, so that data is protected.

#### Acceptance Criteria

1. THE System SHALL encrypt passwords using bcrypt
2. THE System SHALL use HTTPS for all communications in production mode
3. THE System SHALL implement JWT token-based authentication
4. THE System SHALL validate all user inputs to prevent SQL injection
5. THE System SHALL sanitize all outputs to prevent XSS attacks
6. THE System SHALL implement CSRF protection
7. THE System SHALL enforce role-based access control (RBAC)
8. THE System SHALL log all security-related events

---

### Requirement 25: Backup & Recovery

**User Story:** As a system administrator, I want to backup data regularly, so that data can be recovered in case of failure.

#### Acceptance Criteria

1. WHERE production mode is enabled, THE System SHALL support database backup
2. THE System SHALL allow admin to trigger manual backup
3. THE System SHALL support scheduled automatic backups
4. THE System SHALL store backups with timestamp
5. THE System SHALL allow admin to restore from backup
6. THE System SHALL validate backup integrity before restore
7. THE System SHALL log all backup and restore activities
