import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';
import { DashboardService, DashboardMetrics } from '../../services/dashboard.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

/**
 * Main Dashboard Component
 * Requirements: 16.1-16.9
 */
@Component({
    selector: 'app-main-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        CardModule,
        ChartModule,
        TableModule,
        TagModule,
        TimelineModule
    ],
    template: `
        <div class="p-6 main-layout">
            <h1 class="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

            <!-- Metrics Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-sm text-gray-600 mb-1">Total Stock Value</p>
                            <p class="text-2xl font-bold text-gray-900">
                                {{ formatCurrency(metrics.total_stock_value) }}
                            </p>
                        </div>
                        <i class="pi pi-dollar text-3xl text-blue-500"></i>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-sm text-gray-600 mb-1">Total Items</p>
                            <p class="text-2xl font-bold text-gray-900">{{ metrics.total_items }}</p>
                        </div>
                        <i class="pi pi-box text-3xl text-green-500"></i>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-sm text-gray-600 mb-1">Low Stock Alerts</p>
                            <p class="text-2xl font-bold text-gray-900">{{ metrics.low_stock_count }}</p>
                        </div>
                        <i class="pi pi-exclamation-triangle text-3xl text-yellow-500"></i>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-sm text-gray-600 mb-1">Expiring Soon</p>
                            <p class="text-2xl font-bold text-gray-900">{{ metrics.expiring_items_count }}</p>
                        </div>
                        <i class="pi pi-calendar-times text-3xl text-red-500"></i>
                    </div>
                </div>
            </div>

            <!-- Charts Row -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <!-- Stock Movement Trends -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Stock Movement Trends (30 Days)</h3>
                    <p-chart type="line" [data]="movementChartData" [options]="chartOptions"></p-chart>
                </div>

                <!-- Warehouse Utilization -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Warehouse Utilization</h3>
                    <p-chart type="bar" [data]="utilizationChartData" [options]="chartOptions"></p-chart>
                </div>
            </div>

            <!-- Production Efficiency -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Production Efficiency (6 Months)</h3>
                <p-chart type="bar" [data]="efficiencyChartData" [options]="chartOptions"></p-chart>
            </div>

            <!-- Bottom Row -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Pending Transactions -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Pending Transactions</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                            <span class="text-gray-700">Pending Inbound</span>
                            <span class="font-bold text-blue-600">{{ metrics.pending_inbound }}</span>
                        </div>
                        <div class="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <span class="text-gray-700">Pending Outbound</span>
                            <span class="font-bold text-green-600">{{ metrics.pending_outbound }}</span>
                        </div>
                        <div class="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                            <span class="text-gray-700">Pending Production</span>
                            <span class="font-bold text-purple-600">{{ metrics.pending_production }}</span>
                        </div>
                    </div>
                </div>

                <!-- Recent Activities -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
                    <div class="space-y-2 max-h-64 overflow-y-auto">
                        <div *ngFor="let activity of recentActivities" 
                             class="flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
                            <i class="pi pi-circle-fill text-xs text-blue-500 mt-1"></i>
                            <div class="flex-1">
                                <p class="text-sm text-gray-900">{{ activity.movement_type }}</p>
                                <p class="text-xs text-gray-600">
                                    {{ activity.item_name }} - {{ activity.quantity_change }} {{ activity.unit }}
                                </p>
                                <p class="text-xs text-gray-500">{{ activity.movement_date | date:'short' }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Auto-refresh indicator -->
            <div class="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 text-sm text-gray-600">
                <i class="pi pi-sync mr-2"></i>
                Auto-refresh: {{ countdown }}s
            </div>
        </div>
    `
})
export class MainDashboardComponent implements OnInit, OnDestroy {
    private dashboardService = inject(DashboardService);
    private refreshSubscription?: Subscription;
    private countdownSubscription?: Subscription;

    metrics: DashboardMetrics = {
        total_stock_value: 0,
        total_items: 0,
        total_warehouses: 0,
        low_stock_count: 0,
        expiring_items_count: 0,
        pending_inbound: 0,
        pending_outbound: 0,
        pending_production: 0
    };

    recentActivities: any[] = [];
    countdown = 300; // 5 minutes

    movementChartData: any;
    utilizationChartData: any;
    efficiencyChartData: any;
    chartOptions: any;

    ngOnInit(): void {
        this.initChartOptions();
        this.loadDashboardData();
        this.startAutoRefresh();
    }

    ngOnDestroy(): void {
        this.refreshSubscription?.unsubscribe();
        this.countdownSubscription?.unsubscribe();
    }

    loadDashboardData(): void {
        // Load metrics
        this.dashboardService.getDashboardMetrics().subscribe(metrics => {
            this.metrics = metrics;
        });

        // Load stock movement trends
        this.dashboardService.getStockMovementTrends(30).subscribe(trends => {
            this.movementChartData = {
                labels: trends.map(t => new Date(t.date).toLocaleDateString()),
                datasets: [
                    {
                        label: 'Inbound',
                        data: trends.map(t => t.inbound),
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Outbound',
                        data: trends.map(t => t.outbound),
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Production',
                        data: trends.map(t => t.production),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4
                    }
                ]
            };
        });

        // Load warehouse utilization
        this.dashboardService.getWarehouseUtilization().subscribe(utilization => {
            this.utilizationChartData = {
                labels: utilization.map(u => u.warehouse_name),
                datasets: [
                    {
                        label: 'Utilization %',
                        data: utilization.map(u => u.utilization_percentage),
                        backgroundColor: '#3b82f6'
                    }
                ]
            };
        });

        // Load production efficiency
        this.dashboardService.getProductionEfficiency(6).subscribe(efficiency => {
            this.efficiencyChartData = {
                labels: efficiency.map(e => e.period),
                datasets: [
                    {
                        label: 'Efficiency %',
                        data: efficiency.map(e => e.efficiency_percentage),
                        backgroundColor: '#10b981'
                    },
                    {
                        label: 'Scrap %',
                        data: efficiency.map(e => e.scrap_percentage),
                        backgroundColor: '#ef4444'
                    }
                ]
            };
        });

        // Load recent activities
        this.dashboardService.getRecentActivities(10).subscribe(activities => {
            this.recentActivities = activities;
        });
    }

    startAutoRefresh(): void {
        // Refresh every 5 minutes
        this.refreshSubscription = interval(300000).pipe(
            switchMap(() => {
                this.loadDashboardData();
                return [];
            })
        ).subscribe();

        // Countdown timer
        this.countdown = 300;
        this.countdownSubscription = interval(1000).subscribe(() => {
            this.countdown--;
            if (this.countdown <= 0) {
                this.countdown = 300;
            }
        });
    }

    initChartOptions(): void {
        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        };
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    }
}
