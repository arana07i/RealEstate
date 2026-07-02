# Real Estate SaaS Platform - Setup Guide

## Prerequisites
- Node.js 18+
- Supabase account
- Stripe account (optional, for subscriptions)

## Installation

```bash
npm install
```

## Environment Variables

Configure `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional (for full features)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_PRICE_STARTER=price_starter_id
STRIPE_PRICE_PROFESSIONAL=price_professional_id
STRIPE_PRICE_ENTERPRISE=price_enterprise_id
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
RESEND_API_KEY=re_your_resend_key
REDIS_URL=redis://localhost:6379
```

## Database Setup

### Fresh Database (Recommended)

1. Create a Supabase project at https://supabase.com
2. Go to **Authentication → Providers** and enable Email provider
3. Go to **SQL Editor** and run `supabase/schema.sql`
4. Configure **Authentication → Settings → Redirect URLs** for your domain

### Existing Database Reset

```sql
-- Run in SQL Editor to reset tables
DROP TABLE IF EXISTS public.inquiries CASCADE;
DROP TABLE IF EXISTS public.listings CASCADE;
DROP TABLE IF EXISTS public.agencies CASCADE;
```

Then run `supabase/schema.sql`.

## Stripe Setup (Optional)

1. Create products in Stripe Dashboard
2. Copy Price IDs to `.env.local` as `STRIPE_PRICE_*`
3. Add webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

## Development

```bash
npm run dev
```

Visit `http://localhost:3000` for the public site.
Visit `http://localhost:3000/admin/login` for admin access.

## Production Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Supabase Production Configuration

- Enable **Realtime** for subscriptions
- Configure **Auth → Settings → External OAuth** if needed
- Set up **Cron Jobs** for maintenance if needed

## Testing

```bash
npm run test          # Unit tests
npm run test:e2e      # E2E tests
npm run lint          # Lint check
```

## Application Structure

- `app/(site)/` - Public pages (homepage, listings, legal)
- `app/admin/` - Admin dashboard (login, listings, inquiries, billing)
- `app/api/` - API routes (inquiries, webhooks, billing)
- `components/` - Reusable React components
- `lib/` - Business logic (database, utilities, rate limiting)
- `supabase/` - Database schema and migrations

## Features

**Public Site:**
- Property listings with search/filter
- Property detail pages with inquiry forms
- SEO optimized

**Admin Area:**
- Supabase Auth authentication
- Dashboard with property statistics
- CRUD operations for listings
- Inquiry management with status updates
- Billing portal (Stripe integration)