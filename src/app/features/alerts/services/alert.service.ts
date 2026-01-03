import { Injectable, inject } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { Alert, AlertType, AlertSeverity, NotificationPreferences } from '../models/alert.model';

/**
 * Alert Service
 * Requirements: 18.1-18.9
 */
@Injectable({
    providedIn: 'root'
})
export class AlertService {
    private localStorageService = inject(LocalStorageService);
    private readonly ALERTS_KEY = 'alerts';
    private readonly PREFERENCES_KEY = 'notification_preferences';

    private alertsSubject = new BehaviorSubject<Alert[]>([]);
    public alerts$ = this.alertsSubject.asObservable();

    private unreadCountSubject = new BehaviorSubject<number>(0);
    public unreadCount$ = this.unreadCountSubject.asObservable();

    constructor() {
        this.loadAlerts();
    }

    /**
     * Load alerts from storage
     */
    private loadAlerts(): void {
        const alerts = this.localStorageService.getItem<Alert[]>(this.ALERTS_KEY) || [];
        this.alertsSubject.next(alerts);
        this.updateUnreadCount(alerts);
    }

    /**
     * Create new alert
     * Requirements: 18.1, 18.2
     */
    createAlert(
        type: AlertType,
        severity: AlertSeverity,
        title: string,
        message: string,
        entityType?: string,
        entityId?: string,
        metadata?: any
    ): Observable<Alert> {
        const alert: Alert = {
            id: Date.now().toString(),
            type,
            severity,
            title,
            message,
            entity_type: entityType,
            entity_id: entityId,
            is_read: false,
            is_acknowledged: false,
            created_at: new Date(),
            metadata
        };

        const alerts = this.localStorageService.getItem<Alert[]>(this.ALERTS_KEY) || [];
        alerts.unshift(alert);
        this.localStorageService.setItem(this.ALERTS_KEY, alerts);

        this.alertsSubject.next(alerts);
        this.updateUnreadCount(alerts);

        // Play sound for critical alerts
        if (severity === AlertSeverity.CRITICAL) {
            this.playNotificationSound();
        }

        // Send email notification if enabled (production mode)
        this.sendEmailNotification(alert);

        return of(alert).pipe(delay(100));
    }

    /**
     * Get all alerts
     * Requirement: 18.6
     */
    getAlerts(filters?: {
        severity?: AlertSeverity;
        type?: AlertType;
        is_read?: boolean;
        is_acknowledged?: boolean;
    }): Observable<Alert[]> {
        let alerts = this.localStorageService.getItem<Alert[]>(this.ALERTS_KEY) || [];

        if (filters) {
            if (filters.severity) {
                alerts = alerts.filter(a => a.severity === filters.severity);
            }
            if (filters.type) {
                alerts = alerts.filter(a => a.type === filters.type);
            }
            if (filters.is_read !== undefined) {
                alerts = alerts.filter(a => a.is_read === filters.is_read);
            }
            if (filters.is_acknowledged !== undefined) {
                alerts = alerts.filter(a => a.is_acknowledged === filters.is_acknowledged);
            }
        }

        return of(alerts).pipe(delay(200));
    }

    /**
     * Mark alert as read
     * Requirement: 18.3
     */
    markAsRead(alertId: string): Observable<void> {
        const alerts = this.localStorageService.getItem<Alert[]>(this.ALERTS_KEY) || [];
        const index = alerts.findIndex(a => a.id === alertId);

        if (index !== -1) {
            alerts[index].is_read = true;
            alerts[index].read_at = new Date();
            this.localStorageService.setItem(this.ALERTS_KEY, alerts);
            this.alertsSubject.next(alerts);
            this.updateUnreadCount(alerts);
        }

        return of(void 0).pipe(delay(100));
    }

    /**
     * Mark all alerts as read
     */
    markAllAsRead(): Observable<void> {
        const alerts = this.localStorageService.getItem<Alert[]>(this.ALERTS_KEY) || [];
        alerts.forEach(alert => {
            if (!alert.is_read) {
                alert.is_read = true;
                alert.read_at = new Date();
            }
        });
        this.localStorageService.setItem(this.ALERTS_KEY, alerts);
        this.alertsSubject.next(alerts);
        this.updateUnreadCount(alerts);

        return of(void 0).pipe(delay(100));
    }

    /**
     * Acknowledge alert
     * Requirement: 18.3
     */
    acknowledgeAlert(alertId: string, userId: string): Observable<void> {
        const alerts = this.localStorageService.getItem<Alert[]>(this.ALERTS_KEY) || [];
        const index = alerts.findIndex(a => a.id === alertId);

        if (index !== -1) {
            alerts[index].is_acknowledged = true;
            alerts[index].acknowledged_at = new Date();
            alerts[index].acknowledged_by = userId;
            this.localStorageService.setItem(this.ALERTS_KEY, alerts);
            this.alertsSubject.next(alerts);
        }

        return of(void 0).pipe(delay(100));
    }

    /**
     * Delete alert
     */
    deleteAlert(alertId: string): Observable<void> {
        let alerts = this.localStorageService.getItem<Alert[]>(this.ALERTS_KEY) || [];
        alerts = alerts.filter(a => a.id !== alertId);
        this.localStorageService.setItem(this.ALERTS_KEY, alerts);
        this.alertsSubject.next(alerts);
        this.updateUnreadCount(alerts);

        return of(void 0).pipe(delay(100));
    }

    /**
     * Clear old alerts
     */
    clearOldAlerts(daysOld: number = 30): Observable<void> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        let alerts = this.localStorageService.getItem<Alert[]>(this.ALERTS_KEY) || [];
        alerts = alerts.filter(a => new Date(a.created_at) > cutoffDate);
        this.localStorageService.setItem(this.ALERTS_KEY, alerts);
        this.alertsSubject.next(alerts);
        this.updateUnreadCount(alerts);

        return of(void 0).pipe(delay(100));
    }

    /**
     * Get unread count
     */
    getUnreadCount(): Observable<number> {
        const alerts = this.localStorageService.getItem<Alert[]>(this.ALERTS_KEY) || [];
        const count = alerts.filter(a => !a.is_read).length;
        return of(count).pipe(delay(100));
    }

    /**
     * Update unread count subject
     */
    private updateUnreadCount(alerts: Alert[]): void {
        const count = alerts.filter(a => !a.is_read).length;
        this.unreadCountSubject.next(count);
    }

    /**
     * Play notification sound
     * Requirement: 18.8
     */
    private playNotificationSound(): void {
        const preferences = this.getPreferences();
        if (preferences.sound_enabled) {
            // In production, play actual sound
            console.log('🔔 Playing notification sound');
        }
    }

    /**
     * Send email notification
     * Requirements: 18.8, 18.9
     */
    private sendEmailNotification(alert: Alert): void {
        const preferences = this.getPreferences();

        if (preferences.email_enabled && preferences.email_address) {
            // Check if alert type is enabled
            if (!preferences.alert_types.includes(alert.type)) {
                return;
            }

            // Check severity threshold
            const severityOrder = { INFO: 0, WARNING: 1, CRITICAL: 2 };
            if (severityOrder[alert.severity] < severityOrder[preferences.severity_threshold]) {
                return;
            }

            // In production mode, send actual email via API
            console.log(`📧 Sending email notification to ${preferences.email_address}`, alert);
        }
    }

    /**
     * Get notification preferences
     */
    private getPreferences(): NotificationPreferences {
        const prefs = this.localStorageService.getItem<NotificationPreferences>(this.PREFERENCES_KEY);
        return prefs || {
            user_id: 'current_user',
            email_enabled: false,
            sound_enabled: true,
            alert_types: Object.values(AlertType),
            severity_threshold: AlertSeverity.WARNING
        };
    }

    /**
     * Update notification preferences
     * Requirement: 18.4, 18.5
     */
    updatePreferences(preferences: NotificationPreferences): Observable<void> {
        this.localStorageService.setItem(this.PREFERENCES_KEY, preferences);
        return of(void 0).pipe(delay(100));
    }

    /**
     * Get notification preferences
     */
    getNotificationPreferences(): Observable<NotificationPreferences> {
        const prefs = this.getPreferences();
        return of(prefs).pipe(delay(100));
    }
}
