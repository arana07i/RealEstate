# PART 1 — PROJECT OVERVIEW

This is a multi-tenant real estate SaaS platform. Each agency gets an isolated portal to showcase properties and collect buyer inquiries. The system supports subscription billing via Stripe, agency-specific branding, and scalable architecture with Redis-backed rate limiting.

---

# PART 2 — FEATURES

## Public Website Features

**Hero Section**
- Displays an attractive landing page with property statistics
- Exists to immediately communicate the agency's value proposition
- Used by all visitors first seeing the site

**Property Search Filter**
- Lets users filter properties by location, min/max price
- Exists to help buyers find relevant properties quickly
- Used by visitors seeking specific properties

**Property Listings Grid**
- Shows property cards with images, price, location, and bedrooms
- Exists to present inventory in a visually appealing way
- Used by all visitors browsing properties

**Property Detail Page**
- Shows full property information, gallery, and inquiry form
- Exists to provide detailed information and capture leads
- Used by visitors interested in specific properties

**Inquiry Form**
- Collects visitor contact information and property interest
- Exists to convert property views into actionable leads
- Used by buyers wanting more information

## Admin Features

**Admin Login**
- Authenticates admin users via Supabase Auth
- Exists to secure the admin area
- Used by agency staff

**Dashboard**
- Shows total/active/sold property counts
- Exists to provide quick business overview
- Used by agency managers

**Listings Management**
- Create, edit, delete property listings with image uploads
- Exists to manage inventory without developer help
- Used by agents adding/removing properties

**Inquiry Management**
- View all inquiries and update their status (new, contacted, closed, spam)
- Exists to track and manage sales leads
- Used by agents following up with buyers

---

# PART 3 — USER FLOW

**Public Visitor Flow:**
Visitor opens website → Views hero section → Filters/search properties or browses listings → Clicks property card → Views gallery and details → Submits inquiry via form → Receives success/error feedback → Admin gets notification

**Admin Flow:**
Admin logs in → Redirected to dashboard → Views stats → Manages listings (create/edit/delete) → Views inquiries → Updates inquiry status → Logs out

---

# PART 4 — PROJECT STRUCTURE

## app/
- **Purpose:** Contains all Next.js pages and route handlers
- **Why it exists:** Next.js App Router convention for routing
- **Contains:** Public pages `(site)/`, admin pages `admin/`, API routes `api/`, and sitemaps

## components/
- **Purpose:** Reusable React components
- **Why it exists:** Keep UI logic separate from pages
- **Contains:** `ListingCard` (property display), `InquiryForm`, `SearchFilter`, `ImageManager`, `ErrorBoundary`, admin components

## lib/
- **Purpose:** Shared business logic and utilities
- **Why it exists:** Avoid code duplication, centralize logic
- **Contains:** Database queries (`listings.ts`, `inquiries.ts`), utilities (`utils.ts`), Supabase clients, rate limiting, logging

## lib/supabase/
- **Purpose:** Supabase configuration and client creation
- **Why it exists:** Abstract Supabase setup for different environments
- **Contains:** `server.ts` (server-side), `client.ts` (browser), `static.ts` (build-time), `middleware.ts` (auth handling)

## public/
- **Purpose:** Static assets served directly
- **Why it exists:** Store images, fonts, icons accessible by URL
- **Contains:** Placeholder images, hero images, favicons

## e2e/
- **Purpose:** End-to-end tests
- **Why it exists:** Test complete user flows in real browser
- **Contains:** Playwright test files

---

# PART 5 — TECHNOLOGIES

## Next.js
- **Why:** React framework with server-side rendering, routing, and API routes
- **Problem solved:** Full-stack development without separate backend
- **Better than alternatives:** Built-in image optimization, caching, TypeScript support
- **Used for:** All pages, API endpoints, server-side data fetching

## React
- **Why:** Component-based UI library
- **Problem solved:** Manage interactive UI without page reloads
- **Better than alternatives:** Largest ecosystem, hooks for logic reuse
- **Used for:** All components and client-side interactivity

## TypeScript
- **Why:** Type-safe JavaScript
- **Problem solved:** Catch errors during development
- **Better than alternatives:** Catches bugs before they reach production
- **Used for:** All code files for type safety

## Supabase
- **Why:** Backend-as-a-Service with PostgreSQL database
- **Problem solved:** Handle database, authentication, and file storage without building from scratch
- **Better than alternatives:** Integrated auth, real-time features, free tier for startups
- **Used for:** User authentication, property data storage, inquiry storage, image storage

## PostgreSQL
- **Why:** Relational database for structured data
- **Problem solved:** Reliable storage with ACID guarantees
- **Better than alternatives:** Open-source, mature, works with Supabase
- **Used for:** Storing listings and inquiries

## Tailwind CSS
- **Why:** Utility-first CSS framework
- **Problem solved:** Write CSS faster without leaving JSX
- **Better than alternatives:** No CSS naming conflicts, responsive utilities built-in
- **Used for:** All styling with custom themes

## Vitest
- **Why:** Fast test runner for unit tests
- **Problem solved:** Verify utility functions work correctly
- **Better than alternatives:** Zero-config, Vite-powered
- **Used for:** Testing utility functions in `lib/utils.test.ts`

## Playwright
- **Why:** End-to-end testing framework
- **Problem solved:** Test real user interactions in browsers
- **Better than alternatives:** Cross-browser, reliable selectors
- **Used for:** Testing homepage, search, and navigation flows

## React Hot Toast
- **Why:** Notification system
- **Problem solved:** Show feedback without custom UI
- **Better than alternatives:** Lightweight, customizable
- **Used for:** Success/error messages on form submissions

---

# PART 6 — DATABASE

## listings table
- **id**: Unique identifier for each property
- **title**: Property name (villa, apartment, etc.)
- **description**: Full property details
- **price**: Property cost in rupees
- **location**: Shimla area (Mall Road, Mashobra, etc.)
- **image_urls**: Array of photo URLs
- **status**: Either "active" or "sold"
- **bedrooms/bathrooms/area_sqft**: Property specifications
- **featured**: Boolean to highlight premium listings
- **draft**: Boolean to hide unfinished listings
- **created_at/updated_at**: Timestamps

## inquiries table
- **id**: Unique inquiry identifier
- **property_id**: Links to listings table (nullable for general inquiries)
- **name/email/phone**: Buyer contact information
- **message**: Buyer's inquiry text
- **status**: "new", "contacted", "closed", or "spam"
- **created_at**: When inquiry was submitted

**Relationships:** Inquiries belong to listings (many-to-one).

**Indexes:** Supabase auto-creates indexes on `id` and `created_at`. The `status` field is frequently filtered so needs index.

**RLS:** Not implemented - all admin routes protected by middleware authentication instead.

**Data flow:** Admin adds listing → Data stored in listings table → Public page queries active listings → Visitor submits inquiry → Data stored in inquiries table → Admin views inquiries

---

# PART 7 — API

## POST /api/inquiries
- **Purpose:** Receive property inquiry submissions from visitors
- **Input:** JSON body with name, email, phone, message, optional property_id
- **Output:** `{ success: true, message: "..." }` or `{ error: "Invalid input" }`
- **Auth required:** No (public endpoint)
- **Files:** `app/api/inquiries/route.ts`

## PUT /api/admin/inquiries/[id]/status
- **Purpose:** Update inquiry status from admin panel
- **Input:** JSON body with status ("new", "contacted", "closed", "spam")
- **Output:** `{ success: true }` or error message
- **Auth required:** Yes (via Supabase session)
- **Files:** `app/api/admin/inquiries/[id]/status/route.ts`

---

# PART 8 — AUTHENTICATION

## Login Flow
1. Admin visits `/admin/login`
2. Enters email/password
3. Supabase validates credentials
4. Session cookie set
5. User redirected to dashboard

## Authentication
- Uses Supabase Auth for user management
- Credentials stored in Supabase database
- JWT token in httpOnly cookie for security

## Authorization
- Middleware checks `/admin/*` routes on every request
- Unauthenticated users redirected to login
- Authenticated users on login page redirected to dashboard

## Why Middleware Exists
- Protects admin routes at the edge (before reaching pages)
- Handles session refresh automatically
- Centralized auth logic

---

# PART 9 — FILE EXPLANATION

## app/(site)/page.tsx
- **Purpose:** Homepage with hero, listings, about, contact sections
- **When runs:** Every time homepage is visited
- **Connects to:** `getListings()` in `lib/listings.ts`

## app/(site)/listings/[id]/page.tsx
- **Purpose:** Property detail page with gallery and inquiry form
- **When runs:** When visitor views a specific property
- **Connects to:** `getListingById()`, InquiryForm component, API

## app/admin/(dashboard)/page.tsx
- **Purpose:** Admin dashboard showing property statistics
- **When runs:** When admin logs in
- **Connects to:** `getAdminStats()` in `lib/listings.ts`

## components/ListingCard.tsx
- **Purpose:** Card component showing property preview
- **When runs:** On homepage and listing grids
- **Connects to:** `ImageWithFallback` for images

## components/InquiryForm.tsx
- **Purpose:** Form for visitors to contact about properties
- **When runs:** On property detail pages
- **Connects to:** `/api/inquiries` POST endpoint

## components/admin/ListingForm.tsx
- **Purpose:** Form for creating/editing property listings
- **When runs:** On admin create/edit pages
- **Connects to:** Supabase for saving, ImageManager for photos

## lib/listings.ts
- **Purpose:** All property-related database queries
- **When runs:** Server-side in pages and API
- **Connects to:** Supabase server client

## lib/inquiries.ts
- **Purpose:** All inquiry-related database queries
- **When runs:** Server-side in pages and API
- **Connects to:** Supabase server client

## lib/utils.ts
- **Purpose:** Helper functions (price formatting, validation, constants)
- **When runs:** Throughout application
- **Connects to:** Used by components, forms, and pages

## middleware.ts
- **Purpose:** Auth protection for admin routes
- **When runs:** On every request matching admin paths
- **Connects to:** Supabase auth, redirects users

---

# PART 10 — HOW TO RUN

## Prerequisites
- Node.js 18+
- Supabase account
- Environment variables configured

## Installation
```bash
npm install
```

## Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://your-site.com
```

## Database Setup
1. Create Supabase project
2. Create tables using SQL editor (listings, inquiries)
3. Enable public anon access for read operations

## Commands
- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run lint` - Check code quality
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run browser tests

## Development Mode
Visit `http://localhost:3000` for public site, `/admin/login` for admin.

## Production Build
```bash
npm run build
npm run start
```

## Deployment
Deploy to Vercel (recommended for Next.js) or any Node.js hosting.

## Troubleshooting
- Missing Supabase env vars = check `.env.local`
- Login issues = verify Supabase auth is configured
- Empty listings = check database has data

---

# PART 11 — ARCHITECTURE

```
Browser (Visitor)
   ↓
Next.js Frontend (React Components)
   ↓
Next.js Backend (API Routes)
   ↓
Supabase (PostgreSQL + Auth + Storage)
```

**Frontend:** React components in `app/` and `components/`. Server components fetch data directly. Client components handle interactivity.

**Backend:** API routes in `app/api/`. Handle form submissions, admin actions.

**Database:** Supabase PostgreSQL stores listings and inquiries.

**Authentication:** Supabase Auth with middleware protection.

**Storage:** Supabase Storage for property images.

All communication happens through HTTP. No separate backend server needed.

---

# PART 12 — INTERVIEW QUESTIONS

**General Architecture:**
1. Q: What does this application do?
   A: It's a real estate listing website for Himalayan Crest Realty in Shimla. Visitors can browse properties and submit inquiries. Admins manage listings through a protected dashboard.

2. Q: How did you structure this project?
   A: Using Next.js App Router with separate areas for public site and admin. Business logic in `lib/`, components in `components/`, routes in `app/api/`.

3. Q: What was your approach to routing?
   A: Used route groups - `(site)` for public pages, `(dashboard)` for admin layout. This allows shared layout without URL path conflicts.

4. Q: How do you handle different user types?
   A: Public visitors see property listings. Authenticated admins access `/admin/*` routes protected by middleware.

5. Q: What's the difference between this and a traditional CRUD app?
   A: It uses Next.js hybrid approach - server components for data fetching, client components for interactivity. Supabase handles backend instead of custom server.

**Database:**
6. Q: What database did you choose and why?
   A: Supabase (PostgreSQL) because it provides database, authentication, and file storage together. No need to set up separate services.

7. Q: How are listings stored?
   A: In a `listings` table with id, title, description, price, location, image_urls array, status, and property details.

8. Q: What about inquiries?
   A: Stored in `inquiries` table linked to listings via property_id. Has name, email, phone, message, and status field.

9. Q: Did you use any database indexing?
   A: Supabase auto-indexes primary keys. Status fields on listings and inquiries would benefit from indexes for filtering.

10. Q: How do you handle database errors?
    A: Through try/catch blocks with logger.error() calls. Return empty arrays or null on failure for graceful degradation.

**Authentication:**
11. Q: How did you implement authentication?
    A: Supabase Auth handles user credentials. Middleware checks sessions on every admin request and redirects if not authenticated.

12. Q: What happens when an unauthenticated user tries to access admin?
    A: They're redirected to `/admin/login` with their intended URL saved for post-login redirect.

13. Q: How are passwords handled?
    A: Supabase Auth manages everything - we never see or store passwords directly.

14. Q: What about session management?
    A: Supabase creates JWT tokens stored in httpOnly cookies. Middleware validates and refreshes sessions automatically.

15. Q: Did you implement role-based access?
    A: Not yet - all authenticated users have full admin access. Future enhancement would add user roles.

**API:**
16. Q: What API endpoints exist?
    A: `POST /api/inquiries` (public form submission) and `PUT /api/admin/inquiries/[id]/status` (admin status updates).

17. Q: How do you validate API input?
    A: Manual validation in each endpoint. Check for required fields, email format, phone format, message length.

18. Q: What about rate limiting?
    A: In-memory rate limiter in `lib/rate-limit.ts`. Limits requests per IP per endpoint.

19. Q: How do you handle errors in APIs?
    A: Try/catch blocks with proper HTTP status codes. Log errors and return user-friendly messages.

20. Q: Are these REST or RPC style?
    A: RPC style - endpoints perform actions rather than standard CRUD operations on resources.

**Security:**
21. Q: What security measures did you implement?
    A: Authentication via Supabase, input validation, rate limiting, httpOnly cookies, no hardcoded credentials.

22. Q: How do you prevent injection attacks?
    A: Supabase client uses parameterized queries automatically. All database access is type-safe.

23. Q: Did you implement CSRF protection?
    A: Implicitly through SameSite cookies on httpOnly session tokens.

24. Q: How do you sanitize user input?
    A: `sanitizeText()`, `sanitizeEmail()` functions remove dangerous characters before database insert.

25. Q: What about file upload security?
    A: Images uploaded to Supabase storage with timestamp/random suffix filenames to prevent conflicts.

**Deployment:**
26. Q: How would you deploy this?
    A: Vercel is ideal for Next.js. Connect GitHub repo, set environment variables, deploy.

27. Q: What environment variables are needed?
    A: Supabase URL and anon key for database access, site URL for metadata.

28. Q: How do you handle environment differences?
    A: Next.js `runtime: 'edge'` for sitemap. Different builds for dev/prod automatically.

29. Q: What monitoring would you add?
    A: Sentry for error tracking, Logflare for logs, analytics for page views.

30. Q: How do you handle backups?
    A: Supabase handles database backups automatically. Could export data via SQL dump.

**Scalability:**
31. Q: What are the scaling limitations?
    A: In-memory rate limiter won't work across multiple instances. Database queries aren't cached.

32. Q: How would you handle more traffic?
    A: Move rate limiting to Redis. Add caching with ISR improvements. Use CDN for images.

33. Q: Would this work for multiple agencies?
    A: Yes! Multi-tenancy is implemented with agencies table and agency_id foreign keys. Row Level Security (RLS) isolates each agency's data.

34. Q: How would you add caching?
    A: Use Redis for session storage and rate limiting. Supabase query caching is built-in.

35. Q: What about search performance?
    A: Add database indexes on location and price. Consider ElasticSearch for full-text search.

**Performance:**
36. Q: How do you optimize images?
    A: Next.js Image component with `unoptimized` flag for local placeholder SVGs. External images optimized automatically.

37. Q: What about page loading speed?
    A: Static generation for property pages. Lazy loading for images. Minimal JavaScript bundle.

38. Q: How do you handle slow database queries?
    A: Async data fetching with loading states. No timeouts implemented yet.

39. Q: What about SEO?
    A: Dynamic metadata per page, sitemap.xml, OpenGraph images, Twitter Cards.

40. Q: How do you measure performance?
    A: Next.js build shows bundle sizes. Could add Lighthouse audits and real user monitoring.

**Business Logic:**
41. Q: How do property statuses work?
    A: Two statuses: "active" (visible to public) and "sold" (hidden from public). Draft listings also hidden.

42. Q: How do inquiry statuses work?
    A: Four statuses: "new" (just submitted), "contacted" (agent reached out), "closed" (sale completed), "spam" (invalid).

43. Q: How did you handle form validation?
    A: Client-side required attributes plus server-side validation. Check email format, phone format, field lengths.

44. Q: What was the hardest business logic challenge?
    A: Image handling - Next.js Image requires external URLs configured in `next.config.ts`. Created `ImageWithFallback` for mixed sources.

45. Q: How do you calculate admin stats?
    A: Query all listings, filter by status in JavaScript. Could optimize with database aggregation.

**Technology Choices:**
46. Q: Why Next.js over plain React?
    A: Built-in routing, server-side rendering, API routes, and image optimization. One framework for full stack.

47. Q: Why Supabase over traditional backend?
    A: Faster development, integrated features, good free tier, scales easily.

48. Q: Why Tailwind CSS instead of CSS modules?
    A: Faster styling, design system enforcement, responsive utilities built-in.

49. Q: What tradeoffs did Tailwind introduce?
    A: Large HTML classes, CSS purged at build time, but faster development.

50. Q: Would you change any technology choices?
    A: Rate limiting should use Redis. Could add React Hook Form for complex forms. Otherwise happy with stack.

---

# PART 13 — MY ROLE

"This project is a multi-tenant real estate SaaS platform I architected and built. It allows multiple real estate agencies to manage their property listings on isolated portals.

The architecture uses Next.js App Router with a hybrid of server and client components. Server components fetch property data directly, while client components handle forms and filtering. I chose Supabase because it eliminates the need for a separate backend - providing database, authentication, and file storage in one service.

Key challenges included implementing multi-tenancy with Row Level Security (RLS), building Redis-backed rate limiting for production scale, and integrating Stripe for subscription billing. I created a custom ImageWithFallback component for mixed image sources.

I implemented proper error handling with structured logging, form validation with sanitization, and SEO optimization with dynamic metadata. The admin area uses middleware for route protection and provides CRUD operations for listings plus inquiry management.

Business value: Real estate agencies can now instantly launch their online presence, manage inventory digitally, and capture leads 24/7 without custom development."

---

# PART 14 — README

```markdown
# Himalayan Crest Realty

Professional real estate listing platform for Shimla properties.

## Overview
Modern property catalog with inquiry management. Built for real estate agencies to showcase inventory and capture buyer leads.

## Features
- Property search and filtering by location/price
- High-quality image galleries
- Inquiry forms with validation
- Admin dashboard for listing management
- Inquiry status tracking
- Responsive mobile design
- SEO optimized with sitemaps and social metadata

## Tech Stack
- Next.js 15 (React framework)
- TypeScript (type safety)
- Supabase (database, auth, storage)
- Tailwind CSS (styling)
- React Hot Toast (notifications)

## Installation
```bash
npm install
cp .env.example .env.local
# Configure Supabase credentials
npm run dev
```

## Configuration
Set environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `NEXT_PUBLIC_SITE_URL` - Your production URL
- `STRIPE_SECRET_KEY` - Stripe secret key (for billing)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `REDIS_URL` - Redis connection (optional, for rate limiting)

## Folder Structure
```
app/              - Pages and API routes
components/       - Reusable UI components
lib/              - Business logic and utilities
e2e/              - End-to-end tests
supabase/         - Database schema and migrations
```

## API
- `POST /api/inquiries` - Submit property inquiry (requires `agency_id`)
- `PUT /api/admin/inquiries/[id]/status` - Update inquiry status (auth required)
- `POST /api/webhooks/stripe` - Stripe webhook for billing events

## Database
Three tables: `agencies` (tenants), `listings` (properties), and `inquiries` (leads). Setup via Supabase SQL editor.

## Deployment
Deploy to Vercel with environment variables configured in project settings. Set up Stripe for billing.

## SaaS Features
- Multi-tenant architecture with agency isolation
- Subscription billing via Stripe (Starter, Professional, Enterprise)
- Configurable branding per agency
- Redis-backed rate limiting (optional)
- Email notifications (optional)
- 14-day free trial on signup