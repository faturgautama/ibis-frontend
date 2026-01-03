import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * MenuItem Interface
 * Represents a navigation menu item
 */
export interface MenuItem {
    id: string;
    label: string;
    icon: string;
    route: string;
    badge?: number;
    children?: MenuItem[];
}

/**
 * NavigationService
 * Service untuk manage state sidebar dan navigation logic
 * Requirements: 9.1, 9.2, 9.4
 */
@Injectable({
    providedIn: 'root'
})
export class NavigationService {
    /**
     * BehaviorSubject untuk sidebar toggle state
     * true = expanded, false = collapsed
     */
    toggleDashboardSidebar = new BehaviorSubject<boolean>(true);

    constructor() { }

    /**
     * Toggle sidebar state (expanded <-> collapsed)
     */
    toggleSidebar(): void {
        const current = this.toggleDashboardSidebar.value;
        this.toggleDashboardSidebar.next(!current);
    }

    /**
     * Collapse sidebar (set to collapsed state)
     */
    collapseSidebar(): void {
        this.toggleDashboardSidebar.next(false);
    }

    /**
     * Expand sidebar (set to expanded state)
     */
    expandSidebar(): void {
        this.toggleDashboardSidebar.next(true);
    }

    /**
     * Get menu items untuk sidebar navigation
     * Returns array of MenuItem
     */
    getMenuItems(): MenuItem[] {
        return [
            {
                id: 'dashboard',
                label: 'Dashboard',
                icon: 'pi pi-home',
                route: '/dashboard'
            },
            {
                id: 'inventory',
                label: 'Inventory',
                icon: 'pi pi-box',
                route: '/inventory'
            },
            {
                id: 'inbound',
                label: 'Inbound',
                icon: 'pi pi-arrow-down',
                route: '/inbound'
            },
            {
                id: 'outbound',
                label: 'Outbound',
                icon: 'pi pi-arrow-up',
                route: '/outbound'
            },
            {
                id: 'production',
                label: 'Production',
                icon: 'pi pi-cog',
                route: '/production'
            },
            {
                id: 'stock-mutation',
                label: 'Stock Mutation',
                icon: 'pi pi-arrows-h',
                route: '/stock-mutation'
            },
            {
                id: 'stock-opname',
                label: 'Stock Opname',
                icon: 'pi pi-list',
                route: '/stock-opname'
            },
            {
                id: 'stock-balance',
                label: 'Stock Balance',
                icon: 'pi pi-chart-line',
                route: '/stock-balance'
            },
            {
                id: 'traceability',
                label: 'Traceability',
                icon: 'pi pi-sitemap',
                route: '/traceability'
            },
            {
                id: 'bc-documents',
                label: 'BC Documents',
                icon: 'pi pi-file-pdf',
                route: '/bc-documents'
            },
            {
                id: 'customs-sync',
                label: 'Customs Sync',
                icon: 'pi pi-sync',
                route: '/customs-integration'
            },
            {
                id: 'reports',
                label: 'Reports',
                icon: 'pi pi-chart-pie',
                route: '/reports'
            },
            {
                id: 'audit-trail',
                label: 'Audit Trail',
                icon: 'pi pi-book',
                route: '/audit-trail'
            },
            {
                id: 'import-export',
                label: 'Import/Export',
                icon: 'pi pi-upload',
                route: '/import-export'
            },
            {
                id: 'users',
                label: 'User Management',
                icon: 'pi pi-users',
                route: '/users'
            }
        ];
    }
}
