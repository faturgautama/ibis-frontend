import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { ToastModule } from 'primeng/toast';

// Lucide icons
import { LucideAngularModule, Package, TriangleAlert, Clock, TrendingDown, TrendingUp } from 'lucide-angular';

// Services
import { StockBalanceService } from '../../services/stock-balance.service';
import { MessageService } from 'primeng/api';

// Models
import {
  StockBalance,
  StockHistory,
  StockAlert,
  StockAgingReport,
  AlertSeverity,
  getMovementTypeLabel
} from '../../models/stock-balance.model';

/**
 * Stock Balance View Component
 * Requirements: 7.1, 7.4, 7.5, 7.6, 7.7, 7.8
 */
@Component({
  selector: 'app-stock-balance-view',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    SelectModule,
    TabsModule,
    ToastModule,
    LucideAngularModule
  ],
  providers: [MessageService],
  template: `
    <div class="">
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <lucide-icon [img]="TrendingUpIcon" class="w-6 h-6 text-sky-600"></lucide-icon>
            <h1 class="text-2xl font-semibold text-gray-900">Stock Balance</h1>
          </div>
        </div>

        <!-- Search and Filters -->
        <div class="flex gap-4 mb-4">
          <div class="flex-1">
            <input 
              pInputText 
              [(ngModel)]="searchTerm" 
              (input)="onSearch()" 
              placeholder="Search by item code, name, warehouse..."
              class="w-full"
            />
          </div>
          <div *ngIf="rfidEnabled">
            <button pButton label="Scan RFID" icon="pi pi-qrcode" (click)="onRFIDScan()"></button>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <p-tabs [(value)]="activeTab" (onChange)="onTabChange()">
        <p-tablist>
          <p-tab value="balance">
            <div class="flex items-center gap-2">
              <lucide-icon [img]="PackageIcon" class="w-4 h-4"></lucide-icon>
              <span>Current Balance</span>
            </div>
          </p-tab>
          <p-tab value="alerts">
            <div class="flex items-center gap-2">
              <lucide-icon [img]="AlertTriangleIcon" class="w-4 h-4"></lucide-icon>
              <span>Alerts</span>
              <span *ngIf="unacknowledgedAlerts > 0" class="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                {{ unacknowledgedAlerts }}
              </span>
            </div>
          </p-tab>
          <p-tab value="expiring">
            <div class="flex items-center gap-2">
              <lucide-icon [img]="ClockIcon" class="w-4 h-4"></lucide-icon>
              <span>Expiring Items</span>
            </div>
          </p-tab>
          <p-tab value="aging">
            <div class="flex items-center gap-2">
              <lucide-icon [img]="TrendingDownIcon" class="w-4 h-4"></lucide-icon>
              <span>Stock Aging</span>
            </div>
          </p-tab>
          <p-tab value="history">
            <div class="flex items-center gap-2">
              <lucide-icon [img]="ClockIcon" class="w-4 h-4"></lucide-icon>
              <span>Movement History</span>
            </div>
          </p-tab>
        </p-tablist>

        <p-tabpanels>
          <p-tabpanel value="balance">
          
          <div class="bg-white rounded-lg ">
            <p-table
              [value]="filteredBalances"
              [paginator]="true"
              [rows]="20"
              [showCurrentPageReport]="true"
              currentPageReportTemplate="Showing {{ '{' }}first{{ '}' }} to {{ '{' }}last{{ '}' }} of {{ '{' }}totalRecords{{ '}' }} items"
              [rowsPerPageOptions]="[10, 20, 50]"
              [loading]="loading"
              styleClass="p-datatable-sm"
            >
              <ng-template pTemplate="header">
                <tr>
                  <th>Item Code</th>
                  <th>Item Name</th>
                  <th>Warehouse</th>
                  <th>Quantity</th>
                  <th>Reserved</th>
                  <th>Available</th>
                  <th>Value</th>
                  <th>Batch</th>
                  <th>Expiry</th>
                  <th>Location</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-balance>
                <tr>
                  <td>
                    <span class="font-medium">{{ balance.item_code }}</span>
                    <div *ngIf="balance.rfid_tag" class="text-xs text-gray-500">RFID: {{ balance.rfid_tag }}</div>
                  </td>
                  <td>{{ balance.item_name }}</td>
                  <td>
                    <div class="text-sm">{{ balance.warehouse_name }}</div>
                    <div class="text-xs text-gray-500">{{ balance.warehouse_code }}</div>
                  </td>
                  <td>
                    <span class="font-medium">{{ balance.quantity | number: '1.0-2' }}</span>
                    <span class="text-xs text-gray-500 ml-1">{{ balance.unit }}</span>
                  </td>
                  <td>
                    <span class="text-sm">{{ balance.reserved_quantity | number: '1.0-2' }}</span>
                  </td>
                  <td>
                    <span class="font-medium" [class.text-red-600]="balance.available_quantity < 100">
                      {{ balance.available_quantity | number: '1.0-2' }}
                    </span>
                  </td>
                  <td>
                    <span class="text-sm font-medium">{{ balance.total_value | number: '1.0-0' }}</span>
                  </td>
                  <td>
                    <span class="text-xs">{{ balance.batch_number || '-' }}</span>
                  </td>
                  <td>
                    <span *ngIf="balance.expiry_date" class="text-xs" [class.text-red-600]="isExpiringSoon(balance.expiry_date)">
                      {{ balance.expiry_date | date: 'dd MMM yyyy' }}
                    </span>
                    <span *ngIf="!balance.expiry_date" class="text-xs text-gray-400">-</span>
                  </td>
                  <td>
                    <span class="text-xs">{{ balance.location_code || '-' }}</span>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="10" class="text-center py-8 text-gray-500">
                    No stock balance found
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </div>
          </p-tabpanel>

          <p-tabpanel value="alerts">
            <div class="bg-white rounded-lg ">
            <p-table
              [value]="alerts"
              [paginator]="true"
              [rows]="20"
              [loading]="loading"
              styleClass="p-datatable-sm"
            >
              <ng-template pTemplate="header">
                <tr>
                  <th>Severity</th>
                  <th>Type</th>
                  <th>Item</th>
                  <th>Warehouse</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-alert>
                <tr [class.bg-gray-50]="alert.is_acknowledged">
                  <td>
                    <p-tag 
                      [value]="alert.severity" 
                      [severity]="getSeverityTag(alert.severity)"
                    />
                  </td>
                  <td>
                    <span class="text-sm">{{ alert.alert_type }}</span>
                  </td>
                  <td>
                    <div class="text-sm font-medium">{{ alert.item_name }}</div>
                    <div class="text-xs text-gray-500">{{ alert.item_code }}</div>
                  </td>
                  <td>
                    <span class="text-sm">{{ alert.warehouse_name }}</span>
                  </td>
                  <td>
                    <span class="text-sm">{{ alert.message }}</span>
                  </td>
                  <td>
                    <span class="text-xs">{{ alert.created_at | date: 'dd MMM yyyy HH:mm' }}</span>
                  </td>
                  <td>
                    <button
                      *ngIf="!alert.is_acknowledged"
                      pButton
                      label="Acknowledge"
                      class="p-button-sm p-button-text"
                      (click)="acknowledgeAlert(alert)"
                    ></button>
                    <span *ngIf="alert.is_acknowledged" class="text-xs text-gray-500">Acknowledged</span>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="7" class="text-center py-8 text-gray-500">
                    No alerts
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </div>
          </p-tabpanel>

          <p-tabpanel value="expiring">
            <div class="bg-white rounded-lg ">
            <p-table
              [value]="expiringItems"
              [paginator]="true"
              [rows]="20"
              [loading]="loading"
              styleClass="p-datatable-sm"
            >
              <ng-template pTemplate="header">
                <tr>
                  <th>Item</th>
                  <th>Warehouse</th>
                  <th>Quantity</th>
                  <th>Batch</th>
                  <th>Expiry Date</th>
                  <th>Days Until Expiry</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-item>
                <tr>
                  <td>
                    <div class="text-sm font-medium">{{ item.item_name }}</div>
                    <div class="text-xs text-gray-500">{{ item.item_code }}</div>
                  </td>
                  <td>{{ item.warehouse_name }}</td>
                  <td>
                    <span class="font-medium">{{ item.quantity | number: '1.0-2' }}</span>
                    <span class="text-xs text-gray-500 ml-1">{{ item.unit }}</span>
                  </td>
                  <td>{{ item.batch_number }}</td>
                  <td>
                    <span class="text-sm" [class.text-red-600]="getDaysUntilExpiry(item.expiry_date) <= 7">
                      {{ item.expiry_date | date: 'dd MMM yyyy' }}
                    </span>
                  </td>
                  <td>
                    <span 
                      class="font-medium"
                      [class.text-red-600]="getDaysUntilExpiry(item.expiry_date) <= 7"
                      [class.text-orange-600]="getDaysUntilExpiry(item.expiry_date) > 7 && getDaysUntilExpiry(item.expiry_date) <= 14"
                    >
                      {{ getDaysUntilExpiry(item.expiry_date) }} days
                    </span>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="6" class="text-center py-8 text-gray-500">
                    No expiring items
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </div>
          </p-tabpanel>

          <p-tabpanel value="aging">
            <div class="bg-white rounded-lg ">
            <p-table
              [value]="agingReport"
              [paginator]="true"
              [rows]="20"
              [loading]="loading"
              styleClass="p-datatable-sm"
            >
              <ng-template pTemplate="header">
                <tr>
                  <th>Item</th>
                  <th>Warehouse</th>
                  <th>Total Qty</th>
                  <th>0-30 Days</th>
                  <th>31-60 Days</th>
                  <th>61-90 Days</th>
                  <th>91-180 Days</th>
                  <th>Over 180 Days</th>
                  <th>Avg Age</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-report>
                <tr>
                  <td>
                    <div class="text-sm font-medium">{{ report.item_name }}</div>
                    <div class="text-xs text-gray-500">{{ report.item_code }}</div>
                  </td>
                  <td>{{ report.warehouse_name }}</td>
                  <td>
                    <span class="font-medium">{{ report.total_quantity | number: '1.0-0' }}</span>
                  </td>
                  <td>{{ report.aging_buckets['0-30_days'].quantity | number: '1.0-0' }}</td>
                  <td>{{ report.aging_buckets['31-60_days'].quantity | number: '1.0-0' }}</td>
                  <td>{{ report.aging_buckets['61-90_days'].quantity | number: '1.0-0' }}</td>
                  <td>{{ report.aging_buckets['91-180_days'].quantity | number: '1.0-0' }}</td>
                  <td>
                    <span [class.text-red-600]="report.aging_buckets['over_180_days'].quantity > 0">
                      {{ report.aging_buckets['over_180_days'].quantity | number: '1.0-0' }}
                    </span>
                  </td>
                  <td>
                    <span class="text-sm">{{ report.average_age_days }} days</span>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="9" class="text-center py-8 text-gray-500">
                    No aging data
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </div>
          </p-tabpanel>

          <p-tabpanel value="history">
            <div class="bg-white rounded-lg ">
            <p-table
              [value]="history"
              [paginator]="true"
              [rows]="20"
              [loading]="loading"
              styleClass="p-datatable-sm"
            >
              <ng-template pTemplate="header">
                <tr>
                  <th>Date</th>
                  <th>Item</th>
                  <th>Warehouse</th>
                  <th>Movement Type</th>
                  <th>Reference</th>
                  <th>Qty Before</th>
                  <th>Change</th>
                  <th>Qty After</th>
                  <th>User</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-h>
                <tr>
                  <td>
                    <span class="text-xs">{{ h.movement_date | date: 'dd MMM yyyy HH:mm' }}</span>
                  </td>
                  <td>
                    <div class="text-sm">{{ h.item_name }}</div>
                    <div class="text-xs text-gray-500">{{ h.item_code }}</div>
                  </td>
                  <td>{{ h.warehouse_name }}</td>
                  <td>
                    <span class="text-xs">{{ getMovementTypeLabel(h.movement_type) }}</span>
                  </td>
                  <td>
                    <span class="text-xs">{{ h.reference_number }}</span>
                  </td>
                  <td>{{ h.quantity_before | number: '1.0-2' }}</td>
                  <td>
                    <span 
                      [class.text-green-600]="h.quantity_change > 0"
                      [class.text-red-600]="h.quantity_change < 0"
                      class="font-medium"
                    >
                      {{ h.quantity_change > 0 ? '+' : '' }}{{ h.quantity_change | number: '1.0-2' }}
                    </span>
                  </td>
                  <td>{{ h.quantity_after | number: '1.0-2' }}</td>
                  <td>
                    <span class="text-xs">{{ h.created_by }}</span>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="9" class="text-center py-8 text-gray-500">
                    No movement history
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </div>
          </p-tabpanel>
        </p-tabpanels>
      </p-tabs>
    </div>

    <p-toast />
  `
})
export class StockBalanceViewComponent implements OnInit {
  private stockBalanceService = inject(StockBalanceService);
  private messageService = inject(MessageService);

  // Icons
  PackageIcon = Package;
  AlertTriangleIcon = TriangleAlert;
  ClockIcon = Clock;
  TrendingDownIcon = TrendingDown;
  TrendingUpIcon = TrendingUp;

  balances: StockBalance[] = [];
  filteredBalances: StockBalance[] = [];
  alerts: StockAlert[] = [];
  expiringItems: StockBalance[] = [];
  agingReport: StockAgingReport[] = [];
  history: StockHistory[] = [];

  loading = false;
  searchTerm = '';
  activeTab = 'balance';
  unacknowledgedAlerts = 0;
  rfidEnabled = true; // In production mode, this would be configurable

  ngOnInit(): void {
    this.loadData();
    this.subscribeToRealTimeUpdates();
  }

  loadData(): void {
    this.loading = true;

    // Load balances
    this.stockBalanceService.getAllBalances().subscribe({
      next: (balances) => {
        this.balances = balances;
        this.filteredBalances = balances;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load stock balances'
        });
        this.loading = false;
      }
    });

    // Load alerts
    this.stockBalanceService.getAlerts().subscribe({
      next: (alerts) => {
        this.alerts = alerts;
        this.unacknowledgedAlerts = alerts.filter(a => !a.is_acknowledged).length;
      }
    });

    // Load expiring items
    this.stockBalanceService.getExpiringItems(30).subscribe({
      next: (items) => {
        this.expiringItems = items;
      }
    });

    // Load aging report
    this.stockBalanceService.getStockAgingReport().subscribe({
      next: (report) => {
        this.agingReport = report;
      }
    });

    // Load history
    this.stockBalanceService.getHistory(undefined, undefined, 100).subscribe({
      next: (history) => {
        this.history = history;
      }
    });
  }

  subscribeToRealTimeUpdates(): void {
    this.stockBalanceService.getBalanceUpdates().subscribe({
      next: (balance) => {
        if (balance) {
          this.messageService.add({
            severity: 'info',
            summary: 'Stock Updated',
            detail: `${balance.item_name} balance updated in ${balance.warehouse_name}`
          });
          this.loadData(); // Reload data
        }
      }
    });
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredBalances = this.balances.filter(b =>
      b.item_code.toLowerCase().includes(term) ||
      b.item_name.toLowerCase().includes(term) ||
      b.warehouse_code.toLowerCase().includes(term) ||
      b.warehouse_name.toLowerCase().includes(term)
    );
  }

  onTabChange(): void {
    // Reload data when switching tabs
    if (this.activeTab === 'alerts') {
      this.stockBalanceService.getAlerts().subscribe({
        next: (alerts) => {
          this.alerts = alerts;
        }
      });
    }
  }

  onRFIDScan(): void {
    // In a real app, this would trigger RFID scanner
    const rfidTag = prompt('Enter RFID tag:');
    if (rfidTag) {
      this.stockBalanceService.searchByRFID(rfidTag).subscribe({
        next: (balance) => {
          if (balance) {
            this.filteredBalances = [balance];
            this.messageService.add({
              severity: 'success',
              summary: 'Found',
              detail: `Found ${balance.item_name} in ${balance.warehouse_name}`
            });
          } else {
            this.messageService.add({
              severity: 'warn',
              summary: 'Not Found',
              detail: 'No item found with this RFID tag'
            });
          }
        }
      });
    }
  }

  acknowledgeAlert(alert: StockAlert): void {
    this.stockBalanceService.acknowledgeAlert(alert.id, 'admin').subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Alert acknowledged'
        });
        this.loadData();
      }
    });
  }

  isExpiringSoon(expiryDate: Date): boolean {
    const days = this.getDaysUntilExpiry(expiryDate);
    return days <= 30;
  }

  getDaysUntilExpiry(expiryDate: Date): number {
    const today = new Date();
    const diffTime = new Date(expiryDate).getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getSeverityTag(severity: AlertSeverity): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    const map: Record<AlertSeverity, 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast'> = {
      [AlertSeverity.INFO]: 'info',
      [AlertSeverity.WARNING]: 'warn',
      [AlertSeverity.CRITICAL]: 'danger'
    };
    return map[severity];
  }

  getMovementTypeLabel(type: any): string {
    return getMovementTypeLabel(type);
  }
}
