# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- Initial project structure with Next.js 15 and React 19
- Multi-tenant architecture with agency-scoped data isolation
- Property listings with image uploads and search filtering
- Inquiry management system with status tracking
- Stripe subscription billing integration (Starter/Professional/Enterprise tiers)
- Supabase authentication (email/password)
- Admin dashboard for managing listings and inquiries
- Redis-backed rate limiting for API protection
- Responsive TailwindCSS styling with custom color theming
- Database schema with Row Level Security policies
- Unit tests with Vitest
- End-to-end tests with Playwright
- Docker-ready deployment configuration