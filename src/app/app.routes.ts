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
            {
                path: 'inventory/items/new',
                loadComponent: () => import('./features/inventory/components/item-form/item-form.component')
                    .then(m => m.ItemFormComponent)
            },
            {
                path: 'inventory/items/:id/edit',
                loadComponent: () => import('./features/inventory/components/item-form/item-form.component')
                    .then(m => m.ItemFormComponent)
            },

            // Master Data - Warehouses
            {
                path: 'warehouses',
                loadComponent: () => import('./features/warehouse/components/warehouse-list/warehouse-list.component')
                    .then(m => m.WarehouseListComponent)
            },
            {
                path: 'warehouses/new',
                loadComponent: () => import('./features/warehouse/components/warehouse-form/warehouse-form.component')
                    .then(m => m.WarehouseFormComponent)
            },
            {
                path: 'warehouses/:id/edit',
                loadComponent: () => import('./features/warehouse/components/warehouse-form/warehouse-form.component')
                    .then(m => m.WarehouseFormComponent)
            },

            // Master Data - Suppliers
            {
                path: 'suppliers',
                loadComponent: () => import('./features/suppliers-customers/components/supplier-list/supplier-list.component')
                    .then(m => m.SupplierListComponent)
            },
            {
                path: 'suppliers/new',
                loadComponent: () => import('./features/suppliers-customers/components/supplier-form/supplier-form.component')
                    .then(m => m.SupplierFormComponent)
            },
            {
                path: 'suppliers/:id/edit',
                loadComponent: () => import('./features/suppliers-customers/components/supplier-form/supplier-form.component')
                    .then(m => m.SupplierFormComponent)
            },

            // Master Data - Customers
            {
                path: 'customers',
                loadComponent: () => import('./features/suppliers-customers/components/customer-list/customer-list.component')
                    .then(m => m.CustomerListComponent)
            },
            {
                path: 'customers/new',
                loadComponent: () => import('./features/suppliers-customers/components/customer-form/customer-form.component')
                    .then(m => m.CustomerFormComponent)
            },
            {
                path: 'customers/:id/edit',
                loadComponent: () => import('./features/suppliers-customers/components/customer-form/customer-form.component')
                    .then(m => m.CustomerFormComponent)
            },

            // Transactions - Inbound
            {
                path: 'inbound',
                loadComponent: () => import('./features/inbound/components/inbound-list/inbound-list.component')
                    .then(m => m.InboundListComponent)
            },
            {
                path: 'inbound/create',
                loadComponent: () => import('./features/inbound/components/inbound-form/inbound-form.component')
                    .then(m => m.InboundFormComponent)
            },
            {
                path: 'inbound/:id',
                loadComponent: () => import('./features/inbound/components/inbound-form/inbound-form.component')
                    .then(m => m.InboundFormComponent)
            },

            // Transactions - Outbound
            {
                path: 'outbound',
                loadComponent: () => import('./features/outbound/components/outbound-list/outbound-list.component')
                    .then(m => m.OutboundListComponent)
            },
            {
                path: 'outbound/new',
                loadComponent: () => import('./features/outbound/components/outbound-form/outbound-form.component')
                    .then(m => m.OutboundFormComponent)
            },
            {
                path: 'outbound/:id/edit',
                loadComponent: () => import('./features/outbound/components/outbound-form/outbound-form.component')
                    .then(m => m.OutboundFormComponent)
            },

            // Transactions - Production
            {
                path: 'production',
                loadComponent: () => import('./features/production/components/production-list/production-list.component')
                    .then(m => m.ProductionListComponent)
            },
            {
                path: 'production/new',
                loadComponent: () => import('./features/production/components/production-form/production-form.component')
                    .then(m => m.ProductionFormComponent)
            },
            {
                path: 'production/:id/edit',
                loadComponent: () => import('./features/production/components/production-form/production-form.component')
                    .then(m => m.ProductionFormComponent)
            },

            // Transactions - Stock Mutation
            {
                path: 'stock-mutation',
                loadComponent: () => import('./features/stock-mutation/components/stock-mutation-form/stock-mutation-form.component')
                    .then(m => m.StockMutationFormComponent)
            },
            {
                path: 'stock-mutation/new',
                loadComponent: () => import('./features/stock-mutation/components/stock-mutation-form/stock-mutation-form.component')
                    .then(m => m.StockMutationFormComponent)
            },
            {
                path: 'stock-mutation/:id/edit',
                loadComponent: () => import('./features/stock-mutation/components/stock-mutation-form/stock-mutation-form.component')
                    .then(m => m.StockMutationFormComponent)
            },

            // Transactions - Stock Opname
            {
                path: 'stock-opname',
                loadComponent: () => import('./features/stock-opname/components/stock-opname-list/stock-opname-list.component')
                    .then(m => m.StockOpnameListComponent)
            },
            {
                path: 'stock-opname/new',
                loadComponent: () => import('./features/stock-opname/components/stock-opname-form/stock-opname-form.component')
                    .then(m => m.StockOpnameFormComponent)
            },
            {
                path: 'stock-opname/:id/edit',
                loadComponent: () => import('./features/stock-opname/components/stock-opname-form/stock-opname-form.component')
                    .then(m => m.StockOpnameFormComponent)
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
            {
                path: 'bc-documents/new',
                loadComponent: () => import('./features/bc-documents/components/bc-document-form/bc-document-form.component')
                    .then(m => m.BCDocumentFormComponent)
            },
            {
                path: 'bc-documents/:id/edit',
                loadComponent: () => import('./features/bc-documents/components/bc-document-form/bc-document-form.component')
                    .then(m => m.BCDocumentFormComponent)
            },

            // Customs - Customs Sync
            {
                path: 'customs-integration',
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
