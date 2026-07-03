# Contributing

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/arana07i/RealEstate`
3. Install dependencies: `npm install`
4. Create `.env.local` with required environment variables:
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
5. Run database migrations: `npx supabase db push` (or run schema.sql manually)
6. Run dev server: `npm run dev`
7. Seed demo data (optional): `npm run db:seed`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:e2e` | Run Playwright e2e tests |
| `npm run db:seed` | Seed demo data |

## Branching

- `main` - Production-ready code
- `dev` - Development branch

## Pull Requests

1. Create a feature branch from `dev`
2. Make your changes
3. Add/update tests if applicable
4. Run `npm run lint` and `npm run test` locally
5. Ensure `npm run build` succeeds
6. Submit PR to `dev` branch

## Code Style

- Use TypeScript strict mode (no `any` types)
- Follow existing component patterns (Server/Client separation)
- Add JSDoc comments for public functions
- Use `cn()` utility from `@/lib/utils` for className merging
- Use toast notifications for user feedback (`react-hot-toast`)

## Testing Strategy

- Unit tests: Place adjacent to source files or in `__tests__/`
- E2E tests: Place in `e2e/` directory
- All tests must pass on CI before merge