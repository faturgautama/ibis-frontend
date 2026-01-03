# Implementation Plan: Login UI Redesign

## Overview

This implementation plan breaks down the login UI redesign into discrete coding tasks. The focus is on fixing template syntax errors and replacing the purple gradient aesthetic with a professional color scheme using slate grays and subtle blue accents.

## Tasks

- [x] 1. Fix template syntax errors in login component

  - Fix Angular control flow syntax (@if blocks)
  - Ensure proper closing of all template blocks
  - Verify template compiles without errors
  - _Requirements: 1.1, 1.2, 1.3_

- [ ]\* 1.1 Write unit test for template compilation

  - Test that component renders without console errors
  - Test that all UI elements are present in DOM
  - _Requirements: 1.1, 1.3_

- [x] 2. Update color scheme to professional palette

  - [x] 2.1 Replace purple gradients with slate/blue color scheme

    - Update `.login-container` background from purple gradient to slate-50/slate-100
    - Update `.login-header` background from purple gradient to slate-800
    - Update header text colors to white for contrast
    - Update accent colors to blue-500 where appropriate
    - _Requirements: 2.1, 2.2, 2.4_

  - [x] 2.2 Update form styling with new color palette

    - Update input border colors to slate-300
    - Update focus states to use blue-500
    - Update error states to use red-500
    - Ensure button colors use blue-600 for primary actions
    - _Requirements: 2.2, 5.3_

  - [ ]\* 2.3 Write property test for color contrast accessibility
    - **Property 1: Color Contrast Accessibility**
    - Test all text/background combinations meet WCAG AA standards
    - Minimum 100 iterations
    - _Requirements: 2.3_

- [x] 3. Verify and enhance layout consistency

  - [x] 3.1 Verify card layout and spacing

    - Confirm card remains centered with max-width 450px
    - Verify form field spacing is consistent (1.5rem margin-bottom)
    - Ensure card shadow and border-radius are appropriate
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]\* 3.2 Write property test for consistent form element spacing

    - **Property 3: Consistent Form Element Spacing**
    - Test that all adjacent form elements have consistent vertical spacing
    - Minimum 100 iterations
    - _Requirements: 3.2_

  - [ ]\* 3.3 Write property test for responsive layout integrity
    - **Property 2: Responsive Layout Integrity**
    - Test layout across viewport widths from 320px to 2560px
    - Verify card remains centered and functional
    - Minimum 100 iterations
    - _Requirements: 3.4_

- [-] 4. Enhance form validation visual feedback

  - [ ] 4.1 Verify error message styling consistency

    - Ensure all error messages use text-red-600 class
    - Verify error messages have 0.25rem top margin
    - Confirm error messages display below their respective fields
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ]\* 4.2 Write property test for form validation error display

    - **Property 4: Form Validation Error Display**
    - Test that invalid touched fields display error messages
    - Test error styling consistency across all fields
    - Minimum 100 iterations
    - _Requirements: 5.1, 5.2_

  - [ ]\* 4.3 Write unit test for validation edge cases
    - Test empty email shows required error
    - Test invalid email format shows email error
    - Test short password shows minlength error
    - Test valid fields don't show success indicators
    - _Requirements: 5.1, 5.4_

- [ ] 5. Verify demo credentials functionality

  - [ ] 5.1 Verify demo credentials section styling

    - Confirm demo section is visually separated (border-top)
    - Verify demo buttons use outlined secondary style
    - Ensure demo buttons are properly centered
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ]\* 5.2 Write property test for demo credentials form population

    - **Property 5: Demo Credentials Form Population**
    - Test all demo roles (admin, warehouse, production, audit)
    - Verify each button populates correct email and password
    - Minimum 100 iterations
    - _Requirements: 6.4_

  - [ ]\* 5.3 Write unit test for demo credentials visibility
    - Test demo section renders when showDemoCredentials is true
    - Test demo section doesn't render when showDemoCredentials is false
    - _Requirements: 6.1_

- [ ] 6. Checkpoint - Verify all changes and run tests

  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Browser compatibility and accessibility verification

  - [ ] 7.1 Test across major browsers

    - Test in Chrome/Edge (latest 2 versions)
    - Test in Firefox (latest 2 versions)
    - Test in Safari (latest 2 versions)
    - _Requirements: 2.3, 3.4_

  - [ ]\* 7.2 Run accessibility audit
    - Verify ARIA labels are present
    - Test keyboard navigation
    - Verify screen reader compatibility
    - Check focus indicators are visible
    - _Requirements: 2.3_

- [ ] 8. Final checkpoint - Complete verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties with minimum 100 iterations
- Unit tests validate specific examples and edge cases
- No TypeScript changes required - only HTML and SCSS modifications
- Focus on fixing syntax errors first, then updating colors, then verification
