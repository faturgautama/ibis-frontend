import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './shared/components/dashboard-layout/dashboard-layout.component';

/**
 * Application Routes
 * Complete routing configuration for IBIS system
 */
export const routes: Routes = [
    // Redirect root to dashboard
    {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
    },

    // Main application routes with new dashboard layout
    {
        path: '',
        component: DashboardLayoutComponent,
        children: [
            // Dashboard
            {
                path: 'dashboard',
                loadComponent: () => import('./features/dashboard/components/main-dashboard/main-dashboard.component')
                    .then(m => m.MainDashboardComponent)
            },

            // Master Data - Items
            {
                path: 'inventory',
                loadComponent: () => import('./features/inventory/components/item-list/item-list.component')
                    .then(m => m.ItemListComponent)
            },

            // Master Data - Warehouses
            {
                path: 'warehouses',
                loadComponent: () => import('./features/warehouses/components/warehouse-list/warehouse-list.component')
                    .then(m => m.WarehouseListComponent)
            },

            // Master Data - Suppliers
            {
                path: 'suppliers',
                loadComponent: () => import('./features/suppliers-customers/components/supplier-list/supplier-list.component')
                    .then(m => m.SupplierListComponent)
            },

            // Master Data - Customers
            {
                path: 'customers',
                loadComponent: () => import('./features/suppliers-customers/components/customer-list/customer-list.component')
                    .then(m => m.CustomerListComponent)
            },

            // Transactions - Inbound
            {
                path: 'inbound',
                loadComponent: () => import('./features/inbound/components/inbound-list/inbound-list.component')
                    .then(m => m.InboundListComponent)
            },

            // Transactions - Outbound
            {
                path: 'outbound',
                loadComponent: () => import('./features/outbound/components/outbound-list/outbound-list.component')
                    .then(m => m.OutboundListComponent)
            },

            // Transactions - Production
            {
                path: 'production',
                loadComponent: () => import('./features/production/components/production-list/production-list.component')
                    .then(m => m.ProductionListComponent)
            },

            // Transactions - Stock Mutation
            {
                path: 'stock-mutation',
                loadComponent: () => import('./features/stock-mutation/components/stock-mutation-form/stock-mutation-form.component')
                    .then(m => m.StockMutationFormComponent)
            },

            // Transactions - Stock Opname
            {
                path: 'stock-opname',
                loadComponent: () => import('./features/stock-opname/components/stock-opname-list/stock-opname-list.component')
                    .then(m => m.StockOpnameListComponent)
            },

            // Stock Management - Stock Balance
            {
                path: 'stock-balance',
                loadComponent: () => import('./features/stock-balance/components/stock-balance-view/stock-balance-view.component')
                    .then(m => m.StockBalanceViewComponent)
            },

            // Customs - BC Documents
            {
                path: 'bc-documents',
                loadComponent: () => import('./features/bc-documents/components/bc-document-list/bc-document-list.component')
                    .then(m => m.BCDocumentListComponent)
            },

            // Customs - Customs Sync
            {
                path: 'customs-sync',
                loadComponent: () => import('./features/customs-integration/components/customs-sync-dashboard/customs-sync-dashboard.component')
                    .then(m => m.CustomsSyncDashboardComponent)
            },

            // Traceability
            {
                path: 'traceability',
                loadComponent: () => import('./features/traceability/components/traceability-view/traceability-view.component')
                    .then(m => m.TraceabilityViewComponent)
            },

            // Reports
            {
                path: 'reports',
                loadComponent: () => import('./features/reporting/components/report-generator/report-generator.component')
                    .then(m => m.ReportGeneratorComponent)
            },

            // Audit Trail
            {
                path: 'audit-trail',
                loadComponent: () => import('./features/audit-trail/components/audit-trail-view/audit-trail-view.component')
                    .then(m => m.AuditTrailViewComponent)
            },

            // Import/Export
            {
                path: 'import-export',
                loadComponent: () => import('./features/import-export/components/import-export-panel/import-export-panel.component')
                    .then(m => m.ImportExportPanelComponent)
            },

            // Administration - User Management
            {
                path: 'users',
                loadComponent: () => import('./features/user-management/components/user-list/user-list.component')
                    .then(m => m.UserListComponent)
            },

            // Administration - Configuration
            {
                path: 'configuration',
                loadComponent: () => import('./features/configuration/components/configuration-panel/configuration-panel.component')
                    .then(m => m.ConfigurationPanelComponent)
            }
        ]
    },

    // Login route (without layout)
    {
        path: 'login',
        loadComponent: () => import('./features/auth/components/login/login.component')
            .then(m => m.LoginComponent)
    },

    // 404 Not Found
    {
        path: '**',
        redirectTo: '/dashboard'
    }
];
