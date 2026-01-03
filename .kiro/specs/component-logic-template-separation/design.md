# Design Document: Component Logic and Template Separation

## Overview

This design outlines the approach for systematically separating business logic from HTML templates across all Angular components in the kek-it-inventory application. The refactoring will improve code maintainability, testability, and adherence to Angular best practices while preserving all existing functionality.

## Architecture

### Separation Strategy

The refactoring follows a consistent pattern across all components:

1. **Identify Complex Template Expressions**: Scan templates for complex bindings, calculations, or method calls
2. **Extract to TypeScript**: Move identified logic to component TypeScript files as methods or properties
3. **Create Computed Properties**: Use getters for derived state that depends on component properties
4. **Simplify Template Bindings**: Replace complex expressions with simple property or method references
5. **Preserve Functionality**: Ensure all user-facing behavior remains identical

### Component Categories

Components are categorized by complexity to prioritize refactoring:

1. **High Priority**: Components with complex template logic (forms, lists with filtering/sorting)
2. **Medium Priority**: Components with moderate template complexity (dashboards, detail views)
3. **Low Priority**: Simple components with minimal template logic (layouts, wrappers)

## Components and Interfaces

### Component Structure Pattern

Each refactored component will follow this structure:

```typescript
@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss'],
})
export class ExampleComponent {
  // Public properties for template binding
  public displayData: DataType[];

  // Private properties for internal state
  private rawData: DataType[];

  // Computed properties using getters
  get filteredData(): DataType[] {
    return this.applyFilters(this.rawData);
  }

  get hasData(): boolean {
    return this.displayData && this.displayData.length > 0;
  }

  // Event handlers
  onItemClick(item: DataType): void {
    this.handleItemSelection(item);
  }

  // Private helper methods
  private applyFilters(data: DataType[]): DataType[] {
    // Filter logic here
  }

  private handleItemSelection(item: DataType): void {
    // Selection logic here
  }
}
```

### Template Pattern

Templates will use simple bindings:

```html
<!-- Simple property binding -->
<div *ngIf="hasData">
  <div *ngFor="let item of filteredData">
    <span>{{ item.name }}</span>
    <button (click)="onItemClick(item)">Select</button>
  </div>
</div>

<!-- Use pipes for formatting -->
<span>{{ item.date | date:'short' }}</span>
<span>{{ item.price | currency }}</span>
```

## Data Models

### Refactoring Metadata

Track refactoring progress for each component:

```typescript
interface ComponentRefactoringStatus {
  componentPath: string;
  componentName: string;
  priority: 'high' | 'medium' | 'low';
  complexity: number; // 1-10 scale
  hasComplexTemplateLogic: boolean;
  refactoredDate?: Date;
  extractedMethods: string[];
  extractedProperties: string[];
}
```

## Error Handling

### Refactoring Safety

1. **Preserve Existing Error Handling**: All existing try-catch blocks and error handling remain unchanged
2. **Add Defensive Checks**: New methods include null/undefined checks where appropriate
3. **Maintain Error Messages**: Keep all existing error messages and user feedback
4. **Test Error Scenarios**: Verify error handling works after refactoring

### Common Patterns

```typescript
// Safe property access
get safeValue(): string {
  return this.data?.property ?? 'default';
}

// Safe array operations
get safeItems(): Item[] {
  return this.items ?? [];
}

// Safe method calls
onAction(): void {
  if (!this.isValid()) {
    return;
  }
  this.performAction();
}
```

## Testing Strategy

### Unit Testing Approach

The refactoring enables better unit testing by separating logic from templates:

1. **Test Extracted Methods**: Unit test all new TypeScript methods independently
2. **Test Computed Properties**: Verify getters return correct values for various inputs
3. **Test Event Handlers**: Ensure event handlers call correct methods with proper parameters
4. **Integration Tests**: Verify component behavior matches pre-refactoring state

### Testing Pattern

```typescript
describe('ExampleComponent', () => {
  let component: ExampleComponent;

  beforeEach(() => {
    component = new ExampleComponent();
  });

  describe('filteredData getter', () => {
    it('should return filtered data when filters applied', () => {
      component.rawData = [
        /* test data */
      ];
      component.filterValue = 'test';

      const result = component.filteredData;

      expect(result.length).toBe(expectedLength);
    });
  });

  describe('onItemClick', () => {
    it('should handle item selection correctly', () => {
      const item = { id: 1, name: 'Test' };
      spyOn(component as any, 'handleItemSelection');

      component.onItemClick(item);

      expect(component['handleItemSelection']).toHaveBeenCalledWith(item);
    });
  });
});
```

### Property-Based Testing

For complex logic, use property-based testing to verify behavior across many inputs:

```typescript
import * as fc from 'fast-check';

describe('Complex filtering logic', () => {
  it('should maintain data integrity for any filter value', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({ id: fc.integer(), name: fc.string() })),
        fc.string(),
        (data, filter) => {
          component.rawData = data;
          component.filterValue = filter;

          const result = component.filteredData;

          // Property: filtered data is subset of original
          return result.every((item) => data.includes(item));
        }
      )
    );
  });
});
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Refactoring Preserves Functional Behavior

_For any_ component that is refactored, all user-facing behavior including event handlers, data bindings, and computed values SHALL produce identical results before and after refactoring for the same inputs and state.

**Validates: Requirements 5.1, 5.2, 5.3**

This property ensures that the refactoring is purely structural and doesn't introduce any behavioral changes. We can test this by:

- Capturing component outputs (rendered DOM, emitted events, state changes) before refactoring
- Applying the same inputs and interactions after refactoring
- Verifying outputs are identical

### Property 2: Computed Properties Reflect State Changes

_For any_ component with computed properties (getters), when the underlying state changes, the computed property SHALL immediately reflect the new state without requiring manual updates.

**Validates: Requirements 3.3**

This property ensures that reactive computed properties work correctly. We can test this by:

- Setting initial state
- Reading computed property value
- Changing underlying state
- Verifying computed property returns updated value

This is a fundamental property of Angular's change detection and getter-based computed properties.
