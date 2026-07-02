# Milestone 3: Portfolio Polish & UX Enhancement

## Goal
Polish the portfolio with enhanced user experience, accessibility, and SEO for technical showcase.

## Tasks

### 1. Add Inquiry Form to Listing Detail (Must Have)
**File:** app\(site)\listings\[id]\page.tsx
**Issue:** Listing detail only shows static contact info - no interactive inquiry form
**Fix:** Add InquiryForm component to the "Schedule a Viewing" aside section
**Validation:** Manual QA - form submits successfully on listing page

### 2. Create Unified ImageWithFallback Component (Must Have)
**File:** components/ListingCard.tsx, app\(site)\listings\[id]\page.tsx
**Issue:** Mixed Image/img with eslint-disable comments for local/placeholder images
**Fix:** Create ImageWithFallback component that handles both external and local images
**Validation:** npm run build passes without eslint-disable comments

### 3. Add Admin Stats Dashboard (Should Have)
**File:** app/admin/(dashboard)/page.tsx
**Issue:** Dashboard page exists but lacks meaningful stats display
**Fix:** Add summary cards showing total/active/sold listings count
**Validation:** Manual QA - stats display correctly on admin dashboard

### 4. Improve Table Accessibility (Should Have)
**File:** components/admin/InquiriesClient.tsx, app/admin/(dashboard)/listings/page.tsx
**Issue:** Tables missing scope attributes and proper semantic structure
**Fix:** Add scope="col" to headers, improve row semantics
**Validation:** Manual QA with keyboard navigation

### 5. Add Twitter Cards to Metadata (Nice to Have)
**File:** app\(site)\listings\[id]\page.tsx
**Issue:** Listing pages only have basic OpenGraph metadata
**Fix:** Add twitter:card and twitter:site metadata for social sharing
**Validation:** npm run build succeeds

## Validation Steps
- npm run build succeeds
- npm run lint passes
- Manual QA of inquiry form flow
- Keyboard navigation works for tables
