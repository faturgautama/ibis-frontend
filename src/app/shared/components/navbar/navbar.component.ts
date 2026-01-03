import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { NotificationPanelComponent } from '../../../features/alerts/components/notification-panel/notification-panel.component';

/**
 * User Interface
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
  avatar?: string;
}

/**
 * NavbarComponent
 * Komponen navbar horizontal dengan search, notifikasi, dan user profile
 * Requirements: 8.1, 8.3, 8.5
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
    AvatarModule,
    TooltipModule,
    NotificationPanelComponent
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  searchQuery = '';

  currentUser: User = {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'Administrator',
    initials: 'AU'
  };

  constructor(private router: Router) { }

  /**
   * Computed property: Check if search query is valid
   */
  get hasValidSearchQuery(): boolean {
    return this.searchQuery.trim().length > 0;
  }

  /**
   * Computed property: Get user display name
   */
  get userDisplayName(): string {
    return this.currentUser.name;
  }

  /**
   * Computed property: Get user role
   */
  get userRole(): string {
    return this.currentUser.role;
  }

  /**
   * Computed property: Get user initials for avatar
   */
  get userInitials(): string {
    return this.currentUser.initials;
  }

  /**
   * Computed property: Get avatar style configuration
   */
  get avatarStyle(): { [key: string]: string } {
    return {
      'background-color': '#2196F3',
      'color': '#ffffff'
    };
  }

  /**
   * Handle search action when user presses enter
   */
  handleSearch(): void {
    if (this.hasValidSearchQuery) {
      console.log('Searching for:', this.searchQuery);
      // TODO: Implement actual search functionality
    }
  }

  /**
   * Toggle user menu dropdown
   */
  toggleUserMenu(): void {
    console.log('Toggle user menu');
    // TODO: Implement user menu toggle
  }

  /**
   * Toggle mobile menu
   */
  toggleMobileMenu(): void {
    console.log('Toggle mobile menu');
    // TODO: Implement mobile menu toggle
  }
}
