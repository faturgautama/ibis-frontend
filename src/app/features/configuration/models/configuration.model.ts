/**
 * Configuration Models
 * Requirements: 20.1-20.9
 */

export enum KawasanType {
    KEK = 'KEK',
    KB = 'KB',
    KITE = 'KITE'
}

export enum OperationMode {
    DEMO = 'DEMO',
    PRODUCTION = 'PRODUCTION'
}

export interface CompanyInfo {
    company_name: string;
    company_address: string;
    company_phone: string;
    company_email: string;
    npwp: string;
    kawasan_type: KawasanType;
    kawasan_license_number?: string;
    kawasan_license_expiry?: Date;
}

export interface SystemConfiguration {
    operation_mode: OperationMode;
    session_timeout_minutes: number;
    low_stock_threshold: number;
    expiry_warning_days: number;
    auto_backup_enabled: boolean;
    auto_backup_interval_hours: number;
    language: string;
    timezone: string;
    date_format: string;
    currency: string;
}

export interface APIConfiguration {
    it_inventory_enabled: boolean;
    it_inventory_url?: string;
    it_inventory_api_key?: string;
    it_inventory_timeout_seconds: number;
    ceisa_enabled: boolean;
    ceisa_url?: string;
    ceisa_api_key?: string;
    ceisa_timeout_seconds: number;
    sync_retry_attempts: number;
    sync_retry_delay_seconds: number;
}

export interface AlertConfiguration {
    email_notifications_enabled: boolean;
    smtp_host?: string;
    smtp_port?: number;
    smtp_username?: string;
    smtp_password?: string;
    smtp_from_email?: string;
    sound_notifications_enabled: boolean;
    low_stock_alert_enabled: boolean;
    expiry_alert_enabled: boolean;
    license_expiry_alert_enabled: boolean;
    sync_failure_alert_enabled: boolean;
}

export interface ReportConfiguration {
    default_report_format: 'PDF' | 'EXCEL';
    report_logo_url?: string;
    report_footer_text?: string;
    scheduled_reports_enabled: boolean;
    report_retention_days: number;
}

export interface Configuration {
    company_info: CompanyInfo;
    system: SystemConfiguration;
    api: APIConfiguration;
    alerts: AlertConfiguration;
    reports: ReportConfiguration;
    last_updated: Date;
    updated_by: string;
}
