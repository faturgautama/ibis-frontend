import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Dashboard Component
 * 
 * Main dashboard page (placeholder for now)
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8">
      <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p class="mt-4 text-gray-600">Welcome to IBIS - Integrated Bonded Inventory System</p>
    </div>
  `
})
export class DashboardComponent { }
