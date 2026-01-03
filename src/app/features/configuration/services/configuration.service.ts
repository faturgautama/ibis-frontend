import { Injectable, inject } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { Configuration, KawasanType, OperationMode } from '../models/configuration.model';

/**
 * Configuration Service
 * Requirements: 20.1-20.9
 */
@Injectable({
    providedIn: 'root'
})
export class ConfigurationService {
    private localStorageService = inject(LocalStorageService);
    private readonly CONFIG_KEY = 'system_configuration';
    private readonly BACKUP_KEY = 'configuration_backup';

    private configSubject = new BehaviorSubject<Configuration | null>(null);
    public config$ = this.configSubject.asObservable();

    constructor() {
        this.initializeConfiguration();
    }

    /**
     * Initialize default configuration
     */
    private initializeConfiguration(): void {
        let config = this.localStorageService.getItem<Configuration>(this.CONFIG_KEY);

        if (!config) {
            config = this.getDefaultConfiguration();
            this.localStorageService.setItem(this.CONFIG_KEY, config);
        }

        this.configSubject.next(config);
    }

    /**
     * Get default configuration
     */
    private getDefaultConfiguration(): Configuration {
        return {
            company_info: {
                company_name: 'PT Example Company',
                company_address: 'Jakarta, Indonesia',
                company_phone: '+62-21-1234567',
                company_email: 'info@example.com',
                npwp: '01.234.567.8-901.000',
                kawasan_type: KawasanType.KEK
            },
            system: {
                operation_mode: OperationMode.DEMO,
                session_timeout_minutes: 30,
                low_stock_threshold: 100,
                expiry_warning_days: 30,
                auto_backup_enabled: true,
                auto_backup_interval_hours: 24,
                language: 'id',
                timezone: 'Asia/Jakarta',
                date_format: 'DD/MM/YYYY',
                currency: 'IDR'
            },
            api: {
                it_inventory_enabled: false,
                it_inventory_timeout_seconds: 30,
                ceisa_enabled: false,
                ceisa_timeout_seconds: 60,
                sync_retry_attempts: 3,
                sync_retry_delay_seconds: 5
            },
            alerts: {
                email_notifications_enabled: false,
                sound_notifications_enabled: true,
                low_stock_alert_enabled: true,
                expiry_alert_enabled: true,
                license_expiry_alert_enabled: true,
                sync_failure_alert_enabled: true
            },
            reports: {
                default_report_format: 'EXCEL',
                scheduled_reports_enabled: false,
                report_retention_days: 90
            },
            last_updated: new Date(),
            updated_by: 'system'
        };
    }

    /**
     * Get current configuration
     * Requirement: 20.1
     */
    getConfiguration(): Observable<Configuration> {
        const config = this.localStorageService.getItem<Configuration>(this.CONFIG_KEY)
            || this.getDefaultConfiguration();
        return of(config).pipe(delay(200));
    }

    /**
     * Update configuration
     * Requirement: 20.1
     */
    updateConfiguration(config: Configuration, updatedBy: string): Observable<Configuration> {
        // Validate configuration
        const validation = this.validateConfiguration(config);
        if (!validation.valid) {
            throw new Error(validation.errors.join(', '));
        }

        config.last_updated = new Date();
        config.updated_by = updatedBy;

        this.localStorageService.setItem(this.CONFIG_KEY, config);
        this.configSubject.next(config);

        return of(config).pipe(delay(300));
    }

    /**
     * Update company info
     * Requirement: 20.1, 20.2
     */
    updateCompanyInfo(companyInfo: Partial<Configuration['company_info']>, updatedBy: string): Observable<Configuration> {
        const config = this.localStorageService.getItem<Configuration>(this.CONFIG_KEY)
            || this.getDefaultConfiguration();

        config.company_info = { ...config.company_info, ...companyInfo };
        return this.updateConfiguration(config, updatedBy);
    }

    /**
     * Update system settings
     * Requirement: 20.3, 20.7, 20.9
     */
    updateSystemSettings(settings: Partial<Configuration['system']>, updatedBy: string): Observable<Configuration> {
        const config = this.localStorageService.getItem<Configuration>(this.CONFIG_KEY)
            || this.getDefaultConfiguration();

        config.system = { ...config.system, ...settings };
        return this.updateConfiguration(config, updatedBy);
    }

    /**
     * Update API configuration
     * Requirement: 20.4, 20.5
     */
    updateAPIConfiguration(apiConfig: Partial<Configuration['api']>, updatedBy: string): Observable<Configuration> {
        const config = this.localStorageService.getItem<Configuration>(this.CONFIG_KEY)
            || this.getDefaultConfiguration();

        config.api = { ...config.api, ...apiConfig };
        return this.updateConfiguration(config, updatedBy);
    }

    /**
     * Update alert configuration
     * Requirement: 20.6
     */
    updateAlertConfiguration(alertConfig: Partial<Configuration['alerts']>, updatedBy: string): Observable<Configuration> {
        const config = this.localStorageService.getItem<Configuration>(this.CONFIG_KEY)
            || this.getDefaultConfiguration();

        config.alerts = { ...config.alerts, ...alertConfig };
        return this.updateConfiguration(config, updatedBy);
    }

    /**
     * Update report configuration
     * Requirement: 20.8
     */
    updateReportConfiguration(reportConfig: Partial<Configuration['reports']>, updatedBy: string): Observable<Configuration> {
        const config = this.localStorageService.getItem<Configuration>(this.CONFIG_KEY)
            || this.getDefaultConfiguration();

        config.reports = { ...config.reports, ...reportConfig };
        return this.updateConfiguration(config, updatedBy);
    }

    /**
     * Switch operation mode
     * Requirement: 20.3
     */
    switchOperationMode(mode: OperationMode, updatedBy: string): Observable<Configuration> {
        return this.updateSystemSettings({ operation_mode: mode }, updatedBy);
    }

    /**
     * Backup configuration
     */
    backupConfiguration(): Observable<void> {
        const config = this.localStorageService.getItem<Configuration>(this.CONFIG_KEY);
        if (config) {
            const backups = this.localStorageService.getItem<any[]>(this.BACKUP_KEY) || [];
            backups.push({
                timestamp: new Date(),
                config: config
            });

            // Keep only last 10 backups
            if (backups.length > 10) {
                backups.splice(0, backups.length - 10);
            }

            this.localStorageService.setItem(this.BACKUP_KEY, backups);
        }
        return of(void 0).pipe(delay(200));
    }

    /**
     * Restore configuration from backup
     */
    restoreConfiguration(backupIndex: number): Observable<Configuration> {
        const backups = this.localStorageService.getItem<any[]>(this.BACKUP_KEY) || [];

        if (backupIndex < 0 || backupIndex >= backups.length) {
            throw new Error('Invalid backup index');
        }

        const backup = backups[backupIndex];
        const config = backup.config;

        this.localStorageService.setItem(this.CONFIG_KEY, config);
        this.configSubject.next(config);

        return of(config).pipe(delay(200));
    }

    /**
     * Get configuration backups
     */
    getBackups(): Observable<any[]> {
        const backups = this.localStorageService.getItem<any[]>(this.BACKUP_KEY) || [];
        return of(backups).pipe(delay(200));
    }

    /**
     * Validate configuration
     */
    private validateConfiguration(config: Configuration): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Validate company info
        if (!config.company_info.company_name) {
            errors.push('Company name is required');
        }
        if (!config.company_info.npwp) {
            errors.push('NPWP is required');
        }

        // Validate system settings
        if (config.system.session_timeout_minutes < 5) {
            errors.push('Session timeout must be at least 5 minutes');
        }
        if (config.system.low_stock_threshold < 0) {
            errors.push('Low stock threshold must be positive');
        }

        // Validate API configuration
        if (config.api.it_inventory_enabled && !config.api.it_inventory_url) {
            errors.push('IT Inventory URL is required when enabled');
        }
        if (config.api.ceisa_enabled && !config.api.ceisa_url) {
            errors.push('CEISA URL is required when enabled');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Reset to default configuration
     */
    resetToDefault(updatedBy: string): Observable<Configuration> {
        const config = this.getDefaultConfiguration();
        config.updated_by = updatedBy;
        this.localStorageService.setItem(this.CONFIG_KEY, config);
        this.configSubject.next(config);
        return of(config).pipe(delay(200));
    }
}
