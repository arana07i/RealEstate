# Milestone 1: Portfolio-Ready Codebase

## Goal
Clean codebase for technical portfolio showcasing with basic production stability.

## Tasks

### 1. Add Unit Tests for Utils (Must Have)
**File:** lib/utils.ts
**Create:** lib/utils.test.ts
- Test formatPrice() with crore values, lakh values, small values
- Test formatDate() with various date formats
- Test slugify() with special characters
- Test validateEmail() and validatePhone()
- Test sanitizeText() and sanitizeEmail()

### 2. Fix Deprecated Params Access (Must Have)
**File:** app/api/admin/inquiries/[id]/status/route.ts:6-7
**Issue:** Using non-promisified context.params (Next.js 15 expects async)
**Fix:** Change to const { id } = await context.params;

### 3. Replace Alert() with Toast Notifications (Must Have)
**File:** components/admin/DeleteListingButton.tsx:31
**Replace:** alert() with toast notification system
- Install react-hot-toast
- Show success/error messages inline

### 4. Add Error Logging to Server Failures (Must Have)
**Files:**
- lib/listings.ts:38-41 - Add logger.error for error cases
- Verify lib/inquiries.ts has proper logging

### 5. Add Loading States (Should Have)
**Files:**
- components/SearchFilter.tsx:100-101 - Add disabled state feedback
- Verify ListingForm loading state UX

### 6. Add E2E Test (Should Have)
**File:** e2e/basic-flow.spec.ts
**Test:** Login ? View listings ? View detail page
- Install Playwright
- Create basic test

## Validation Steps
- npm run test passes
- npm run lint passes
- npm run build succeeds
- Manual QA of error states
