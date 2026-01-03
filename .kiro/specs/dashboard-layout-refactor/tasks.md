# Implementation Plan: Dashboard Layout Refactor

## Overview

Refactoring dashboard layout KEK IT Inventory dengan membuat komponen-komponen baru (Sidebar, Navbar, MainLayout) yang modular dan maintainable, mengadopsi pattern dari fglabstudio dengan sidebar fixed yang bisa collapse/expand.

## Tasks

- [x] 1. Setup NavigationService untuk state management

  - Create NavigationService dengan BehaviorSubject untuk sidebar toggle state
  - Implement methods: toggleSidebar(), collapseSidebar(), expandSidebar()
  - Implement getMenuItems() method yang return array of MenuItem
  - _Requirements: 9.1, 9.2, 9.4_

- [ ]\* 1.1 Write unit tests untuk NavigationService

  - Test service initialization dengan default state
  - Test toggleSidebar() method
  - Test collapseSidebar() dan expandSidebar() methods
  - Test BehaviorSubject subscription
  - _Requirements: 9.1, 9.2, 9.4_

- [x] 2. Create SidebarComponent

  - [x] 2.1 Create component structure dan basic template

    - Create sidebar.component.ts sebagai standalone component
    - Setup basic template dengan brand section, menu section, settings section
    - Import required PrimeNG modules (ButtonModule)
    - _Requirements: 8.1, 8.2, 8.5_

  - [x] 2.2 Implement brand section

    - Add logo image dan app name
    - Add toggle button dengan icon yang berubah based on state
    - Implement conditional rendering dengan @if untuk expanded/collapsed state
    - Add border-bottom untuk separator
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 2.3 Implement menu section

    - Render menu items dari NavigationService
    - Implement @for loop dengan trackBy untuk menu items
    - Add click handler untuk navigation
    - Implement conditional rendering untuk icon dan label
    - Add hover effects dengan Tailwind classes
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 2.4 Implement settings section

    - Add settings menu item di bagian bawah
    - Position dengan mt-auto untuk sticky bottom
    - Add click handler untuk navigate ke /configuration
    - Use pi-cog icon
    - Add border-top untuk separator
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 2.5 Implement sidebar toggle logic

    - Subscribe ke NavigationService.toggleDashboardSidebar
    - Implement handleToggleSidebar() method
    - Implement handleClickMenu() dengan auto-collapse untuk mobile
    - Add responsive behavior untuk viewport < 768px
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 6.1, 6.2, 6.3_

  - [x] 2.6 Add styling dan animations
    - Add Tailwind classes untuk width (20rem expanded, 5rem collapsed)
    - Add transition classes (transition-all duration-300)
    - Add background, border, padding classes
    - Ensure smooth animation saat toggle
    - _Requirements: 1.5, 10.1, 10.2, 10.3, 10.5_

- [ ]\* 2.7 Write unit tests untuk SidebarComponent

  - Test component renders correctly
  - Test brand section conditional rendering
  - Test menu items rendering
  - Test settings section rendering
  - Test toggle button click
  - Test menu item click navigation
  - Test responsive behavior
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 3.2, 3.3, 3.4, 6.1, 6.2, 6.3_

- [ ]\* 2.8 Write property test untuk Sidebar Toggle State Consistency

  - **Property 1: Sidebar Toggle State Consistency**
  - **Validates: Requirements 1.3, 1.4, 2.2, 2.3, 3.3, 3.4**

- [ ]\* 2.9 Write property test untuk Navigation Behavior

  - **Property 2: Navigation Behavior**
  - **Validates: Requirements 3.2, 7.3**

- [ ]\* 2.10 Write property test untuk Mobile Auto-Collapse

  - **Property 3: Mobile Auto-Collapse**
  - **Validates: Requirements 6.3**

- [x] 3. Create NavbarComponent

  - [x] 3.1 Create component structure dan basic template

    - Create navbar.component.ts sebagai standalone component
    - Setup basic template dengan search section dan actions section
    - Import required PrimeNG modules (InputText, IconField, Button, Avatar, Tooltip)
    - _Requirements: 8.1, 8.3, 8.5_

  - [x] 3.2 Implement search section

    - Add search input dengan PrimeNG IconField
    - Add search icon
    - Add placeholder text
    - Position di sisi kiri dengan proper width
    - _Requirements: 4.2_

  - [x] 3.3 Implement actions section

    - Add notification panel component
    - Add user profile section dengan avatar, name, role
    - Add chevron-down icon untuk dropdown indicator
    - Position di sisi kanan dengan gap spacing
    - _Requirements: 4.3, 4.4_

  - [x] 3.4 Add styling

    - Add fixed positioning dengan height 4.5rem
    - Add background white dan shadow-sm
    - Add z-index 40
    - Add responsive classes untuk mobile
    - _Requirements: 4.1, 4.5, 6.5, 10.1, 10.2, 10.3, 10.5_

  - [x] 3.5 Implement user menu functionality
    - Add click handler untuk toggle user menu
    - Implement user menu dropdown (bisa reuse existing atau create new)
    - _Requirements: 4.4_

- [ ]\* 3.6 Write unit tests untuk NavbarComponent

  - Test component renders correctly
  - Test search section renders
  - Test notification panel renders
  - Test user profile section renders
  - Test responsive behavior
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 6.5_

- [ ]\* 3.7 Write property test untuk Responsive Navbar Elements

  - **Property 8: Responsive Navbar Elements**
  - **Validates: Requirements 6.5**

- [x] 4. Create MainLayoutComponent (BaseLayout)

  - [x] 4.1 Create component structure

    - Create main-layout.component.ts sebagai standalone component
    - Import SidebarComponent dan NavbarComponent
    - Setup basic template structure
    - _Requirements: 8.1, 8.4, 8.5_

  - [x] 4.2 Implement layout structure

    - Add flex container untuk sidebar dan content area
    - Add SidebarComponent
    - Add flex column container untuk navbar dan content
    - Add NavbarComponent
    - Add content area dengan router-outlet
    - Add toast notification component
    - _Requirements: 5.1_

  - [x] 4.3 Style content area

    - Add padding classes
    - Add background gray-200
    - Add overflow-y auto untuk scrolling
    - Add height calculation (100vh - navbar height)
    - Implement width adjustment based on sidebar state
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 10.1, 10.2, 10.3_

  - [x] 4.4 Add responsive behavior
    - Ensure layout works di viewport minimal 320px
    - Test layout di berbagai screen sizes
    - _Requirements: 6.4_

- [ ]\* 4.5 Write unit tests untuk MainLayoutComponent

  - Test component renders correctly
  - Test sidebar component is included
  - Test navbar component is included
  - Test router-outlet is included
  - Test content area styling
  - _Requirements: 5.1, 5.2, 5.3, 5.5, 8.4_

- [ ]\* 4.6 Write property test untuk Content Area Width Adjustment

  - **Property 7: Content Area Width Adjustment**
  - **Validates: Requirements 5.4**

- [x] 5. Checkpoint - Test new layout components

  - Ensure all new components render correctly
  - Test sidebar toggle functionality
  - Test navigation works
  - Test responsive behavior
  - Ask user if any adjustments needed

- [x] 6. Update routes untuk use new MainLayoutComponent

  - [x] 6.1 Update app.routes.ts

    - Replace old MainLayoutComponent dengan new one
    - Ensure all protected routes use new layout
    - Test routing works correctly
    - _Requirements: 8.1_

  - [x] 6.2 Test navigation across all routes
    - Navigate ke berbagai pages
    - Verify sidebar state persists
    - Verify layout consistent across pages
    - _Requirements: 9.3_

- [ ]\* 6.3 Write property test untuk State Persistence Across Navigation

  - **Property 4: State Persistence Across Navigation**
  - **Validates: Requirements 9.3**

- [ ]\* 6.4 Write property test untuk Service State Synchronization

  - **Property 5: Service State Synchronization**
  - **Validates: Requirements 9.2**

- [ ]\* 6.5 Write property test untuk Responsive Sidebar Behavior

  - **Property 6: Responsive Sidebar Behavior**
  - **Validates: Requirements 6.1, 6.2**

- [x] 7. Remove old layout components

  - [x] 7.1 Backup old MainLayoutComponent

    - Rename old component file untuk backup
    - Keep for reference jika ada issues
    - _Requirements: 8.1_

  - [x] 7.2 Clean up unused imports

    - Remove DrawerModule imports jika tidak digunakan lagi
    - Clean up unused dependencies
    - _Requirements: 8.1_

  - [x] 7.3 Update documentation
    - Update README jika ada
    - Document new layout structure
    - _Requirements: 8.1_

- [x] 8. Final checkpoint - Complete testing
  - Run all unit tests dan ensure passing
  - Run all property tests dan ensure passing
  - Test aplikasi secara manual di berbagai devices
  - Test responsive behavior thoroughly
  - Ask user for final approval

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check library
- Unit tests validate specific examples and edge cases
- Migration dilakukan secara gradual untuk minimize disruption
