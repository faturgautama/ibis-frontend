import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../services/alert.service';
import { Alert, AlertSeverity, AlertType } from '../../models/alert.model';
import { Subscription } from 'rxjs';

/**
 * Notification Panel Component
 * Requirements: 18.6, 18.7, 18.8
 */
@Component({
    selector: 'app-notification-panel',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        DrawerModule,
        ButtonModule,
        BadgeModule,
        TagModule,
        SelectModule
    ],
    template: `
        <!-- Notification Bell Button -->
        <p-button 
            icon="pi pi-bell" 
            class="p-button-rounded p-button-text relative"
            (click)="togglePanel()"
            [badge]="unreadCount > 0 ? unreadCount.toString() : ''"
            badgeSeverity="danger"
        ></p-button>

        <!-- Notification Drawer -->
        <p-drawer 
            [(visible)]="visible" 
            position="right" 
            [style]="{width: '400px'}"
        >
            <ng-template pTemplate="header">
                <div class="flex justify-between items-center w-full">
                    <h3 class="text-lg font-semibold">Notifications</h3>
                    <span class="text-sm text-gray-600">{{ unreadCount }} unread</span>
                </div>
            </ng-template>

            <!-- Filter Section -->
            <div class="mb-4 space-y-3">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Filter by Severity</label>
                    <p-select 
                        [(ngModel)]="selectedSeverity"
                        [options]="severityOptions"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="All Severities"
                        [showClear]="true"
                        class="w-full"
                        (onChange)="loadAlerts()"
                    ></p-select>
                </div>

                <div class="flex gap-2">
                    <button 
                        pButton 
                        label="Mark All Read" 
                        icon="pi pi-check"
                        class="p-button-sm p-button-text flex-1"
                        (click)="markAllAsRead()"
                        [disabled]="unreadCount === 0"
                    ></button>
                    <button 
                        pButton 
                        label="Clear Old" 
                        icon="pi pi-trash"
                        class="p-button-sm p-button-text flex-1"
                        (click)="clearOldAlerts()"
                    ></button>
                </div>
            </div>

            <!-- Alerts List -->
            <div class="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto">
                <div 
                    *ngFor="let alert of alerts"
                    class="p-3 rounded-lg border cursor-pointer transition-colors"
                    [class.bg-blue-50]="!alert.is_read"
                    [class.bg-white]="alert.is_read"
                    [class.border-blue-200]="!alert.is_read"
                    [class.border-gray-200]="alert.is_read"
                    (click)="handleAlertClick(alert)"
                >
                    <div class="flex items-start gap-3">
                        <i 
                            [class]="getAlertIcon(alert.type)"
                            [class.text-red-500]="alert.severity === 'CRITICAL'"
                            [class.text-yellow-500]="alert.severity === 'WARNING'"
                            [class.text-blue-500]="alert.severity === 'INFO'"
                            class="text-xl mt-1"
                        ></i>
                        
                        <div class="flex-1 min-w-0">
                            <div class="flex items-start justify-between gap-2 mb-1">
                                <h4 class="font-semibold text-sm text-gray-900 truncate">
                                    {{ alert.title }}
                                </h4>
                                <p-tag 
                                    [value]="alert.severity" 
                                    [severity]="getSeverityColor(alert.severity)"
                                    class="text-xs"
                                ></p-tag>
                            </div>
                            
                            <p class="text-sm text-gray-600 mb-2">{{ alert.message }}</p>
                            
                            <div class="flex items-center justify-between">
                                <span class="text-xs text-gray-500">
                                    {{ alert.created_at | date:'short' }}
                                </span>
                                
                                <div class="flex gap-1">
                                    <button 
                                        *ngIf="!alert.is_read"
                                        pButton 
                                        icon="pi pi-check"
                                        class="p-button-sm p-button-text p-button-rounded"
                                        (click)="markAsRead(alert.id, $event)"
                                        pTooltip="Mark as read"
                                    ></button>
                                    <button 
                                        pButton 
                                        icon="pi pi-times"
                                        class="p-button-sm p-button-text p-button-rounded p-button-danger"
                                        (click)="deleteAlert(alert.id, $event)"
                                        pTooltip="Delete"
                                    ></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div *ngIf="alerts.length === 0" class="text-center py-8 text-gray-500">
                    <i class="pi pi-bell text-4xl mb-3 block"></i>
                    <p>No notifications</p>
                </div>
            </div>
        </p-drawer>
    `
})
export class NotificationPanelComponent implements OnInit, OnDestroy {
    private alertService = inject(AlertService);

    visible = false;
    alerts: Alert[] = [];
    unreadCount = 0;
    selectedSeverity: AlertSeverity | null = null;

    severityOptions = [
        { label: 'Critical', value: AlertSeverity.CRITICAL },
        { label: 'Warning', value: AlertSeverity.WARNING },
        { label: 'Info', value: AlertSeverity.INFO }
    ];

    private subscriptions: Subscription[] = [];

    ngOnInit(): void {
        this.loadAlerts();

        // Subscribe to alerts updates
        this.subscriptions.push(
            this.alertService.alerts$.subscribe(alerts => {
                this.loadAlerts();
            })
        );

        // Subscribe to unread count
        this.subscriptions.push(
            this.alertService.unreadCount$.subscribe(count => {
                this.unreadCount = count;
            })
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    togglePanel(): void {
        this.visible = !this.visible;
        if (this.visible) {
            this.loadAlerts();
        }
    }

    loadAlerts(): void {
        const filters: any = {};
        if (this.selectedSeverity) {
            filters.severity = this.selectedSeverity;
        }

        this.alertService.getAlerts(filters).subscribe(alerts => {
            this.alerts = alerts;
        });
    }

    markAsRead(alertId: string, event: Event): void {
        event.stopPropagation();
        this.alertService.markAsRead(alertId).subscribe(() => {
            this.loadAlerts();
        });
    }

    markAllAsRead(): void {
        this.alertService.markAllAsRead().subscribe(() => {
            this.loadAlerts();
        });
    }

    deleteAlert(alertId: string, event: Event): void {
        event.stopPropagation();
        this.alertService.deleteAlert(alertId).subscribe(() => {
            this.loadAlerts();
        });
    }

    clearOldAlerts(): void {
        this.alertService.clearOldAlerts(30).subscribe(() => {
            this.loadAlerts();
        });
    }

    handleAlertClick(alert: Alert): void {
        if (!alert.is_read) {
            this.markAsRead(alert.id, new Event('click'));
        }

        // Navigate to action URL if available
        if (alert.action_url) {
            console.log('Navigate to:', alert.action_url);
        }
    }

    getAlertIcon(type: AlertType): string {
        const iconMap: Record<AlertType, string> = {
            [AlertType.LOW_STOCK]: 'pi pi-exclamation-triangle',
            [AlertType.OUT_OF_STOCK]: 'pi pi-times-circle',
            [AlertType.EXPIRING_SOON]: 'pi pi-calendar-times',
            [AlertType.EXPIRED]: 'pi pi-ban',
            [AlertType.LICENSE_EXPIRY]: 'pi pi-id-card',
            [AlertType.PENDING_APPROVAL]: 'pi pi-clock',
            [AlertType.SYNC_FAILED]: 'pi pi-refresh',
            [AlertType.CEISA_REJECTED]: 'pi pi-times',
            [AlertType.SYSTEM]: 'pi pi-info-circle'
        };
        return iconMap[type] || 'pi pi-bell';
    }

    getSeverityColor(severity: AlertSeverity): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
        const colorMap: Record<AlertSeverity, 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast'> = {
            [AlertSeverity.CRITICAL]: 'danger',
            [AlertSeverity.WARNING]: 'warn',
            [AlertSeverity.INFO]: 'info'
        };
        return colorMap[severity] || 'info';
    }
}
