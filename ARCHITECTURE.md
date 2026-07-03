# Architecture

## Overview

This project follows a **monolithic Next.js App Router** architecture with Supabase as the backend service. Each real estate agency operates as a tenant with complete data isolation.

## Directory Structure

```
/app                    # Next.js App Router
  /(site)              # Public pages (listings, marketing, legal)
    page.tsx           # Homepage with listing grid
    listings/[id]/     # Listing detail pages
  /admin               # Protected admin dashboard
    login/page.tsx     # Auth entry point
    (dashboard)/       # Nested layout for authenticated routes
      page.tsx         # Admin dashboard (stats, quick actions)
      listings/        # Listing CRUD
      inquiries/       # Inquiry management
      billing/         # Stripe subscription management
      settings/        # Agency branding/settings
  /api                 # API routes (serverless functions)
    inquiries/route.ts     # Public inquiry submission
    billing/checkout/    # Stripe checkout session
    webhooks/stripe/     # Stripe event handling
    admin/inquiries/     # Admin inquiry operations

/components            # React components
  /admin               # Admin-only components
  *.tsx                # Shared UI components

/lib                   # Utilities and business logic
  supabase/            # Supabase client factories
  validations.ts       # Zod schemas
  error-handler.ts   # Error utilities
  rate-limit.ts        # Redis-backed rate limiting
  circuit-breaker.ts   # External API resilience
  billing.ts           # Stripe integration
  email.ts             # Email notifications
  monitoring.ts        # Error reporting interface

/supabase              # Database definitions
  schema.sql           # Full schema with RLS policies
```

## Design Decisions

### Data Fetching
- Server Components fetch data directly in component async functions
- TanStack Query (React Query) used for client-side mutations and caching
- Supabase client factories provide typed access with SSR support

### Authentication Flow
1. Admin accesses `/admin/login`
2. Supabase Auth redirects with session
3. Middleware extracts agency context from user metadata
4. RLS policies enforce data isolation per agency

### Rate Limiting
- Redis-backed with memory fallback
- TTL set on each key write for serverless reliability
- Per-endpoint limits: API (10/min), Admin API (20/min)

### Error Handling
- Centralized `ErrorBoundary` wraps all routes
- API routes use `handleError` utility
- Monitor service integration (Sentry) for production errors

## Multi-Tenancy Model

Each agency is isolated by:
1. **Database**: All tables have `agency_id` foreign key
2. **RLS**: Row Level Security policies restrict data access
3. **Auth**: Users belong to a single agency via metadata
4. **Storage**: Images stored in shared bucket, URLs tied to agency