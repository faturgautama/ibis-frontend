import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabsModule } from 'primeng/tabs';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { PasswordModule } from 'primeng/password';
import { LucideAngularModule, Settings, Save, Download, RotateCcw } from 'lucide-angular';
import { ConfigurationService } from '../../services/configuration.service';
import { Configuration, KawasanType, OperationMode } from '../../models/configuration.model';

/**
 * Configuration Panel Component
 * Requirements: 20.1-20.9
 */
@Component({
    selector: 'app-configuration-panel',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TabsModule,
        InputTextModule,
        InputNumberModule,
        SelectModule,
        CheckboxModule,
        ButtonModule,
        DatePickerModule,
        PasswordModule,
        LucideAngularModule
    ],
    template: `
        <div class="main-layout">
            <!-- Page Header -->
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                        <lucide-icon [img]="SettingsIcon" class="w-6 h-6 text-sky-600"></lucide-icon>
                        System Configuration
                    </h1>
                    <p class="text-sm text-gray-600 mt-1">Configure system settings and integrations</p>
                </div>
            </div>

            <!-- Configuration Card -->
            <div class="bg-white rounded-lg shadow-sm p-6">
                <p-tabs>
                    <!-- Company Info Tab -->
                    <p-tabpanel header="Company Information">
                        <div class="space-y-4 py-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                                    <input pInputText [(ngModel)]="config.company_info.company_name" class="w-full" />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">NPWP *</label>
                                    <input pInputText [(ngModel)]="config.company_info.npwp" class="w-full" />
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                <input pInputText [(ngModel)]="config.company_info.company_address" class="w-full" />
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                    <input pInputText [(ngModel)]="config.company_info.company_phone" class="w-full" />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input pInputText type="email" [(ngModel)]="config.company_info.company_email" class="w-full" />
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Kawasan Type *</label>
                                    <p-select 
                                        [(ngModel)]="config.company_info.kawasan_type"
                                        [options]="kawasanTypes"
                                        optionLabel="label"
                                        optionValue="value"
                                        class="w-full"
                                    ></p-select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                                    <input pInputText [(ngModel)]="config.company_info.kawasan_license_number" class="w-full" />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">License Expiry</label>
                                    <p-datepicker 
                                        [(ngModel)]="config.company_info.kawasan_license_expiry"
                                        dateFormat="dd/mm/yy"
                                        [showIcon]="true"
                                        class="w-full"
                                    ></p-datepicker>
                                </div>
                            </div>
                        </div>
                    </p-tabpanel>

                    <!-- System Settings Tab -->
                    <p-tabpanel header="System Settings">
                        <div class="space-y-4 py-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Operation Mode</label>
                                    <p-select 
                                        [(ngModel)]="config.system.operation_mode"
                                        [options]="operationModes"
                                        optionLabel="label"
                                        optionValue="value"
                                        class="w-full"
                                    ></p-select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                                    <p-inputNumber 
                                        [(ngModel)]="config.system.session_timeout_minutes"
                                        [min]="5"
                                        [max]="480"
                                        class="w-full"
                                    ></p-inputNumber>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Low Stock Threshold</label>
                                    <p-inputNumber 
                                        [(ngModel)]="config.system.low_stock_threshold"
                                        [min]="0"
                                        class="w-full"
                                    ></p-inputNumber>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Expiry Warning (days)</label>
                                    <p-inputNumber 
                                        [(ngModel)]="config.system.expiry_warning_days"
                                        [min]="1"
                                        [max]="365"
                                        class="w-full"
                                    ></p-inputNumber>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Language</label>
                                    <p-select 
                                        [(ngModel)]="config.system.language"
                                        [options]="languages"
                                        optionLabel="label"
                                        optionValue="value"
                                        class="w-full"
                                    ></p-select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                                    <p-select 
                                        [(ngModel)]="config.system.currency"
                                        [options]="currencies"
                                        optionLabel="label"
                                        optionValue="value"
                                        class="w-full"
                                    ></p-select>
                                </div>
                            </div>

                            <div class="flex items-center gap-3">
                                <p-checkbox 
                                    [(ngModel)]="config.system.auto_backup_enabled"
                                    [binary]="true"
                                    inputId="autoBackup"
                                ></p-checkbox>
                                <label for="autoBackup" class="text-sm font-medium text-gray-700">
                                    Enable Auto Backup
                                </label>
                            </div>
                        </div>
                    </p-tabpanel>

                    <!-- API Configuration Tab -->
                    <p-tabpanel header="API Configuration">
                        <div class="space-y-6 py-4">
                            <!-- IT Inventory -->
                            <div class="border border-gray-200 rounded-lg p-4">
                                <div class="flex items-center gap-3 mb-4">
                                    <p-checkbox 
                                        [(ngModel)]="config.api.it_inventory_enabled"
                                        [binary]="true"
                                        inputId="itInventory"
                                    ></p-checkbox>
                                    <label for="itInventory" class="text-lg font-semibold text-gray-900">
                                        IT Inventory Integration
                                    </label>
                                </div>

                                <div class="space-y-3" *ngIf="config.api.it_inventory_enabled">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">API URL</label>
                                        <input pInputText [(ngModel)]="config.api.it_inventory_url" class="w-full" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                                        <p-password 
                                            [(ngModel)]="config.api.it_inventory_api_key"
                                            [feedback]="false"
                                            [toggleMask]="true"
                                            class="w-full"
                                        ></p-password>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Timeout (seconds)</label>
                                        <p-inputNumber 
                                            [(ngModel)]="config.api.it_inventory_timeout_seconds"
                                            [min]="5"
                                            [max]="300"
                                            class="w-full"
                                        ></p-inputNumber>
                                    </div>
                                </div>
                            </div>

                            <!-- CEISA -->
                            <div class="border border-gray-200 rounded-lg p-4">
                                <div class="flex items-center gap-3 mb-4">
                                    <p-checkbox 
                                        [(ngModel)]="config.api.ceisa_enabled"
                                        [binary]="true"
                                        inputId="ceisa"
                                    ></p-checkbox>
                                    <label for="ceisa" class="text-lg font-semibold text-gray-900">
                                        CEISA Integration
                                    </label>
                                </div>

                                <div class="space-y-3" *ngIf="config.api.ceisa_enabled">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">API URL</label>
                                        <input pInputText [(ngModel)]="config.api.ceisa_url" class="w-full" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                                        <p-password 
                                            [(ngModel)]="config.api.ceisa_api_key"
                                            [feedback]="false"
                                            [toggleMask]="true"
                                            class="w-full"
                                        ></p-password>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Timeout (seconds)</label>
                                        <p-inputNumber 
                                            [(ngModel)]="config.api.ceisa_timeout_seconds"
                                            [min]="5"
                                            [max]="300"
                                            class="w-full"
                                        ></p-inputNumber>
                                    </div>
                                </div>
                            </div>

                            <!-- Sync Settings -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Retry Attempts</label>
                                    <p-inputNumber 
                                        [(ngModel)]="config.api.sync_retry_attempts"
                                        [min]="1"
                                        [max]="10"
                                        class="w-full"
                                    ></p-inputNumber>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Retry Delay (seconds)</label>
                                    <p-inputNumber 
                                        [(ngModel)]="config.api.sync_retry_delay_seconds"
                                        [min]="1"
                                        [max]="60"
                                        class="w-full"
                                    ></p-inputNumber>
                                </div>
                            </div>
                        </div>
                    </p-tabpanel>

                    <!-- Alert Configuration Tab -->
                    <p-tabpanel header="Alerts & Notifications">
                        <div class="space-y-4 py-4">
                            <div class="space-y-3">
                                <div class="flex items-center gap-3">
                                    <p-checkbox 
                                        [(ngModel)]="config.alerts.sound_notifications_enabled"
                                        [binary]="true"
                                        inputId="soundNotif"
                                    ></p-checkbox>
                                    <label for="soundNotif" class="text-sm font-medium text-gray-700">
                                        Enable Sound Notifications
                                    </label>
                                </div>

                                <div class="flex items-center gap-3">
                                    <p-checkbox 
                                        [(ngModel)]="config.alerts.low_stock_alert_enabled"
                                        [binary]="true"
                                        inputId="lowStockAlert"
                                    ></p-checkbox>
                                    <label for="lowStockAlert" class="text-sm font-medium text-gray-700">
                                        Low Stock Alerts
                                    </label>
                                </div>

                                <div class="flex items-center gap-3">
                                    <p-checkbox 
                                        [(ngModel)]="config.alerts.expiry_alert_enabled"
                                        [binary]="true"
                                        inputId="expiryAlert"
                                    ></p-checkbox>
                                    <label for="expiryAlert" class="text-sm font-medium text-gray-700">
                                        Expiry Alerts
                                    </label>
                                </div>

                                <div class="flex items-center gap-3">
                                    <p-checkbox 
                                        [(ngModel)]="config.alerts.license_expiry_alert_enabled"
                                        [binary]="true"
                                        inputId="licenseAlert"
                                    ></p-checkbox>
                                    <label for="licenseAlert" class="text-sm font-medium text-gray-700">
                                        License Expiry Alerts
                                    </label>
                                </div>

                                <div class="flex items-center gap-3">
                                    <p-checkbox 
                                        [(ngModel)]="config.alerts.sync_failure_alert_enabled"
                                        [binary]="true"
                                        inputId="syncAlert"
                                    ></p-checkbox>
                                    <label for="syncAlert" class="text-sm font-medium text-gray-700">
                                        Sync Failure Alerts
                                    </label>
                                </div>
                            </div>

                            <div class="border-t border-gray-200 pt-4 mt-4">
                                <h3 class="text-lg font-semibold text-gray-900 mb-3">Email Notifications</h3>
                                
                                <div class="flex items-center gap-3 mb-4">
                                    <p-checkbox 
                                        [(ngModel)]="config.alerts.email_notifications_enabled"
                                        [binary]="true"
                                        inputId="emailNotif"
                                    ></p-checkbox>
                                    <label for="emailNotif" class="text-sm font-medium text-gray-700">
                                        Enable Email Notifications
                                    </label>
                                </div>

                                <div class="space-y-3" *ngIf="config.alerts.email_notifications_enabled">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                                            <input pInputText [(ngModel)]="config.alerts.smtp_host" class="w-full" />
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                                            <p-inputNumber [(ngModel)]="config.alerts.smtp_port" class="w-full"></p-inputNumber>
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
                                            <input pInputText [(ngModel)]="config.alerts.smtp_username" class="w-full" />
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                            <p-password 
                                                [(ngModel)]="config.alerts.smtp_password"
                                                [feedback]="false"
                                                [toggleMask]="true"
                                                class="w-full"
                                            ></p-password>
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                                        <input pInputText type="email" [(ngModel)]="config.alerts.smtp_from_email" class="w-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </p-tabpanel>

                    <!-- Report Configuration Tab -->
                    <p-tabpanel header="Reports">
                        <div class="space-y-4 py-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Default Report Format</label>
                                <p-select 
                                    [(ngModel)]="config.reports.default_report_format"
                                    [options]="reportFormats"
                                    optionLabel="label"
                                    optionValue="value"
                                    class="w-full"
                                ></p-select>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Report Logo URL</label>
                                <input pInputText [(ngModel)]="config.reports.report_logo_url" class="w-full" />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Report Footer Text</label>
                                <input pInputText [(ngModel)]="config.reports.report_footer_text" class="w-full" />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Report Retention (days)</label>
                                <p-inputNumber 
                                    [(ngModel)]="config.reports.report_retention_days"
                                    [min]="1"
                                    [max]="365"
                                    class="w-full"
                                ></p-inputNumber>
                            </div>

                            <div class="flex items-center gap-3">
                                <p-checkbox 
                                    [(ngModel)]="config.reports.scheduled_reports_enabled"
                                    [binary]="true"
                                    inputId="scheduledReports"
                                ></p-checkbox>
                                <label for="scheduledReports" class="text-sm font-medium text-gray-700">
                                    Enable Scheduled Reports
                                </label>
                            </div>
                        </div>
                    </p-tabpanel>
                </p-tabs>

                <!-- Action Buttons -->
                <div class="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                    <button 
                        pButton 
                        label="Save Configuration" 
                        (click)="saveConfiguration()"
                        class="p-button-primary"
                    >
                        <lucide-icon [img]="SaveIcon" class="w-4 h-4"></lucide-icon>
                    </button>
                    <button 
                        pButton 
                        label="Backup" 
                        (click)="backupConfiguration()"
                        class="p-button-secondary"
                    >
                        <lucide-icon [img]="DownloadIcon" class="w-4 h-4"></lucide-icon>
                    </button>
                    <button 
                        pButton 
                        label="Reset to Default" 
                        (click)="resetToDefault()"
                        class="p-button-warning"
                    >
                        <lucide-icon [img]="RotateCcwIcon" class="w-4 h-4"></lucide-icon>
                    </button>
                </div>
            </div>
        </div>
    `
})
export class ConfigurationPanelComponent implements OnInit {
    private configService = inject(ConfigurationService);

    // Lucide Icons
    SettingsIcon = Settings;
    SaveIcon = Save;
    DownloadIcon = Download;
    RotateCcwIcon = RotateCcw;

    config!: Configuration;

    kawasanTypes = [
        { label: 'KEK (Kawasan Ekonomi Khusus)', value: KawasanType.KEK },
        { label: 'KB (Kawasan Berikat)', value: KawasanType.KB },
        { label: 'KITE (Kemudahan Impor Tujuan Ekspor)', value: KawasanType.KITE }
    ];

    operationModes = [
        { label: 'Demo Mode', value: OperationMode.DEMO },
        { label: 'Production Mode', value: OperationMode.PRODUCTION }
    ];

    languages = [
        { label: 'Indonesian', value: 'id' },
        { label: 'English', value: 'en' }
    ];

    currencies = [
        { label: 'IDR (Indonesian Rupiah)', value: 'IDR' },
        { label: 'USD (US Dollar)', value: 'USD' }
    ];

    reportFormats = [
        { label: 'Excel', value: 'EXCEL' },
        { label: 'PDF', value: 'PDF' }
    ];

    ngOnInit(): void {
        this.loadConfiguration();
    }

    loadConfiguration(): void {
        this.configService.getConfiguration().subscribe(config => {
            this.config = config;
        });
    }

    saveConfiguration(): void {
        this.configService.updateConfiguration(this.config, 'current_user').subscribe({
            next: () => {
                console.log('Configuration saved successfully');
                alert('Configuration saved successfully');
            },
            error: (err) => {
                console.error('Save failed:', err);
                alert('Failed to save configuration: ' + err.message);
            }
        });
    }

    backupConfiguration(): void {
        this.configService.backupConfiguration().subscribe(() => {
            console.log('Configuration backed up');
            alert('Configuration backed up successfully');
        });
    }

    resetToDefault(): void {
        if (confirm('Are you sure you want to reset to default configuration?')) {
            this.configService.resetToDefault('current_user').subscribe(config => {
                this.config = config;
                alert('Configuration reset to default');
            });
        }
    }
}
