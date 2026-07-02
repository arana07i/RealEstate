-- =============================================================================
-- RealEstate SaaS — Supabase Database Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Agencies table (tenants)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agencies (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  slug                TEXT NOT NULL UNIQUE,
  email               TEXT NOT NULL,
  phone               TEXT,
  address             TEXT,
  logo_url            TEXT,
  primary_color       TEXT DEFAULT '#0f2822',
  secondary_color     TEXT DEFAULT '#2d5a4e',
  timezone            TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  subscription_tier   TEXT NOT NULL DEFAULT 'starter'
                    CHECK (subscription_tier IN ('starter', 'professional', 'enterprise')),
  subscription_status TEXT NOT NULL DEFAULT 'trialing'
                    CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'canceled')),
  trial_ends_at       TIMESTAMPTZ,
  stripe_customer_id  TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.handle_agencies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS agencies_updated_at ON public.agencies;
CREATE TRIGGER agencies_updated_at
  BEFORE UPDATE ON public.agencies
  FOR EACH ROW EXECUTE FUNCTION public.handle_agencies_updated_at();

-- Enable RLS for agencies (required for policy creation)
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create an agency (onboarding)
DROP POLICY IF EXISTS "Anyone insert agencies" ON public.agencies;
CREATE POLICY "Anyone insert agencies"
  ON public.agencies
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Authenticated users can read their own agency
DROP POLICY IF EXISTS "Agency read agencies" ON public.agencies;
CREATE POLICY "Agency read agencies"
  ON public.agencies
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can update their own agency
DROP POLICY IF EXISTS "Agency update agencies" ON public.agencies;
CREATE POLICY "Agency update agencies"
  ON public.agencies
  FOR UPDATE
  TO authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- Listings table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.listings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id   UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  price       NUMERIC(14, 2) NOT NULL CHECK (price >= 0),
  location    TEXT NOT NULL,
  image_urls  TEXT[] NOT NULL DEFAULT '{}',
  status      TEXT NOT NULL DEFAULT 'active'
              CHECK (status IN ('active', 'sold')),
  bedrooms    INTEGER CHECK (bedrooms IS NULL OR bedrooms >= 0),
  bathrooms   INTEGER CHECK (bathrooms IS NULL OR bathrooms >= 0),
  area_sqft   INTEGER CHECK (area_sqft IS NULL OR area_sqft >= 0),
  featured    BOOLEAN NOT NULL DEFAULT false,
  draft       BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS listings_updated_at ON public.listings;
CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- Inquiries table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inquiries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id    UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  property_id  UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT NOT NULL,
  message      TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'new'
               CHECK (status IN ('new', 'contacted', 'closed', 'spam')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Anyone can create inquiries (contact form)
DROP POLICY IF EXISTS "Anyone insert inquiries" ON public.inquiries;
CREATE POLICY "Anyone insert inquiries"
  ON public.inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS inquiries_status_idx ON public.inquiries (status);
CREATE INDEX IF NOT EXISTS inquiries_created_at_idx ON public.inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS inquiries_property_id_idx ON public.inquiries (property_id);
CREATE INDEX IF NOT EXISTS inquiries_agency_id_idx ON public.inquiries (agency_id);
CREATE INDEX IF NOT EXISTS listings_status_idx ON public.listings (status);
CREATE INDEX IF NOT EXISTS listings_draft_idx ON public.listings (draft);
CREATE INDEX IF NOT EXISTS listings_featured_idx ON public.listings (featured);
CREATE INDEX IF NOT EXISTS listings_location_idx ON public.listings (location);
CREATE INDEX IF NOT EXISTS listings_price_idx ON public.listings (price);
CREATE INDEX IF NOT EXISTS listings_created_at_idx ON public.listings (created_at DESC);
CREATE INDEX IF NOT EXISTS listings_status_draft_idx ON public.listings (status, draft) WHERE status = 'active' AND draft = false;
CREATE INDEX IF NOT EXISTS listings_agency_id_idx ON public.listings (agency_id);

-- ---------------------------------------------------------------------------
-- Row Level Security for Listings
-- ---------------------------------------------------------------------------
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active listings" ON public.listings;
CREATE POLICY "Public read active listings"
  ON public.listings
  FOR SELECT
  TO anon, authenticated
  USING (status = 'active' AND draft = false);

DROP POLICY IF EXISTS "Agency read listings" ON public.listings;
CREATE POLICY "Agency read listings"
  ON public.listings
  FOR SELECT
  TO authenticated
  USING (agency_id = current_setting('request.agency_id')::UUID);

DROP POLICY IF EXISTS "Agency insert listings" ON public.listings;
CREATE POLICY "Agency insert listings"
  ON public.listings
  FOR INSERT
  TO authenticated
  WITH CHECK (agency_id = current_setting('request.agency_id')::UUID);

DROP POLICY IF EXISTS "Agency update listings" ON public.listings;
CREATE POLICY "Agency update listings"
  ON public.listings
  FOR UPDATE
  TO authenticated
  USING (agency_id = current_setting('request.agency_id')::UUID)
  WITH CHECK (agency_id = current_setting('request.agency_id')::UUID);

DROP POLICY IF EXISTS "Agency delete listings" ON public.listings;
CREATE POLICY "Agency delete listings"
  ON public.listings
  FOR DELETE
  TO authenticated
  USING (agency_id = current_setting('request.agency_id')::UUID);

-- ---------------------------------------------------------------------------
-- Storage bucket for property images
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read property images" ON storage.objects;
CREATE POLICY "Public read property images"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'property-images');

DROP POLICY IF EXISTS "Admins upload property images" ON storage.objects;
CREATE POLICY "Admins upload property images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'property-images');

DROP POLICY IF EXISTS "Admins update property images" ON storage.objects;
CREATE POLICY "Admins update property images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'property-images');

DROP POLICY IF EXISTS "Admins delete property images" ON storage.objects;
CREATE POLICY "Admins delete property images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'property-images');

-- ---------------------------------------------------------------------------
-- Seed data (remove in production or customise)
-- ---------------------------------------------------------------------------

INSERT INTO public.agencies (id, name, slug, email, phone, address, subscription_tier, subscription_status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Himalayan Crest Realty',
  'himalayan-crest',
  'hello@himalayancrestrealty.com',
  '+91 1772 123 456',
  '42 Mall Road, Near GPO, Shimla, HP 171001',
  'enterprise',
  'active'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.listings (id, agency_id, title, description, price, location, status, bedrooms, bathrooms, area_sqft, featured, draft, image_urls)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000001',
    'The Pinecrest Estate',
    'Colonial heritage bungalow with panoramic pine forest views and modern amenities.',
    28500000,
    'Chotta Shimla',
    'active',
    4,
    3,
    3200,
    true,
    false,
    ARRAY['/images/listing-1.jpg', '/images/listing-2.jpg']
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000001',
    'Summit View Residences',
    'Modern luxury apartment overlooking the Shimla valley with 24/7 security.',
    14500000,
    'Mall Road',
    'active',
    3,
    2,
    1850,
    true,
    false,
    ARRAY['/images/listing-3.jpg', '/images/listing-4.jpg']
  )
ON CONFLICT (id) DO NOTHING;