# Design Document: Dashboard Layout Refactor

## Overview

Refactoring layout dashboard KEK IT Inventory dengan mengadopsi struktur layout yang lebih modern dan user-friendly. Layout baru akan menggunakan sidebar fixed yang bisa collapse/expand, navbar horizontal di atas, dan content area yang responsive. Design ini terinspirasi dari fglabstudio dengan penyesuaian untuk kebutuhan KEK IT Inventory.

## Architecture

### Component Hierarchy

```
MainLayoutComponent (Base Layout)
├── SidebarComponent
│   ├── Brand Section
│   ├── Menu Section
│   └── Settings Section
├── NavbarComponent
│   ├── Search Bar
│   ├── Notification Panel
│   └── User Profile Menu
└── Content Area (router-outlet)
```

### Layout Structure

```
┌─────────────────────────────────────────────────┐
│                   Navbar (Fixed)                 │
├──────────┬──────────────────────────────────────┤
│          │                                       │
│ Sidebar  │         Content Area                  │
│ (Fixed)  │         (Scrollable)                  │
│          │                                       │
│          │                                       │
└──────────┴──────────────────────────────────────┘
```

## Components and Interfaces

### 1. MainLayoutComponent

**Purpose:** Komponen wrapper utama yang mengkomposisi Sidebar, Navbar, dan Content Area.

**Template Structure:**

```html
<div class="flex w-full">
  <app-sidebar></app-sidebar>

  <div class="flex flex-col w-full">
    <app-navbar></app-navbar>

    <div class="content-area">
      <router-outlet></router-outlet>
    </div>
  </div>
</div>

<p-toast></p-toast>
```

**Responsibilities:**

- Mengkomposisi layout components
- Menyediakan toast notification global
- Tidak memiliki business logic

### 2. SidebarComponent

**Purpose:** Komponen sidebar navigasi dengan kemampuan collapse/expand.

**Properties:**

```typescript
interface SidebarComponent {
  toggleSidebar: boolean; // State collapsed/expanded
  menuItems: MenuItem[]; // Array menu items
  activeRoute: string; // Current active route
}
```

**Template Sections:**

**a. Brand Section:**

```html
<div class="brand-section">
  @if (toggleSidebar) {
  <img src="logo.png" />
  <span>KEK IT Inventory</span>
  }
  <button (click)="handleToggleSidebar()">
    <i class="pi pi-angle-double-{{toggleSidebar ? 'left' : 'right'}}"></i>
  </button>
</div>
```

**b. Menu Section:**

```html
<div class="menu-section">
  @for (item of menuItems; track item.id) {
  <div class="menu-item" (click)="handleClickMenu(item)">
    <i [class]="item.icon"></i>
    @if (toggleSidebar) {
    <span>{{ item.label }}</span>
    }
  </div>
  }
</div>
```

**c. Settings Section:**

```html
<div class="settings-section">
  <div class="menu-item" (click)="handleClickSettings()">
    <i class="pi pi-cog"></i>
    @if (toggleSidebar) {
    <span>Settings</span>
    }
  </div>
</div>
```

**Styling:**

- Width: 20rem (expanded), 5rem (collapsed)
- Transition: all 300ms ease-in-out
- Background: white
- Border-right: 1px solid gray-200

**Methods:**

```typescript
handleToggleSidebar(): void {
  // Toggle sidebar state via service
  this.navigationService.toggleSidebar();
}

handleClickMenu(item: MenuItem): void {
  // Navigate to route
  this.router.navigate([item.route]);
  // On mobile, auto-collapse sidebar
  if (window.innerWidth < 768) {
    this.navigationService.collapseSidebar();
  }
}

handleClickSettings(): void {
  this.router.navigate(['/configuration']);
}
```

### 3. NavbarComponent

**Purpose:** Komponen navbar horizontal dengan search, notifikasi, dan user profile.

**Properties:**

```typescript
interface NavbarComponent {
  searchQuery: string;
  notificationCount: number;
  currentUser: User;
}
```

**Template Structure:**

```html
<div class="navbar">
  <!-- Search Bar -->
  <div class="search-section">
    <p-iconfield>
      <p-inputicon class="pi pi-search" />
      <input type="text" pInputText placeholder="Search..." [(ngModel)]="searchQuery" />
    </p-iconfield>
  </div>

  <!-- Actions -->
  <div class="actions-section">
    <!-- Notification -->
    <app-notification-panel></app-notification-panel>

    <!-- User Profile -->
    <div class="user-profile" (click)="toggleUserMenu()">
      <p-avatar [label]="currentUser.initials"></p-avatar>
      <div class="user-info">
        <span>{{ currentUser.name }}</span>
        <span>{{ currentUser.role }}</span>
      </div>
      <i class="pi pi-chevron-down"></i>
    </div>
  </div>
</div>
```

**Styling:**

- Height: 4.5rem
- Background: white
- Shadow: sm
- Position: fixed top
- Z-index: 40

**Methods:**

```typescript
toggleUserMenu(): void {
  // Toggle user menu dropdown
}

handleSearch(): void {
  // Implement search functionality
}
```

### 4. NavigationService

**Purpose:** Service untuk manage state sidebar dan navigation logic.

**Interface:**

```typescript
interface NavigationService {
  toggleDashboardSidebar: BehaviorSubject<boolean>;

  toggleSidebar(): void;
  collapseSidebar(): void;
  expandSidebar(): void;
  getMenuItems(): MenuItem[];
}
```

**Implementation:**

```typescript
@Injectable({ providedIn: 'root' })
export class NavigationService {
  toggleDashboardSidebar = new BehaviorSubject<boolean>(true);

  toggleSidebar(): void {
    const current = this.toggleDashboardSidebar.value;
    this.toggleDashboardSidebar.next(!current);
  }

  collapseSidebar(): void {
    this.toggleDashboardSidebar.next(false);
  }

  expandSidebar(): void {
    this.toggleDashboardSidebar.next(true);
  }

  getMenuItems(): MenuItem[] {
    return [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'pi pi-home',
        route: '/dashboard',
      },
      {
        id: 'inventory',
        label: 'Inventory',
        icon: 'pi pi-box',
        route: '/inventory',
      },
      // ... more menu items
    ];
  }
}
```

## Data Models

### MenuItem Interface

```typescript
interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: number;
  children?: MenuItem[];
}
```

### User Interface

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
  avatar?: string;
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Sidebar Toggle State Consistency

_For any_ sidebar toggle state (collapsed or expanded), all UI elements (brand section, menu items) should render consistently with that state - showing only icons when collapsed and showing both icons and labels when expanded.

**Validates: Requirements 1.3, 1.4, 2.2, 2.3, 3.3, 3.4**

### Property 2: Navigation Behavior

_For any_ clickable menu item (main menu or settings), clicking it should navigate to its corresponding route.

**Validates: Requirements 3.2, 7.3**

### Property 3: Mobile Auto-Collapse

_For any_ menu item click when viewport width is less than 768px, the sidebar should automatically collapse after navigation.

**Validates: Requirements 6.3**

### Property 4: State Persistence Across Navigation

_For any_ navigation action, the sidebar toggle state should remain unchanged (if it was collapsed before navigation, it stays collapsed; if expanded, it stays expanded).

**Validates: Requirements 9.3**

### Property 5: Service State Synchronization

_For any_ toggle action on the sidebar, the NavigationService state should be updated and all subscribers should receive the new state.

**Validates: Requirements 9.2**

### Property 6: Responsive Sidebar Behavior

_For any_ viewport width less than 768px, the sidebar should automatically be in collapsed state, and clicking toggle should expand it temporarily.

**Validates: Requirements 6.1, 6.2**

### Property 7: Content Area Width Adjustment

_For any_ sidebar state change, the content area width should adjust accordingly to fill the remaining space.

**Validates: Requirements 5.4**

### Property 8: Responsive Navbar Elements

_For any_ viewport width less than 768px, certain navbar elements should be hidden or adjusted to fit mobile layout.

**Validates: Requirements 6.5**

## Error Handling

### Sidebar Toggle Errors

- **Invalid State:** Jika state sidebar tidak valid (bukan boolean), fallback ke default state (expanded)
- **Service Unavailable:** Jika NavigationService tidak tersedia, sidebar tetap functional dengan local state

### Navigation Errors

- **Invalid Route:** Jika route tidak valid, tampilkan error message dan stay di current page
- **Navigation Failed:** Jika navigation gagal, log error dan notify user

### Responsive Errors

- **Viewport Detection Failed:** Jika window.innerWidth tidak tersedia, assume desktop layout
- **Resize Event Failed:** Jika resize listener gagal, maintain current state

## Testing Strategy

### Unit Tests

Unit tests akan fokus pada:

- Component rendering dengan berbagai states
- Event handler behavior (click, toggle)
- Service methods (toggle, collapse, expand)
- Conditional rendering logic
- CSS class applications
- Component composition

**Example Unit Tests:**

- Sidebar renders with correct width when expanded
- Sidebar renders with correct width when collapsed
- Brand section shows logo and text when expanded
- Brand section shows only logo when collapsed
- Menu items render with icons and labels when expanded
- Menu items render with only icons when collapsed
- Navbar renders with all required sections
- Settings menu renders at bottom of sidebar
- Toggle button changes icon based on state
- Navigation service initializes with correct default state

### Property-Based Tests

Property tests akan menggunakan **fast-check** library untuk TypeScript/Angular dan akan run minimum **100 iterations** per test.

**Property Test Configuration:**

```typescript
import * as fc from 'fast-check';

describe('Dashboard Layout Properties', () => {
  it('Property 1: Sidebar Toggle State Consistency', () => {
    fc.assert(
      fc.property(fc.boolean(), (isExpanded) => {
        // Test implementation
      }),
      { numRuns: 100 }
    );
  });
});
```

**Property Tests:**

1. **Sidebar Toggle State Consistency** - Generate random toggle states, verify UI elements render consistently
2. **Navigation Behavior** - Generate random menu items, verify navigation works for all
3. **Mobile Auto-Collapse** - Generate random viewport widths < 768px, verify auto-collapse
4. **State Persistence** - Generate random navigation sequences, verify state persists
5. **Service State Synchronization** - Generate random toggle sequences, verify service updates
6. **Responsive Sidebar Behavior** - Generate random viewport widths, verify responsive behavior
7. **Content Area Width Adjustment** - Generate random sidebar states, verify content area adjusts
8. **Responsive Navbar Elements** - Generate random viewport widths, verify navbar adjusts

### Integration Tests

Integration tests akan fokus pada:

- Interaction antara Sidebar dan NavigationService
- Interaction antara MainLayout, Sidebar, dan Navbar
- Router navigation integration
- Responsive behavior across components

### Testing Tools

- **Jasmine/Karma:** Unit testing framework
- **fast-check:** Property-based testing library
- **Angular Testing Utilities:** TestBed, ComponentFixture
- **@angular/router/testing:** Router testing utilities

## Implementation Notes

### Migration Strategy

1. **Phase 1:** Create new components (Sidebar, Navbar) tanpa mengganggu existing layout
2. **Phase 2:** Create NavigationService dan integrate dengan new components
3. **Phase 3:** Update MainLayoutComponent untuk use new components
4. **Phase 4:** Remove old drawer-based layout
5. **Phase 5:** Update all routes untuk use new layout

### Backward Compatibility

- Existing routes akan tetap functional selama migration
- Old layout components akan di-deprecate secara gradual
- No breaking changes untuk existing features

### Performance Considerations

- Sidebar toggle animation menggunakan CSS transitions (hardware accelerated)
- Menu items rendering menggunakan Angular @for dengan trackBy untuk optimal performance
- NavigationService menggunakan BehaviorSubject untuk efficient state management
- Lazy loading untuk notification panel dan user menu

### Accessibility

- Sidebar toggle button memiliki aria-label
- Menu items memiliki proper aria-roles
- Keyboard navigation support (Tab, Enter, Escape)
- Focus management saat sidebar toggle
- Screen reader friendly labels
