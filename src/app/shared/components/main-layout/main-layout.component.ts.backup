import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { DrawerModule } from 'primeng/drawer';
import { MenuItem } from 'primeng/api';
import { NotificationPanelComponent } from '../../../features/alerts/components/notification-panel/notification-panel.component';

/**
 * Main Layout Component
 * Requirements: 22.1, 22.2
 */
@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MenuModule,
        ButtonModule,
        AvatarModule,
        DrawerModule,
        NotificationPanelComponent
    ],
    template: `
        <div class="min-h-screen bg-gray-100">
            <!-- Top Navigation Bar -->
            <nav class="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
                <div class="flex items-center justify-between px-4 py-3">
                    <!-- Logo & Menu Toggle -->
                    <div class="flex items-center gap-4">
                        <button 
                            pButton 
                            icon="pi pi-bars"
                            class="p-button-text p-button-rounded"
                            (click)="sidebarVisible = true"
                        ></button>
                        <div class="flex items-center gap-2">
                            <i class="pi pi-box text-2xl text-blue-600"></i>
                            <span class="text-xl font-bold text-gray-900">IBIS</span>
                        </div>
                    </div>

                    <!-- Breadcrumb -->
                    <div class="hidden md:flex items-center gap-2 text-sm text-gray-600">
                        <i class="pi pi-home"></i>
                        <span>/</span>
                        <span>{{ currentPage }}</span>
                    </div>

                    <!-- Right Side Actions -->
                    <div class="flex items-center gap-3">
                        <!-- Notification Bell -->
                        <app-notification-panel></app-notification-panel>

                        <!-- User Menu -->
                        <div class="flex items-center gap-2 cursor-pointer" (click)="userMenuVisible = true">
                            <p-avatar 
                                label="A" 
                                shape="circle"
                                [style]="{'background-color':'#2196F3', 'color': '#ffffff'}"
                            ></p-avatar>
                            <div class="hidden md:block">
                                <div class="text-sm font-semibold text-gray-900">Admin User</div>
                                <div class="text-xs text-gray-600">Administrator</div>
                            </div>
                            <i class="pi pi-chevron-down text-gray-600"></i>
                        </div>
                    </div>
                </div>
            </nav>

            <!-- Main Sidebar Drawer -->
            <p-drawer 
                [(visible)]="sidebarVisible" 
                [style]="{width: '280px'}"
                position="left"
            >
                <ng-template pTemplate="header">
                    <div class="flex items-center gap-2">
                        <i class="pi pi-box text-2xl text-blue-600"></i>
                        <span class="text-xl font-bold text-gray-900">IBIS Menu</span>
                    </div>
                </ng-template>

                <div class="space-y-2">
                    <div *ngFor="let item of menuItems" class="mb-2">
                        <!-- Menu Item with Submenu -->
                        <div *ngIf="item.items && item.items.length > 0">
                            <div 
                                class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                                (click)="toggleSubmenu(item)"
                            >
                                <div class="flex items-center gap-3">
                                    <i [class]="item.icon + ' text-gray-600'"></i>
                                    <span class="font-medium text-gray-900">{{ item.label }}</span>
                                </div>
                                <i [class]="item.expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'" class="text-gray-600"></i>
                            </div>
                            
                            <!-- Submenu -->
                            <div *ngIf="item.expanded" class="ml-4 mt-1 space-y-1">
                                <div 
                                    *ngFor="let subItem of item.items"
                                    class="flex items-center gap-3 p-2 pl-8 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                                    [class.bg-blue-100]="isActive(subItem.routerLink)"
                                    (click)="navigate(subItem.routerLink)"
                                >
                                    <i [class]="subItem.icon + ' text-gray-600 text-sm'"></i>
                                    <span class="text-sm text-gray-700">{{ subItem.label }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Menu Item without Submenu -->
                        <div 
                            *ngIf="!item.items || item.items.length === 0"
                            class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                            [class.bg-blue-100]="isActive(item.routerLink)"
                            (click)="navigate(item.routerLink)"
                        >
                            <i [class]="item.icon + ' text-gray-600'"></i>
                            <span class="font-medium text-gray-900">{{ item.label }}</span>
                        </div>
                    </div>
                </div>

                <ng-template pTemplate="footer">
                    <div class="border-t border-gray-200 pt-4">
                        <button 
                            pButton 
                            label="Logout" 
                            icon="pi pi-sign-out"
                            class="w-full p-button-danger p-button-text"
                            (click)="logout()"
                        ></button>
                    </div>
                </ng-template>
            </p-drawer>

            <!-- User Menu Drawer -->
            <p-drawer 
                [(visible)]="userMenuVisible" 
                position="right"
                [style]="{width: '300px'}"
            >
                <ng-template pTemplate="header">
                    <h3 class="text-lg font-semibold">User Menu</h3>
                </ng-template>

                <div class="space-y-3">
                    <div class="text-center pb-4 border-b border-gray-200">
                        <p-avatar 
                            label="A" 
                            size="xlarge"
                            shape="circle"
                            [style]="{'background-color':'#2196F3', 'color': '#ffffff'}"
                        ></p-avatar>
                        <div class="mt-3">
                            <div class="font-semibold text-gray-900">Admin User</div>
                            <div class="text-sm text-gray-600">admin@example.com</div>
                            <div class="text-xs text-gray-500 mt-1">Administrator</div>
                        </div>
                    </div>

                    <button 
                        pButton 
                        label="Profile" 
                        icon="pi pi-user"
                        class="w-full p-button-text justify-start"
                        (click)="navigate('/profile')"
                    ></button>
                    <button 
                        pButton 
                        label="Change Password" 
                        icon="pi pi-key"
                        class="w-full p-button-text justify-start"
                        (click)="navigate('/change-password')"
                    ></button>
                    <button 
                        pButton 
                        label="Settings" 
                        icon="pi pi-cog"
                        class="w-full p-button-text justify-start"
                        (click)="navigate('/configuration')"
                    ></button>
                    <button 
                        pButton 
                        label="Logout" 
                        icon="pi pi-sign-out"
                        class="w-full p-button-danger p-button-text justify-start"
                        (click)="logout()"
                    ></button>
                </div>
            </p-drawer>

            <!-- Main Content -->
            <div class="pt-16">
                <router-outlet></router-outlet>
            </div>
        </div>
    `
})
export class MainLayoutComponent implements OnInit {
    private router = inject(Router);

    sidebarVisible = false;
    userMenuVisible = false;
    currentPage = 'Dashboard';

    menuItems: MenuItem[] = [
        {
            label: 'Dashboard',
            icon: 'pi pi-home',
            routerLink: '/dashboard'
        },
        {
            label: 'Master Data',
            icon: 'pi pi-database',
            expanded: false,
            items: [
                { label: 'Items', icon: 'pi pi-box', routerLink: '/items' },
                { label: 'Warehouses', icon: 'pi pi-building', routerLink: '/warehouses' },
                { label: 'Suppliers', icon: 'pi pi-truck', routerLink: '/suppliers' },
                { label: 'Customers', icon: 'pi pi-users', routerLink: '/customers' }
            ]
        },
        {
            label: 'Transactions',
            icon: 'pi pi-shopping-cart',
            expanded: false,
            items: [
                { label: 'Inbound', icon: 'pi pi-arrow-down', routerLink: '/inbound' },
                { label: 'Outbound', icon: 'pi pi-arrow-up', routerLink: '/outbound' },
                { label: 'Production', icon: 'pi pi-cog', routerLink: '/production' },
                { label: 'Stock Mutation', icon: 'pi pi-arrows-h', routerLink: '/stock-mutation' },
                { label: 'Stock Opname', icon: 'pi pi-list', routerLink: '/stock-opname' }
            ]
        },
        {
            label: 'Stock Management',
            icon: 'pi pi-chart-bar',
            expanded: false,
            items: [
                { label: 'Stock Balance', icon: 'pi pi-chart-line', routerLink: '/stock-balance' },
                { label: 'Stock History', icon: 'pi pi-history', routerLink: '/stock-history' },
                { label: 'Low Stock Alerts', icon: 'pi pi-exclamation-triangle', routerLink: '/low-stock' }
            ]
        },
        {
            label: 'Customs',
            icon: 'pi pi-file',
            expanded: false,
            items: [
                { label: 'BC Documents', icon: 'pi pi-file-pdf', routerLink: '/bc-documents' },
                { label: 'Customs Sync', icon: 'pi pi-sync', routerLink: '/customs-sync' },
                { label: 'CEISA Status', icon: 'pi pi-check-circle', routerLink: '/ceisa-status' }
            ]
        },
        {
            label: 'Traceability',
            icon: 'pi pi-sitemap',
            routerLink: '/traceability'
        },
        {
            label: 'Reports',
            icon: 'pi pi-chart-pie',
            expanded: false,
            items: [
                { label: 'Generate Reports', icon: 'pi pi-file', routerLink: '/reports' },
                { label: 'Scheduled Reports', icon: 'pi pi-calendar', routerLink: '/scheduled-reports' },
                { label: 'Report History', icon: 'pi pi-history', routerLink: '/report-history' }
            ]
        },
        {
            label: 'Audit Trail',
            icon: 'pi pi-book',
            routerLink: '/audit-trail'
        },
        {
            label: 'Import/Export',
            icon: 'pi pi-upload',
            routerLink: '/import-export'
        },
        {
            label: 'Administration',
            icon: 'pi pi-cog',
            expanded: false,
            items: [
                { label: 'User Management', icon: 'pi pi-users', routerLink: '/users' },
                { label: 'Configuration', icon: 'pi pi-sliders-h', routerLink: '/configuration' },
                { label: 'System Logs', icon: 'pi pi-list', routerLink: '/system-logs' }
            ]
        }
    ];

    ngOnInit(): void {
        // Subscribe to router events to update current page
        this.router.events.subscribe(() => {
            this.updateCurrentPage();
        });
        this.updateCurrentPage();
    }

    toggleSubmenu(item: MenuItem): void {
        item.expanded = !item.expanded;
    }

    navigate(route: string | undefined): void {
        if (route) {
            this.router.navigate([route]);
            this.userMenuVisible = false;
            // On mobile, close sidebar after navigation
            if (window.innerWidth < 768) {
                this.sidebarVisible = false;
            }
        }
    }

    isActive(route: string | undefined): boolean {
        if (!route) return false;
        return this.router.url === route;
    }

    updateCurrentPage(): void {
        const url = this.router.url;
        const segments = url.split('/').filter(s => s);
        if (segments.length > 0) {
            this.currentPage = segments[segments.length - 1]
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        } else {
            this.currentPage = 'Dashboard';
        }
    }

    logout(): void {
        if (confirm('Are you sure you want to logout?')) {
            // Clear session
            localStorage.removeItem('auth_token');
            this.router.navigate(['/login']);
        }
    }
}
