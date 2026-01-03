import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Subject, takeUntil } from 'rxjs';
import { NavigationService, MenuItem } from '../../../core/services/navigation.service';

/**
 * SidebarComponent
 * Komponen sidebar navigasi dengan kemampuan collapse/expand
 * Requirements: 8.1, 8.2, 8.5
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  toggleSidebar = true;
  menuItems: MenuItem[] = [];

  constructor(
    private navigationService: NavigationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.navigationService.toggleDashboardSidebar
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.toggleSidebar = state;
      });

    this.menuItems = this.navigationService.getMenuItems();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Computed property: Get sidebar width class based on toggle state
   */
  get sidebarWidthClass(): string {
    return this.toggleSidebar ? 'w-80' : 'w-20';
  }

  /**
   * Computed property: Get toggle icon based on sidebar state
   */
  get toggleIcon(): string {
    return this.toggleSidebar ? 'pi pi-angle-double-left' : 'pi pi-angle-double-right';
  }

  /**
   * Computed property: Get menu alignment class based on toggle state
   */
  get menuAlignmentClass(): string {
    return this.toggleSidebar ? 'justify-start' : 'justify-center';
  }

  /**
   * Computed property: Check if sidebar is expanded
   */
  get isExpanded(): boolean {
    return this.toggleSidebar;
  }

  /**
   * Check if device is mobile (width < 768px)
   */
  private isMobileDevice(): boolean {
    return window.innerWidth < 768;
  }

  /**
   * Collapse sidebar if on mobile device
   */
  private collapseOnMobile(): void {
    if (this.isMobileDevice()) {
      this.navigationService.collapseSidebar();
    }
  }

  /**
   * Toggle sidebar expand/collapse state
   */
  handleToggleSidebar(): void {
    this.navigationService.toggleSidebar();
  }

  /**
   * Navigate to menu item and collapse on mobile
   */
  handleClickMenu(item: MenuItem): void {
    console.log("menu =>", item);
    this.navigateToRoute(item.route);
  }

  /**
   * Navigate to settings and collapse on mobile
   */
  handleClickSettings(): void {
    this.navigateToRoute('/configuration');
  }

  /**
   * Navigate to route and collapse sidebar on mobile
   */
  private navigateToRoute(route: string): void {
    this.router.navigate([route]);
    this.collapseOnMobile();
  }

  /**
   * Check if route is currently active
   */
  isActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }
}
