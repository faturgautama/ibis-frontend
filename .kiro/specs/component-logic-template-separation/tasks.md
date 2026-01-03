# Implementation Plan: Component Logic and Template Separation

## Overview

This plan outlines the systematic refactoring of all Angular components in the kek-it-inventory application to separate business logic from HTML templates. The refactoring will be done incrementally, starting with high-priority components and ensuring all functionality is preserved.

## Tasks

- [x] 1. Analyze and categorize all components

  - Scan all component files to identify those needing refactoring
  - Categorize components by complexity (high/medium/low priority)
  - Create a refactoring checklist for each component
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Refactor shared components (high priority)

  - [x] 2.1 Refactor sidebar component

    - Extract navigation logic to TypeScript methods
    - Move menu state management to component properties
    - Create computed properties for menu visibility
    - _Requirements: 1.1, 1.2, 2.1, 3.1_

  - [x] 2.2 Refactor navbar component

    - Extract user menu logic to TypeScript
    - Move notification handling to component methods
    - Create getters for user state
    - _Requirements: 1.1, 1.2, 2.1, 3.1_

  - [x] 2.3 Refactor dashboard-layout component
    - Extract layout state management to TypeScript
    - Move responsive logic to component methods
    - Create computed properties for layout configuration
    - _Requirements: 1.1, 1.2, 3.1, 3.3_

- [x] 3. Refactor form components (high priority)

  - [x] 3.1 Refactor item-form component

    - Extract form validation logic to TypeScript methods
    - Move data transformation to component methods
    - Create computed properties for form state
    - _Requirements: 1.1, 1.2, 2.1, 3.1, 3.3_

  - [x] 3.2 Refactor warehouse-form component

    - Extract form handling logic to TypeScript
    - Move validation to component methods
    - Create getters for form validity state
    - _Requirements: 1.1, 1.2, 2.1, 3.1_

  - [x] 3.3 Refactor supplier-form component

    - Extract form logic to TypeScript methods
    - Move NPWP validation to component
    - Create computed properties for form state
    - _Requirements: 1.1, 1.2, 2.1, 3.1_

  - [x] 3.4 Refactor customer-form component

    - Extract form handling to TypeScript
    - Move validation logic to component methods
    - Create getters for form state
    - _Requirements: 1.1, 1.2, 2.1, 3.1_

  - [x] 3.5 Refactor bc-document-form component
    - Extract document handling logic to TypeScript
    - Move validation to component methods
    - Create computed properties for document state
    - _Requirements: 1.1, 1.2, 2.1, 3.1_

- [ ] 4. Refactor list components (high priority)

  - [x] 4.1 Refactor item-list component

    - Extract filtering logic to TypeScript methods
    - Move sorting logic to component methods
    - Create computed properties for filtered/sorted data
    - _Requirements: 1.1, 1.2, 2.1, 3.1, 3.3_

  - [x] 4.2 Refactor warehouse-list component

    - Extract list operations to TypeScript
    - Move filtering/sorting to component methods
    - Create getters for processed data
    - _Requirements: 1.1, 1.2, 2.1, 3.1, 3.3_

  - [x] 4.3 Refactor supplier-list component

    - Extract list logic to TypeScript methods
    - Move data processing to component
    - Create computed properties for list state
    - _Requirements: 1.1, 1.2, 2.1, 3.1, 3.3_

  - [x] 4.4 Refactor customer-list component

    - Extract list operations to TypeScript
    - Move filtering to component methods
    - Create getters for filtered data
    - _Requirements: 1.1, 1.2, 2.1, 3.1, 3.3_

  - [x] 4.5 Refactor bc-document-list component
    - Extract list logic to TypeScript methods
    - Move document operations to component
    - Create computed properties for list state
    - _Requirements: 1.1, 1.2, 2.1, 3.1, 3.3_

- [ ] 5. Checkpoint - Verify high priority components

  - Ensure all high priority components are refactored
  - Run existing tests to verify functionality preserved
  - Ask user if questions arise

- [ ] 6. Refactor dashboard and view components (medium priority)

  - [ ] 6.1 Refactor main-dashboard component

    - Extract dashboard logic to TypeScript methods
    - Move data aggregation to component
    - Create computed properties for dashboard metrics
    - _Requirements: 1.1, 1.2, 2.1, 3.1, 3.3_

  - [ ] 6.2 Refactor stock-balance-view component

    - Extract stock calculations to TypeScript
    - Move filtering logic to component methods
    - Create getters for stock data
    - _Requirements: 1.1, 1.2, 2.1, 3.1, 3.3_

  - [ ] 6.3 Refactor traceability-view component

    - Extract traceability logic to TypeScript methods
    - Move data processing to component
    - Create computed properties for trace data
    - _Requirements: 1.1, 1.2, 2.1, 3.1, 3.3_

  - [ ] 6.4 Refactor audit-trail-view component
    - Extract audit logic to TypeScript methods
    - Move filtering to component
    - Create getters for audit data
    - _Requirements: 1.1, 1.2, 2.1, 3.1, 3.3_

- [ ] 7. Refactor feature-specific components (medium priority)

  - [ ] 7.1 Refactor inbound-list component

    - Extract inbound operations to TypeScript
    - Move status handling to component methods
    - Create computed properties for inbound state
    - _Requirements: 1.1, 1.2, 2.1, 3.1_

  - [ ] 7.2 Refactor outbound-list component

    - Extract outbound logic to TypeScript methods
    - Move operations to component
    - Create getters for outbound data
    - _Requirements: 1.1, 1.2, 2.1, 3.1_

  - [ ] 7.3 Refactor production-list component

    - Extract production logic to TypeScript
    - Move data processing to component methods
    - Create computed properties for production state
    - _Requirements: 1.1, 1.2, 2.1, 3.1_

  - [ ] 7.4 Refactor stock-mutation-form component

    - Extract mutation logic to TypeScript methods
    - Move validation to component
    - Create getters for mutation state
    - _Requirements: 1.1, 1.2, 2.1, 3.1_

  - [ ] 7.5 Refactor stock-opname-list component
    - Extract opname operations to TypeScript
    - Move calculations to component methods
    - Create computed properties for opname data
    - _Requirements: 1.1, 1.2, 2.1, 3.1_

- [ ] 8. Checkpoint - Verify medium priority components

  - Ensure all medium priority components are refactored
  - Run tests to verify functionality
  - Ask user if questions arise

- [ ] 9. Refactor utility and panel components (low priority)

  - [ ] 9.1 Refactor report-generator component

    - Extract report logic to TypeScript methods
    - Move generation logic to component
    - Create computed properties for report state
    - _Requirements: 1.1, 1.2, 2.1, 3.1_

  - [ ] 9.2 Refactor notification-panel component

    - Extract notification logic to TypeScript
    - Move handling to component methods
    - Create getters for notification state
    - _Requirements: 1.1, 1.2, 2.1, 3.1_

  - [ ] 9.3 Refactor configuration-panel component

    - Extract config logic to TypeScript methods
    - Move settings management to component
    - Create computed properties for config state
    - _Requirements: 1.1, 1.2, 2.1, 3.1_

  - [ ] 9.4 Refactor import-export-panel component

    - Extract import/export logic to TypeScript
    - Move file handling to component methods
    - Create getters for operation state
    - _Requirements: 1.1, 1.2, 2.1, 3.1_

  - [ ] 9.5 Refactor customs-sync-dashboard component
    - Extract sync logic to TypeScript methods
    - Move customs operations to component
    - Create computed properties for sync state
    - _Requirements: 1.1, 1.2, 2.1, 3.1_

- [ ] 10. Refactor authentication and user management (low priority)

  - [ ] 10.1 Refactor login component

    - Extract authentication logic to TypeScript
    - Move form handling to component methods
    - Create getters for auth state
    - _Requirements: 1.1, 1.2, 2.1, 3.1_

  - [ ] 10.2 Refactor user-list component
    - Extract user operations to TypeScript methods
    - Move filtering to component
    - Create computed properties for user data
    - _Requirements: 1.1, 1.2, 2.1, 3.1_

- [ ] 11. Refactor layout components (low priority)

  - [ ] 11.1 Refactor main-layout component

    - Extract layout logic to TypeScript methods
    - Move state management to component
    - Create computed properties for layout state
    - _Requirements: 1.1, 1.2, 3.1_

  - [ ] 11.2 Refactor auth-layout component
    - Extract layout logic to TypeScript
    - Move configuration to component methods
    - Create getters for layout state
    - _Requirements: 1.1, 1.2, 3.1_

- [ ] 12. Final verification and testing

  - [ ] 12.1 Run full test suite

    - Execute all existing unit tests
    - Verify all tests pass
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]\* 12.2 Write property tests for refactoring preservation

    - **Property 1: Refactoring Preserves Functional Behavior**
    - **Validates: Requirements 5.1, 5.2, 5.3**
    - Test that refactored components produce identical outputs for same inputs

  - [ ]\* 12.3 Write property tests for computed properties

    - **Property 2: Computed Properties Reflect State Changes**
    - **Validates: Requirements 3.3**
    - Test that getters update when underlying state changes

  - [ ] 12.4 Manual testing of critical workflows
    - Test key user workflows end-to-end
    - Verify UI behavior matches pre-refactoring
    - _Requirements: 5.1, 5.2, 5.3_

- [ ] 13. Final checkpoint
  - Ensure all components are refactored
  - Verify all tests pass
  - Confirm no regressions in functionality
  - Ask user for final review

## Notes

- Tasks marked with `*` are optional property-based tests that provide additional verification
- Each component refactoring follows the same pattern: extract logic, create computed properties, simplify templates
- Refactoring is done incrementally by priority to minimize risk
- All existing functionality must be preserved - this is purely a structural refactoring
- Each checkpoint ensures quality before moving to next priority level
