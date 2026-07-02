# RealEstate SaaS Platform

A production-ready multi-tenant real estate SaaS platform built with Next.js, Supabase, and Stripe.

## Features

- **Property Listings** - Beautiful galleries with image uploads, filtering, and search
- **Inquiry Management** - Lead capture forms with status tracking (new, contacted, closed, spam)
- **Multi-Tenant Architecture** - Each agency gets isolated data and custom branding
- **Subscription Billing** - Integrated Stripe payments with 3 tiers (Starter $29/$79/$199)
- **Authentication** - Supabase Auth with email/password
- **Admin Dashboard** - Manage listings, inquiries, and agency settings
- **Rate Limiting** - Redis-backed API protection

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Payments**: Stripe Checkout + Webhooks
- **Infrastructure**: Redis (rate limiting)
- **Testing**: Vitest (unit), Playwright (e2e)

## Project Structure

```
/app              # Next.js App Router (pages, layouts, API routes)
  /(site)         # Public marketing pages
  /admin          # Protected admin dashboard
  /api            # API endpoints (billing, inquiries, webhooks)
/components       # React components (UI + admin)
/lib              # Utilities, types, Supabase clients
/supabase         # Database schema + migrations
/e2e              # End-to-end tests
```

## Prerequisites

- Node.js 18+
- Supabase account
- Stripe account
- Redis instance

## Setup

1. **Clone and install**
   ```bash
   npm install
   ```

2. **Environment variables**
   Create `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PRICE_STARTER=price_...
   STRIPE_PRICE_PROFESSIONAL=price_...
   STRIPE_PRICE_ENTERPRISE=price_...
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   REDIS_URL=redis://...
   ```

3. **Database setup**
   Run `supabase/schema.sql` in Supabase SQL Editor

4. **Storage bucket**
   Create `property-images` bucket in Supabase Storage (public)

5. **Run development server**
   ```bash
   npm run dev
   ```

## Deployment

Deploy to Vercel with the following environment variables configured in your project settings.

## License

MIT - See LICENSE file