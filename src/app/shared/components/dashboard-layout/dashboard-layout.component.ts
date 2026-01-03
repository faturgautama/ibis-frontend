import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';

/**
 * DashboardLayoutComponent (MainLayout/BaseLayout)
 * Komponen wrapper utama yang mengkomposisi Sidebar, Navbar, dan Content Area
 * Requirements: 8.1, 8.4, 8.5
 */
@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ToastModule,
    SidebarComponent,
    NavbarComponent
  ],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss']
})
export class DashboardLayoutComponent {
  constructor() { }

  /**
   * Computed property: Get navbar height in rem
   */
  get navbarHeight(): string {
    return '4.5rem';
  }

  /**
   * Computed property: Get content area margin top
   */
  get contentMarginTop(): string {
    return this.navbarHeight;
  }

  /**
   * Computed property: Get content area minimum height
   */
  get contentMinHeight(): string {
    return `calc(100vh - ${this.navbarHeight})`;
  }

  /**
   * Computed property: Get content area style object
   */
  get contentAreaStyle(): { [key: string]: string } {
    return {
      'margin-top': this.contentMarginTop,
      'min-height': this.contentMinHeight,
      'overflow-y': 'auto'
    };
  }
}
