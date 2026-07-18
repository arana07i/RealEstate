# RealEstate SaaS Platform

A production-ready multi-tenant real estate SaaS platform built with Next.js, Supabase, and Stripe.

[![CI](https://github.com/arana07i/RealEstate/actions/workflows/ci.yml/badge.svg)](https://github.com/arana07i/RealEstate/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Property Listings** - Beautiful galleries with image uploads, filtering, and search
- **Inquiry Management** - Lead capture forms with status tracking (new, contacted, closed, spam)
- **Multi-Tenant Architecture** - Each agency gets isolated data and custom branding
- **Subscription Billing** - Integrated Stripe payments with 3 tiers (Starter $29/$89/$149)
- **Authentication** - Supabase Auth with email/password
- **Admin Dashboard** - Manage listings, inquiries, and agency settings
- **Rate Limiting** - Redis-backed API protection
- **Security Headers** - CSP, HSTS, X-Frame-Options, XSS Protection
- **Health Monitoring** - `/api/health` endpoint for status checks
- **Audit Logging** - All admin actions logged for compliance

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Payments**: Stripe Checkout + Webhooks
- **Infrastructure**: Redis (rate limiting, caching)
- **Testing**: Vitest (unit), Playwright (e2e)

## Project Structure

```
/app              # Next.js App Router (pages, layouts, API routes)
  /(site)         # Public marketing pages
  /admin          # Protected admin dashboard
  /api            # API endpoints (billing, inquiries, webhooks, health)
/components       # React components (UI + admin)
/lib              # Utilities, types, services, repositories
  /repositories   # Data access layer (agency, listing)
/e2e              # End-to-end tests
```

## Prerequisites

- Node.js 18+
- Supabase account
- Stripe account (optional for billing)
- Redis instance (optional, falls back to in-memory)

## Setup

1. **Clone and install**
   ```bash
   npm install
   ```

2. **Environment variables**
   Create `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PRICE_STARTER=price_...
   STRIPE_PRICE_PROFESSIONAL=price_...
   STRIPE_PRICE_ENTERPRISE=price_...
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   REDIS_URL=redis://... # Optional
   RESEND_API_KEY=... # Optional, for email notifications
   ```

3. **Database setup**
   Run `supabase/schema.sql` in Supabase SQL Editor

4. **Storage bucket**
   Create `property-images` bucket in Supabase Storage (public)

5. **Run development server**
   ```bash
   npm run dev
   ```

## Development

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # Run ESLint
npm run test       # Run unit tests
npm run test:e2e   # Run e2e tests
```

## Deployment

### Docker

Build and run with Docker:

```bash
docker build -t realestate-saas .
docker run -p 3000:3000 realestate-saas
```

### Vercel

Deploy to Vercel with the following environment variables configured in your project settings.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check for monitoring |
| `/api/inquiries` | POST | Submit property inquiry |
| `/api/billing/checkout` | POST | Create Stripe checkout session |
| `/api/webhooks/stripe` | POST | Stripe webhook endpoint |
| `/api/admin/inquiries/[id]/status` | PUT | Update inquiry status (admin only) |

## Security

- All API routes protected with rate limiting
- Admin routes require authentication
- Security headers applied via middleware (CSP, HSTS, X-Frame-Options)
- Input validation with Zod schemas
- Agency-level data isolation enforced on all queries

## License

MIT - See LICENSE file