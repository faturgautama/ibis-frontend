# IBIS - Integrated Bonded Inventory System - Folder Structure

## Angular 20 Standalone Components Architecture

```
src/
├── app/
│   ├── core/                           # Core module - singleton services
│   │   ├── guards/                     # Route guards
│   │   │   ├── auth.guard.ts
│   │   │   └── role.guard.ts
│   │   ├── interceptors/               # HTTP interceptors
│   │   │   ├── auth.interceptor.ts
│   │   │   ├── error.interceptor.ts
│   │   │   ├── loading.interceptor.ts
│   │   │   └── demo-mode.interceptor.ts  # Demo mode interceptor
│   │   ├── services/                   # Core services
│   │   │   ├── auth.service.ts
│   │   │   ├── storage.service.ts
│   │   │   ├── local-storage.service.ts  # LocalStorage wrapper
│   │   │   ├── notification.service.ts
│   │   │   ├── rfid.service.ts
│   │   │   └── data-provider.service.ts  # Abstract data provider
│   │   └── models/                     # Core models/interfaces
│   │       ├── user.model.ts
│   │       └── api-response.model.ts
│   │
│   ├── shared/                         # Shared components & utilities
│   │   ├── components/                 # Reusable UI components
│   │   │   ├── data-table/
│   │   │   │   ├── data-table.component.ts
│   │   │   │   ├── data-table.component.html
│   │   │   │   └── data-table.component.scss
│   │   │   ├── page-header/
│   │   │   ├── confirmation-dialog/
│   │   │   ├── loading-spinner/
│   │   │   └── breadcrumb/
│   │   ├── directives/                 # Shared directives
│   │   │   └── permission.directive.ts
│   │   ├── pipes/                      # Shared pipes
│   │   │   ├── date-format.pipe.ts
│   │   │   └── currency-format.pipe.ts
│   │   └── utils/                      # Utility functions
│   │       ├── date.utils.ts
│   │       └── validation.utils.ts
│   │
│   ├── features/                       # Feature modules (standalone)
│   │   ├── auth/                       # Authentication feature
│   │   │   ├── components/
│   │   │   │   ├── login/
│   │   │   │   │   ├── login.component.ts
│   │   │   │   │   ├── login.component.html
│   │   │   │   │   └── login.component.scss
│   │   │   │   └── forgot-password/
│   │   │   ├── services/
│   │   │   │   └── auth-api.service.ts
│   │   │   └── auth.routes.ts
│   │   │
│   │   ├── dashboard/                  # Dashboard feature
│   │   │   ├── components/
│   │   │   │   ├── dashboard-home/
│   │   │   │   ├── inventory-summary/
│   │   │   │   └── recent-activities/
│   │   │   ├── services/
│   │   │   └── dashboard.routes.ts
│   │   │
│   │   ├── inventory/                  # Inventory Management
│   │   │   ├── components/
│   │   │   │   ├── inventory-list/
│   │   │   │   ├── inventory-detail/
│   │   │   │   ├── stock-in/
│   │   │   │   ├── stock-out/
│   │   │   │   └── stock-adjustment/
│   │   │   ├── services/
│   │   │   │   └── inventory-api.service.ts
│   │   │   ├── models/
│   │   │   │   └── inventory.model.ts
│   │   │   └── inventory.routes.ts
│   │   │
│   │   ├── purchasing/                 # Purchasing Management
│   │   │   ├── components/
│   │   │   │   ├── purchase-order-list/
│   │   │   │   ├── purchase-order-form/
│   │   │   │   └── supplier-management/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   └── purchasing.routes.ts
│   │   │
│   │   ├── warehouse/                  # Warehouse Operations
│   │   │   ├── components/
│   │   │   │   ├── warehouse-list/
│   │   │   │   ├── location-management/
│   │   │   │   └── stock-transfer/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   └── warehouse.routes.ts
│   │   │
│   │   ├── production/                 # Production Management
│   │   │   ├── components/
│   │   │   │   ├── work-order-list/
│   │   │   │   ├── wip-tracking/
│   │   │   │   └── quality-inspection/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   └── production.routes.ts
│   │   │
│   │   ├── customs/                    # Customs Integration (Bea Cukai)
│   │   │   ├── components/
│   │   │   │   ├── document-list/
│   │   │   │   ├── bc-form/            # BC 2.3, 2.5, 4.0, etc
│   │   │   │   ├── it-inventory-sync/
│   │   │   │   └── ceisa-integration/
│   │   │   ├── services/
│   │   │   │   ├── customs-api.service.ts
│   │   │   │   ├── it-inventory.service.ts
│   │   │   │   └── ceisa.service.ts
│   │   │   ├── models/
│   │   │   │   ├── bc-document.model.ts
│   │   │   │   └── customs-declaration.model.ts
│   │   │   └── customs.routes.ts
│   │   │
│   │   ├── traceability/               # Traceability System
│   │   │   ├── components/
│   │   │   │   ├── trace-item/
│   │   │   │   ├── batch-tracking/
│   │   │   │   ├── rfid-scanner/
│   │   │   │   └── trace-history/
│   │   │   ├── services/
│   │   │   │   ├── traceability-api.service.ts
│   │   │   │   └── rfid-scanner.service.ts
│   │   │   ├── models/
│   │   │   └── traceability.routes.ts
│   │   │
│   │   ├── reports/                    # Reporting Module
│   │   │   ├── components/
│   │   │   │   ├── report-list/
│   │   │   │   ├── inventory-report/
│   │   │   │   ├── customs-report/
│   │   │   │   └── traceability-report/
│   │   │   ├── services/
│   │   │   └── reports.routes.ts
│   │   │
│   │   └── settings/                   # Settings & Configuration
│   │       ├── components/
│   │       │   ├── user-management/
│   │       │   ├── role-management/
│   │       │   ├── system-config/
│   │       │   └── kawasan-config/     # KEK/KB/KITE config
│   │       ├── services/
│   │       └── settings.routes.ts
│   │
│   ├── store/                          # NgRx Store
│   │   ├── auth/
│   │   │   ├── auth.actions.ts
│   │   │   ├── auth.reducer.ts
│   │   │   ├── auth.effects.ts
│   │   │   ├── auth.selectors.ts
│   │   │   └── auth.state.ts
│   │   ├── inventory/
│   │   │   ├── inventory.actions.ts
│   │   │   ├── inventory.reducer.ts
│   │   │   ├── inventory.effects.ts
│   │   │   ├── inventory.selectors.ts
│   │   │   └── inventory.state.ts
│   │   ├── purchasing/
│   │   ├── warehouse/
│   │   ├── production/
│   │   ├── customs/
│   │   ├── traceability/
│   │   └── index.ts                    # Root store config
│   │
│   ├── layouts/                        # Layout components
│   │   ├── main-layout/
│   │   │   ├── main-layout.component.ts
│   │   │   ├── main-layout.component.html
│   │   │   └── main-layout.component.scss
│   │   ├── auth-layout/
│   │   ├── components/
│   │   │   ├── header/
│   │   │   ├── sidebar/
│   │   │   └── footer/
│   │   └── layout.routes.ts
│   │
│   ├── app.config.ts                   # App configuration
│   ├── app.routes.ts                   # Root routes
│   ├── app.ts                          # Root component
│   ├── app.html
│   └── app.scss
│
├── assets/                             # Static assets
│   ├── images/
│   ├── icons/
│   └── i18n/                           # Internationalization
│       ├── en.json
│       └── id.json
│
├── environments/                       # Environment configs
│   ├── environment.ts                  # Development (demo mode)
│   ├── environment.demo.ts             # Demo mode (localStorage)
│   └── environment.prod.ts             # Production (real API)
│
├── styles/                             # Global styles
│   ├── _variables.scss
│   ├── _mixins.scss
│   ├── _tailwind.scss
│   └── _primeng-theme.scss
│
├── index.html
├── main.ts
└── styles.scss
```

## Key Principles

### 1. Standalone Components

- All components use `standalone: true`
- Import dependencies directly in component metadata
- No NgModules (except for legacy libraries if needed)

### 2. Feature-Based Structure

- Each feature is self-contained
- Feature has its own routes, components, services, models
- Easy to scale and maintain

### 3. NgRx Store Organization

- Store organized by feature
- Each feature has: actions, reducer, effects, selectors, state
- Centralized state management

### 4. Lazy Loading

- Features loaded on-demand via routes
- Improves initial load time
- Better performance

### 5. Shared Resources

- Reusable components in `shared/components`
- Common utilities in `shared/utils`
- Shared pipes and directives

## Example Component Structure

```typescript
// inventory-list.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { LucideAngularModule, Search, Plus } from 'lucide-angular';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, ButtonModule, LucideAngularModule],
  templateUrl: './inventory-list.component.html',
  styleUrl: './inventory-list.component.scss',
})
export class InventoryListComponent {
  readonly Search = Search;
  readonly Plus = Plus;

  constructor(private store: Store) {}
}
```

## Route Configuration Example

```typescript
// inventory.routes.ts
import { Routes } from '@angular/router';

export const INVENTORY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/inventory-list/inventory-list.component').then(
        (m) => m.InventoryListComponent
      ),
  },
  {
    path: 'detail/:id',
    loadComponent: () =>
      import('./components/inventory-detail/inventory-detail.component').then(
        (m) => m.InventoryDetailComponent
      ),
  },
  {
    path: 'stock-in',
    loadComponent: () =>
      import('./components/stock-in/stock-in.component').then((m) => m.StockInComponent),
  },
];
```

## Notes

- **Standalone Components**: Semua component menggunakan standalone mode
- **Lazy Loading**: Feature modules di-load on-demand
- **NgRx**: Centralized state management untuk complex state
- **TailwindCSS**: Utility-first styling
- **PrimeNG v20**: UI components dengan @primeuix/themes
- **Lucide Icons**: Modern icon library
- **RFID Integration**: Service untuk RFID scanner integration
- **Customs Integration**: Dedicated module untuk IT Inventory & CEISA
- **Traceability**: End-to-end tracking system

---

## Environment Configuration

### Demo Mode vs Production Mode

The application supports two modes:

- **Demo Mode**: Uses localStorage for data persistence (no backend required)
- **Production Mode**: Uses real API endpoints

### Environment Files

#### 1. environment.ts (Development/Demo)

```typescript
export const environment = {
  production: false,
  demoMode: true, // Enable demo mode
  apiUrl: '', // Not used in demo mode
  apiTimeout: 30000,
  features: {
    rfidScanner: false, // Disable RFID in demo
    customsIntegration: false, // Disable real customs API
  },
};
```

#### 2. environment.demo.ts (Demo Mode)

```typescript
export const environment = {
  production: false,
  demoMode: true,
  apiUrl: '',
  apiTimeout: 30000,
  features: {
    rfidScanner: false,
    customsIntegration: false,
  },
};
```

#### 3. environment.prod.ts (Production)

```typescript
export const environment = {
  production: true,
  demoMode: false,
  apiUrl: 'https://api.kek-inventory.com', // Real API URL
  apiTimeout: 30000,
  features: {
    rfidScanner: true, // Enable RFID scanner
    customsIntegration: true, // Enable IT Inventory & CEISA
  },
  customs: {
    itInventoryUrl: 'https://it-inventory.beacukai.go.id',
    ceisaUrl: 'https://ceisa.beacukai.go.id',
  },
};
```

### Angular Configuration (angular.json)

Add demo configuration:

```json
{
  "configurations": {
    "production": {
      "fileReplacements": [
        {
          "replace": "src/environments/environment.ts",
          "with": "src/environments/environment.prod.ts"
        }
      ]
    },
    "demo": {
      "fileReplacements": [
        {
          "replace": "src/environments/environment.ts",
          "with": "src/environments/environment.demo.ts"
        }
      ]
    }
  }
}
```

### Package.json Scripts

```json
{
  "scripts": {
    "start": "ng serve",
    "start:demo": "ng serve --configuration=demo",
    "start:prod": "ng serve --configuration=production",
    "build": "ng build",
    "build:demo": "ng build --configuration=demo",
    "build:prod": "ng build --configuration=production"
  }
}
```

---

## Service Implementation Pattern

### Abstract Data Provider

```typescript
// core/services/data-provider.service.ts
export abstract class DataProvider<T> {
  abstract getAll(): Observable<T[]>;
  abstract getById(id: string): Observable<T>;
  abstract create(item: T): Observable<T>;
  abstract update(id: string, item: T): Observable<T>;
  abstract delete(id: string): Observable<void>;
}
```

### API Service (Production)

```typescript
// features/inventory/services/inventory-api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { DataProvider } from '@core/services/data-provider.service';
import { Inventory } from '../models/inventory.model';

@Injectable()
export class InventoryApiService extends DataProvider<Inventory> {
  private apiUrl = `${environment.apiUrl}/inventory`;

  constructor(private http: HttpClient) {
    super();
  }

  getAll(): Observable<Inventory[]> {
    return this.http.get<Inventory[]>(this.apiUrl);
  }

  getById(id: string): Observable<Inventory> {
    return this.http.get<Inventory>(`${this.apiUrl}/${id}`);
  }

  create(item: Inventory): Observable<Inventory> {
    return this.http.post<Inventory>(this.apiUrl, item);
  }

  update(id: string, item: Inventory): Observable<Inventory> {
    return this.http.put<Inventory>(`${this.apiUrl}/${id}`, item);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

### Demo Service (LocalStorage)

```typescript
// features/inventory/services/inventory-demo.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { DataProvider } from '@core/services/data-provider.service';
import { LocalStorageService } from '@core/services/local-storage.service';
import { Inventory } from '../models/inventory.model';

@Injectable()
export class InventoryDemoService extends DataProvider<Inventory> {
  private storageKey = 'inventory_items';

  constructor(private localStorage: LocalStorageService) {
    super();
    this.initializeDemoData();
  }

  private initializeDemoData(): void {
    if (!this.localStorage.getItem(this.storageKey)) {
      const demoData: Inventory[] = [
        { id: '1', name: 'Item 1', quantity: 100 /* ... */ },
        { id: '2', name: 'Item 2', quantity: 50 /* ... */ },
      ];
      this.localStorage.setItem(this.storageKey, demoData);
    }
  }

  getAll(): Observable<Inventory[]> {
    const items = this.localStorage.getItem<Inventory[]>(this.storageKey) || [];
    return of(items).pipe(delay(300)); // Simulate API delay
  }

  getById(id: string): Observable<Inventory> {
    const items = this.localStorage.getItem<Inventory[]>(this.storageKey) || [];
    const item = items.find((i) => i.id === id);
    return of(item!).pipe(delay(300));
  }

  create(item: Inventory): Observable<Inventory> {
    const items = this.localStorage.getItem<Inventory[]>(this.storageKey) || [];
    const newItem = { ...item, id: Date.now().toString() };
    items.push(newItem);
    this.localStorage.setItem(this.storageKey, items);
    return of(newItem).pipe(delay(300));
  }

  update(id: string, item: Inventory): Observable<Inventory> {
    const items = this.localStorage.getItem<Inventory[]>(this.storageKey) || [];
    const index = items.findIndex((i) => i.id === id);
    if (index !== -1) {
      items[index] = { ...item, id };
      this.localStorage.setItem(this.storageKey, items);
    }
    return of(items[index]).pipe(delay(300));
  }

  delete(id: string): Observable<void> {
    const items = this.localStorage.getItem<Inventory[]>(this.storageKey) || [];
    const filtered = items.filter((i) => i.id !== id);
    this.localStorage.setItem(this.storageKey, filtered);
    return of(void 0).pipe(delay(300));
  }
}
```

### Service Provider Configuration

```typescript
// app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { routes } from './app.routes';

// Import services
import { InventoryApiService } from '@features/inventory/services/inventory-api.service';
import { InventoryDemoService } from '@features/inventory/services/inventory-demo.service';
import { DataProvider } from '@core/services/data-provider.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),

    // Conditional service provider based on environment
    {
      provide: 'InventoryService',
      useClass: environment.demoMode ? InventoryDemoService : InventoryApiService,
    },
  ],
};
```

### Component Usage

```typescript
// inventory-list.component.ts
import { Component, Inject } from '@angular/core';
import { DataProvider } from '@core/services/data-provider.service';
import { Inventory } from '../../models/inventory.model';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  // ...
})
export class InventoryListComponent {
  items$ = this.inventoryService.getAll();

  constructor(
    @Inject('InventoryService')
    private inventoryService: DataProvider<Inventory>
  ) {}
}
```

---

## LocalStorage Service

```typescript
// core/services/local-storage.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  setItem<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error('Error saving to localStorage', error);
    }
  }

  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return null;
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }
}
```

---

## Benefits of This Approach

1. **Easy Demo**: Run `npm run start:demo` for demo without backend
2. **Seamless Switch**: Change environment to switch between demo/production
3. **Same Interface**: Components use same interface regardless of mode
4. **Testing**: Easy to test with demo data
5. **Development**: Develop frontend without waiting for backend
6. **Presentation**: Perfect for client demos and presentations

---

## Usage Commands

```bash
# Development with demo mode (localStorage)
npm run start:demo

# Development with production API
npm run start:prod

# Build for demo
npm run build:demo

# Build for production
npm run build:prod
```
