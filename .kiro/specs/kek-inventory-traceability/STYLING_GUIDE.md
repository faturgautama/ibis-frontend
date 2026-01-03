# Styling Guide - IBIS Inventory System

## Overview

Untuk semua komponen baru yang dibuat mulai dari Task 3 dan seterusnya, gunakan **Tailwind CSS inline styling** di template HTML. Hindari membuat file `.scss` terpisah kecuali benar-benar diperlukan untuk kasus yang sangat kompleks.

## Why Tailwind Inline?

1. **Consistency**: Semua styling dalam satu tempat (HTML template)
2. **Maintainability**: Lebih mudah melihat styling langsung di template
3. **Performance**: Tailwind purge akan menghapus unused classes
4. **Modern Best Practice**: Sesuai dengan trend development modern
5. **Faster Development**: Tidak perlu switch antara HTML dan SCSS

## Styling Approach

### ✅ DO: Use Tailwind Inline

```html
<!-- Item List Component -->
<div class="p-6 bg-white rounded-lg shadow-md">
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-2xl font-semibold text-gray-900">Items</h2>
    <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
      Add Item
    </button>
  </div>

  <p-table [value]="items" styleClass="p-datatable-sm">
    <!-- Table content -->
  </p-table>
</div>

<!-- Form Component -->
<form [formGroup]="itemForm" class="space-y-4">
  <div class="flex flex-col">
    <label class="text-sm font-medium text-gray-700 mb-1">Item Name</label>
    <input
      pInputText
      formControlName="name"
      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      placeholder="Enter item name"
    />
    @if (itemForm.get('name')?.hasError('required') && itemForm.get('name')?.touched) {
    <small class="text-red-600 text-sm mt-1">Item name is required</small>
    }
  </div>
</form>
```

### ❌ DON'T: Create Separate SCSS Files

```scss
// ❌ Avoid this for new components
.item-container {
  padding: 1.5rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
```

## Common Patterns

### Container Layouts

```html
<!-- Page Container -->
<div class="container mx-auto px-4 py-6">
  <!-- Content -->
</div>

<!-- Card Container -->
<div class="bg-white rounded-lg shadow-md p-6">
  <!-- Card content -->
</div>

<!-- Grid Layout -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Grid items -->
</div>
```

### Form Styling

```html
<!-- Form Field -->
<div class="mb-4">
  <label class="block text-sm font-medium text-gray-700 mb-2"> Label Text </label>
  <input
    type="text"
    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  />
  <small class="text-red-600 text-sm mt-1">Error message</small>
</div>

<!-- Form Actions -->
<div class="flex items-center justify-end gap-3 mt-6">
  <button class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
  <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
</div>
```

### Buttons

```html
<!-- Primary Button -->
<button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
  Primary Action
</button>

<!-- Secondary Button -->
<button class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
  Secondary Action
</button>

<!-- Danger Button -->
<button class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>

<!-- Icon Button -->
<button class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
  <lucide-icon name="edit" [size]="20"></lucide-icon>
</button>
```

### Tables

```html
<div class="overflow-x-auto">
  <p-table [value]="items" [paginator]="true" [rows]="50" styleClass="p-datatable-sm">
    <ng-template pTemplate="header">
      <tr class="bg-gray-50">
        <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
        <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900">Code</th>
        <th class="px-4 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-item>
      <tr class="border-b border-gray-200 hover:bg-gray-50">
        <td class="px-4 py-3 text-sm text-gray-900">{{ item.name }}</td>
        <td class="px-4 py-3 text-sm text-gray-600">{{ item.code }}</td>
        <td class="px-4 py-3 text-right">
          <button class="p-2 text-blue-600 hover:bg-blue-50 rounded">
            <lucide-icon name="edit" [size]="16"></lucide-icon>
          </button>
        </td>
      </tr>
    </ng-template>
  </p-table>
</div>
```

### Alerts & Badges

```html
<!-- Success Alert -->
<div class="p-4 bg-green-50 border border-green-200 rounded-lg">
  <p class="text-sm text-green-800">Success message</p>
</div>

<!-- Warning Alert -->
<div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
  <p class="text-sm text-yellow-800">Warning message</p>
</div>

<!-- Error Alert -->
<div class="p-4 bg-red-50 border border-red-200 rounded-lg">
  <p class="text-sm text-red-800">Error message</p>
</div>

<!-- Badge -->
<span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"> Active </span>
```

## Color Palette

### Primary Colors

- Blue: `bg-blue-600`, `text-blue-600`, `border-blue-600`
- Hover: `hover:bg-blue-700`

### Neutral Colors

- Gray scale: `gray-50`, `gray-100`, `gray-200`, ..., `gray-900`
- Text: `text-gray-900` (primary), `text-gray-600` (secondary)

### Status Colors

- Success: `green-600`, `green-50` (background)
- Warning: `yellow-600`, `yellow-50` (background)
- Error: `red-600`, `red-50` (background)
- Info: `blue-600`, `blue-50` (background)

## Responsive Design

```html
<!-- Mobile First Approach -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  <!-- Responsive grid -->
</div>

<!-- Hide/Show on Different Screens -->
<div class="hidden md:block">Desktop only</div>
<div class="block md:hidden">Mobile only</div>

<!-- Responsive Padding -->
<div class="px-4 md:px-6 lg:px-8">
  <!-- Content -->
</div>
```

## PrimeNG Integration

When using PrimeNG components, combine with Tailwind:

```html
<!-- PrimeNG Button with Tailwind -->
<p-button
  label="Save"
  severity="primary"
  styleClass="w-full"
  [style]="{'height': '2.5rem'}"
></p-button>

<!-- PrimeNG Card with Tailwind wrapper -->
<div class="p-4">
  <p-card>
    <ng-template pTemplate="header">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Card Title</h3>
      </div>
    </ng-template>
    <div class="p-6">
      <!-- Card content -->
    </div>
  </p-card>
</div>
```

## When to Use SCSS

Only use component SCSS files for:

1. **Complex animations** that can't be done with Tailwind
2. **Deep PrimeNG customization** that requires `::ng-deep`
3. **Component-specific overrides** that are too complex for inline

Example of acceptable SCSS usage:

```scss
// item-list.component.scss
::ng-deep {
  .p-datatable {
    .p-datatable-thead > tr > th {
      background-color: #f9fafb;
      font-weight: 600;
    }
  }
}
```

## Summary

- ✅ Use Tailwind inline for all new components
- ✅ Keep styling in HTML templates
- ✅ Use utility-first approach
- ❌ Avoid creating new .scss files
- ❌ Don't use custom CSS classes
- ⚠️ Only use SCSS for complex cases

This approach will make the codebase more maintainable and consistent across all new features.
