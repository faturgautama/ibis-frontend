#!/bin/bash

# Script to fix PrimeNG v20 module imports

echo "Fixing PrimeNG imports for v20..."

# Find all TypeScript files in src/app
find src/app -name "*.ts" -type f | while read file; do
    # Backup original file
    # cp "$file" "$file.bak"
    
    # Replace DropdownModule with SelectModule
    sed -i '' 's/DropdownModule/SelectModule/g' "$file"
    sed -i '' "s|'primeng/dropdown'|'primeng/select'|g" "$file"
    
    # Replace CalendarModule with DatePickerModule  
    sed -i '' 's/CalendarModule/DatePickerModule/g' "$file"
    sed -i '' "s|'primeng/calendar'|'primeng/datepicker'|g" "$file"
    
    # Replace TabViewModule with TabsModule
    sed -i '' 's/TabViewModule/TabsModule/g' "$file"
    sed -i '' "s|'primeng/tabview'|'primeng/tabs'|g" "$file"
    
    # Replace SidebarModule with DrawerModule (if any remaining)
    sed -i '' 's/SidebarModule/DrawerModule/g' "$file"
    sed -i '' "s|'primeng/sidebar'|'primeng/drawer'|g" "$file"
done

echo "Fixing template tags..."

# Fix HTML templates in component files
find src/app -name "*.ts" -type f | while read file; do
    # Replace p-dropdown with p-select
    sed -i '' 's/<p-dropdown/<p-select/g' "$file"
    sed -i '' 's/<\/p-dropdown>/<\/p-select>/g' "$file"
    
    # Replace p-calendar with p-datepicker
    sed -i '' 's/<p-calendar/<p-datepicker/g' "$file"
    sed -i '' 's/<\/p-calendar>/<\/p-datepicker>/g' "$file"
    
    # Replace p-tabView with p-tabs
    sed -i '' 's/<p-tabView/<p-tabs/g' "$file"
    sed -i '' 's/<\/p-tabView>/<\/p-tabs>/g' "$file"
    
    # Replace p-tabPanel with p-tabpanel
    sed -i '' 's/<p-tabPanel/<p-tabpanel/g' "$file"
    sed -i '' 's/<\/p-tabPanel>/<\/p-tabpanel>/g' "$file"
    
    # Replace p-sidebar with p-drawer (if any remaining)
    sed -i '' 's/<p-sidebar/<p-drawer/g' "$file"
    sed -i '' 's/<\/p-sidebar>/<\/p-drawer>/g' "$file"
done

echo "Done! PrimeNG imports fixed."
echo "Note: This script uses sed -i '' for macOS. For Linux, use sed -i without ''"
