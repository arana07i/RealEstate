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
-- Profiles (extends auth.users)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_id           UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
  email               TEXT NOT NULL,
  full_name           TEXT,
  avatar_url          TEXT,
  phone               TEXT,
  timezone            TEXT,
  two_factor_enabled  BOOLEAN NOT NULL DEFAULT false,
  two_factor_secret   TEXT,
  last_password_change TIMESTAMPTZ,
  email_verified      TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.handle_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_profiles_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- ---------------------------------------------------------------------------
-- Listings table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.listings (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id              UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  title                  TEXT NOT NULL,
  description            TEXT NOT NULL,
  price                  NUMERIC(14, 2) NOT NULL CHECK (price >= 0),
  location               TEXT NOT NULL,
  image_urls             TEXT[] NOT NULL DEFAULT '{}',
  status                 TEXT NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active', 'sold')),
  bedrooms              INTEGER CHECK (bedrooms IS NULL OR bedrooms >= 0),
  bathrooms             INTEGER CHECK (bathrooms IS NULL OR bathrooms >= 0),
  area_sqft             INTEGER CHECK (area_sqft IS NULL OR area_sqft >= 0),
  featured              BOOLEAN NOT NULL DEFAULT false,
  draft                 BOOLEAN NOT NULL DEFAULT false,
  property_score        INTEGER CHECK (property_score IS NULL OR property_score >= 0 AND property_score <= 100),
  energy_rating         TEXT,
  nearby_schools_count  INTEGER CHECK (nearby_schools_count IS NULL OR nearby_schools_count >= 0),
  distance_to_metro     NUMERIC(6, 2) CHECK (distance_to_metro IS NULL OR distance_to_metro >= 0),
  virtual_tour_url      TEXT,
  video_url             TEXT,
  agent_name            TEXT,
  agent_phone           TEXT,
  agent_avatar          TEXT,
  agent_availability    TEXT,
  amenities            TEXT[],
  floor_plans          JSONB,
  created_by            UUID,
  updated_by            UUID,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
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
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  email_opened BOOLEAN DEFAULT false,
  last_contacted_at TIMESTAMPTZ,
  source TEXT,
  created_by   UUID,
  updated_by   UUID
);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone insert inquiries" ON public.inquiries;
CREATE POLICY "Anyone insert inquiries"
  ON public.inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Agency read inquiries" ON public.inquiries;
CREATE POLICY "Agency read inquiries"
  ON public.inquiries
  FOR SELECT
  TO authenticated
  USING (agency_id = current_setting('request.agency_id')::UUID);

DROP POLICY IF EXISTS "Agency update inquiries" ON public.inquiries;
CREATE POLICY "Agency update inquiries"
  ON public.inquiries
  FOR UPDATE
  TO authenticated
  USING (agency_id = current_setting('request.agency_id')::UUID);

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
-- Webhook Events Table (for idempotency)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  processed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON public.webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_id ON public.webhook_events(stripe_event_id);

-- =============================================================================
-- CRM Tables
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Visits table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.visits (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id               UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  property_id           UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  lead_id               UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  agent_id              UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title                 TEXT NOT NULL,
  description           TEXT,
  location              TEXT,
  scheduled_at          TIMESTAMPTZ NOT NULL,
  duration              INTEGER CHECK (duration IS NULL OR duration > 0),
  status                TEXT NOT NULL DEFAULT 'scheduled'
                        CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  reminder_enabled      BOOLEAN NOT NULL DEFAULT false,
  reminder_type         TEXT CHECK (reminder_type IN ('email', 'sms', 'push')),
  reminder_sent_at      TIMESTAMPTZ,
  google_calendar_event_id TEXT,
  meeting_link          TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.handle_visits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS visits_updated_at ON public.visits;
CREATE TRIGGER visits_updated_at
  BEFORE UPDATE ON public.visits
  FOR EACH ROW EXECUTE FUNCTION public.handle_visits_updated_at();

ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agency read visits"
  ON public.visits
  FOR SELECT
  TO authenticated
  USING (agency_id = current_setting('request.agency_id')::UUID);

CREATE POLICY "Agency insert visits"
  ON public.visits
  FOR INSERT
  TO authenticated
  WITH CHECK (agency_id = current_setting('request.agency_id')::UUID);

CREATE POLICY "Agency update visits"
  ON public.visits
  FOR UPDATE
  TO authenticated
  USING (agency_id = current_setting('request.agency_id')::UUID)
  WITH CHECK (agency_id = current_setting('request.agency_id')::UUID);

CREATE POLICY "Agency delete visits"
  ON public.visits
  FOR DELETE
  TO authenticated
  USING (agency_id = current_setting('request.agency_id')::UUID);

CREATE INDEX IF NOT EXISTS idx_visits_agency_id ON public.visits(agency_id);
CREATE INDEX IF NOT EXISTS idx_visits_property_id ON public.visits(property_id);
CREATE INDEX IF NOT EXISTS idx_visits_lead_id ON public.visits(lead_id);
CREATE INDEX IF NOT EXISTS idx_visits_agent_id ON public.visits(agent_id);
CREATE INDEX IF NOT EXISTS idx_visits_scheduled_at ON public.visits(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_visits_status ON public.visits(status);

-- ---------------------------------------------------------------------------
-- 2. Leads table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id   UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  email       TEXT,
  phone       TEXT,
  status      TEXT NOT NULL DEFAULT 'new'
              CHECK (status IN ('new', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  source      TEXT,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  value       NUMERIC(14, 2) CHECK (value IS NULL OR value >= 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.handle_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS leads_updated_at ON public.leads;
CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.handle_leads_updated_at();

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agency read leads"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (agency_id = current_setting('request.agency_id')::UUID);

CREATE POLICY "Agency insert leads"
  ON public.leads
  FOR INSERT
  TO authenticated
  WITH CHECK (agency_id = current_setting('request.agency_id')::UUID);

CREATE POLICY "Agency update leads"
  ON public.leads
  FOR UPDATE
  TO authenticated
  USING (agency_id = current_setting('request.agency_id')::UUID)
  WITH CHECK (agency_id = current_setting('request.agency_id')::UUID);

CREATE POLICY "Agency delete leads"
  ON public.leads
  FOR DELETE
  TO authenticated
  USING (agency_id = current_setting('request.agency_id')::UUID);

CREATE INDEX IF NOT EXISTS idx_leads_agency_id ON public.leads(agency_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);

-- ---------------------------------------------------------------------------
-- 3. Lead notes table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lead_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  author_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.handle_lead_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS lead_notes_updated_at ON public.lead_notes;
CREATE TRIGGER lead_notes_updated_at
  BEFORE UPDATE ON public.lead_notes
  FOR EACH ROW EXECUTE FUNCTION public.handle_lead_notes_updated_at();

ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agency read lead notes"
  ON public.lead_notes ln
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = ln.lead_id
      AND l.agency_id = current_setting('request.agency_id')::UUID
    )
  );

CREATE POLICY "Agency insert lead notes"
  ON public.lead_notes ln
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = ln.lead_id
      AND l.agency_id = current_setting('request.agency_id')::UUID
    )
  );

CREATE POLICY "Agency update lead notes"
  ON public.lead_notes ln
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = ln.lead_id
      AND l.agency_id = current_setting('request.agency_id')::UUID
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = ln.lead_id
      AND l.agency_id = current_setting('request.agency_id')::UUID
    )
  );

CREATE POLICY "Agency delete lead notes"
  ON public.lead_notes ln
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = ln.lead_id
      AND l.agency_id = current_setting('request.agency_id')::UUID
    )
  );

-- ---------------------------------------------------------------------------
-- 4. Lead tags table (many-to-many relationship)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lead_tags (
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  tag_id  UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (lead_id, tag_id)
);

ALTER TABLE public.lead_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agency read lead tags"
  ON public.lead_tags lt
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = lt.lead_id
      AND l.agency_id = current_setting('request.agency_id')::UUID
    )
  );

CREATE POLICY "Agency insert lead tags"
  ON public.lead_tags lt
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = lt.lead_id
      AND l.agency_id = current_setting('request.agency_id')::UUID
    )
  );

CREATE POLICY "Agency delete lead tags"
  ON public.lead_tags lt
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = lt.lead_id
      AND l.agency_id = current_setting('request.agency_id')::UUID
    )
  );

-- ---------------------------------------------------------------------------
-- 5. Tags table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tags (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name      TEXT NOT NULL,
  color     TEXT,
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agency read tags"
  ON public.tags
  FOR SELECT
  TO authenticated
  USING (agency_id = current_setting('request.agency_id')::UUID);

CREATE POLICY "Agency insert tags"
  ON public.tags
  FOR INSERT
  TO authenticated
  WITH CHECK (agency_id = current_setting('request.agency_id')::UUID);

CREATE POLICY "Agency update tags"
  ON public.tags
  FOR UPDATE
  TO authenticated
  USING (agency_id = current_setting('request.agency_id')::UUID)
  WITH CHECK (agency_id = current_setting('request.agency_id')::UUID);

CREATE POLICY "Agency delete tags"
  ON public.tags
  FOR DELETE
  TO authenticated
  USING (agency_id = current_setting('request.agency_id')::UUID);

CREATE INDEX IF NOT EXISTS idx_tags_agency_id ON public.tags(agency_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON public.tags(name);

-- ---------------------------------------------------------------------------
-- 6. Conversations table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_name    TEXT NOT NULL,
  participant_avatar  TEXT,
  participant_presence TEXT DEFAULT 'offline' CHECK (participant_presence IN ('online', 'offline', 'away')),
  last_message        TEXT,
  last_message_at     TIMESTAMPTZ,
  unread_count        INTEGER NOT NULL DEFAULT 0,
  property_id         UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  property_inquiry    TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.handle_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS conversations_updated_at ON public.conversations;
CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.handle_conversations_updated_at();

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agency read conversations"
  ON public.conversations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = conversations.participant_id
      AND p.agency_id = current_setting('request.agency_id')::UUID
    )
  );

CREATE POLICY "Agency insert conversations"
  ON public.conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = conversations.participant_id
      AND p.agency_id = current_setting('request.agency_id')::UUID
    )
  );

CREATE POLICY "Agency update conversations"
  ON public.conversations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = conversations.participant_id
      AND p.agency_id = current_setting('request.agency_id')::UUID
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = conversations.participant_id
      AND p.agency_id = current_setting('request.agency_id')::UUID
    )
  );

CREATE POLICY "Agency delete conversations"
  ON public.conversations
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = conversations.participant_id
      AND p.agency_id = current_setting('request.agency_id')::UUID
    )
  );

CREATE INDEX IF NOT EXISTS idx_conversations_participant_id ON public.conversations(participant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_property_id ON public.conversations(property_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at DESC);

-- ---------------------------------------------------------------------------
-- 7. Messages table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_name   TEXT NOT NULL,
  sender_avatar TEXT,
  content       TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  status        TEXT NOT NULL DEFAULT 'sent'
                CHECK (status IN ('sent', 'delivered', 'read')),
  attachments   JSONB
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agency read messages"
  ON public.messages m
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      JOIN public.profiles p ON p.id = c.participant_id
      WHERE c.id = m.conversation_id
      AND p.agency_id = current_setting('request.agency_id')::UUID
    )
  );

CREATE POLICY "Agency insert messages"
  ON public.messages m
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations c
      JOIN public.profiles p ON p.id = c.participant_id
      WHERE c.id = m.conversation_id
      AND p.agency_id = current_setting('request.agency_id')::UUID
    )
  );

CREATE POLICY "Agency update messages"
  ON public.messages m
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      JOIN public.profiles p ON p.id = c.participant_id
      WHERE c.id = m.conversation_id
      AND p.agency_id = current_setting('request.agency_id')::UUID
    )
  );

CREATE POLICY "Agency delete messages"
  ON public.messages m
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      JOIN public.profiles p ON p.id = c.participant_id
      WHERE c.id = m.conversation_id
      AND p.agency_id = current_setting('request.agency_id')::UUID
    )
  );

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- ---------------------------------------------------------------------------
-- 8. Notifications table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  type      TEXT NOT NULL,
  title     TEXT NOT NULL,
  message   TEXT NOT NULL,
  priority  TEXT NOT NULL DEFAULT 'medium'
            CHECK (priority IN ('low', 'medium', 'high')),
  read      BOOLEAN NOT NULL DEFAULT false,
  data      JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.handle_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notifications_updated_at ON public.notifications;
CREATE TRIGGER notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.handle_notifications_updated_at();

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users insert own notifications"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND agency_id = current_setting('request.agency_id')::UUID);

CREATE POLICY "Users update own notifications"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own notifications"
  ON public.notifications
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_agency_id ON public.notifications(agency_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- ---------------------------------------------------------------------------
-- 9. Saved properties table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_properties (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, listing_id)
);

ALTER TABLE public.saved_properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own saved properties"
  ON public.saved_properties
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users insert own saved properties"
  ON public.saved_properties
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own saved properties"
  ON public.saved_properties
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own saved properties"
  ON public.saved_properties
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_saved_properties_user_id ON public.saved_properties(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_properties_listing_id ON public.saved_properties(listing_id);

-- ---------------------------------------------------------------------------
-- 10. Saved searches table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  filters       JSONB,
  alert_enabled BOOLEAN NOT NULL DEFAULT false,
  alert_frequency TEXT CHECK (alert_frequency IN ('instant', 'daily', 'weekly')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.handle_saved_searches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS saved_searches_updated_at ON public.saved_searches;
CREATE TRIGGER saved_searches_updated_at
  BEFORE UPDATE ON public.saved_searches
  FOR EACH ROW EXECUTE FUNCTION public.handle_saved_searches_updated_at();

ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own saved searches"
  ON public.saved_searches
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users insert own saved searches"
  ON public.saved_searches
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own saved searches"
  ON public.saved_searches
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own saved searches"
  ON public.saved_searches
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON public.saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_alert_enabled ON public.saved_searches(alert_enabled) WHERE alert_enabled = true;

-- ---------------------------------------------------------------------------
-- 11. Property comparison table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.property_comparison (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, listing_id)
);

ALTER TABLE public.property_comparison ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own property comparison"
  ON public.property_comparison
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users insert own property comparison"
  ON public.property_comparison
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own property comparison"
  ON public.property_comparison
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_property_comparison_user_id ON public.property_comparison(user_id);
CREATE INDEX IF NOT EXISTS idx_property_comparison_listing_id ON public.property_comparison(listing_id);

-- ---------------------------------------------------------------------------
-- 12. Reviews table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating     INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (listing_id, user_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read reviews"
  ON public.reviews
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated insert reviews"
  ON public.reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own reviews"
  ON public.reviews
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own reviews"
  ON public.reviews
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_reviews_listing_id ON public.reviews(listing_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);

-- ---------------------------------------------------------------------------
-- 13. Audit logs table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id   UUID,
  details       JSONB,
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agency admins read audit logs"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND ur.agency_id = current_setting('request.agency_id')::UUID
        AND r.name IN ('super_admin', 'agency_admin')
    )
  );

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON public.audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- =============================================================================
-- User Tables
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 14. User sessions table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ip_address  INET,
  user_agent  TEXT,
  location    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL,
  is_current  BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own sessions"
  ON public.user_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users insert own sessions"
  ON public.user_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own sessions"
  ON public.user_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own sessions"
  ON public.user_sessions
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_current ON public.user_sessions(is_current);

-- ---------------------------------------------------------------------------
-- 15. User preferences table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id             UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  theme               TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  sms_notifications   BOOLEAN NOT NULL DEFAULT false,
  timezone            TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  language            TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'es', 'fr', 'de', 'hi')),
  marketing_emails    BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.handle_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_preferences_updated_at();

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own preferences"
  ON public.user_preferences
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users insert own preferences"
  ON public.user_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own preferences"
  ON public.user_preferences
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own preferences"
  ON public.user_preferences
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 16. Recently viewed table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.recently_viewed (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  viewed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, listing_id)
);

ALTER TABLE public.recently_viewed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own recently viewed"
  ON public.recently_viewed
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users insert own recently viewed"
  ON public.recently_viewed
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own recently viewed"
  ON public.recently_viewed
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own recently viewed"
  ON public.recently_viewed
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_recently_viewed_user_id ON public.recently_viewed(user_id);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_listing_id ON public.recently_viewed(listing_id);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_viewed_at ON public.recently_viewed(viewed_at DESC);

-- ---------------------------------------------------------------------------
-- 17. Review points table (for detailed review ratings)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.review_points (
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  text      TEXT NOT NULL,
  rating    INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  PRIMARY KEY (review_id, text)
);

ALTER TABLE public.review_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read review points"
  ON public.review_points
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated insert review points"
  ON public.review_points rp
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.reviews r
      WHERE r.id = rp.review_id
        AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "Users update own review points"
  ON public.review_points rp
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.reviews r
      WHERE r.id = rp.review_id
        AND r.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.reviews r
      WHERE r.id = rp.review_id
        AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "Users delete own review points"
  ON public.review_points rp
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.reviews r
      WHERE r.id = rp.review_id
        AND r.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_review_points_review_id ON public.review_points(review_id);

-- =============================================================================
-- Seed Data
-- =============================================================================

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

-- ---------------------------------------------------------------------------
-- Seed Tags
-- ---------------------------------------------------------------------------
INSERT INTO public.tags (id, name, color, agency_id) VALUES
  ('aaaa0000-0000-0000-0000-000000000001', 'Hot Lead', '#ff6b6b', '00000000-0000-0000-0000-000000000001'),
  ('aaaa0000-0000-0000-0000-000000000002', 'Qualified', '#4ecdc4', '00000000-0000-0000-0000-000000000001'),
  ('aaaa0000-0000-0000-0000-000000000003', 'VIP Client', '#ffe66d', '00000000-0000-0000-0000-000000000001'),
  ('aaaa0000-0000-0000-0000-000000000004', 'Follow-up', '#1a535c', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- RBAC — Role-Based Access Control
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read roles"
  ON public.roles
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- Permissions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  resource    TEXT NOT NULL,
  action      TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read permissions"
  ON public.permissions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- User Roles (many-to-many)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id    UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  agency_id  UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role_id, agency_id)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Super admins can read any user role (agency_id IS NULL)
CREATE POLICY "Super admins read all roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND ur.agency_id IS NULL
        AND r.name = 'super_admin'
    )
  );

-- Agency admins can read roles in their agency
CREATE POLICY "Agency admins read agency roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (
    agency_id = current_setting('request.agency_id')::UUID
    AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND ur.agency_id = current_setting('request.agency_id')::UUID
        AND r.name = 'agency_admin'
    )
  );

-- ---------------------------------------------------------------------------
-- Role Permissions (many-to-many)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id       UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (role_id, permission_id)
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read role permissions"
  ON public.role_permissions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_agency_id ON public.profiles(agency_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_agency_id ON public.user_roles(agency_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON public.role_permissions(permission_id);

-- ---------------------------------------------------------------------------
-- Seed Roles
-- ---------------------------------------------------------------------------
INSERT INTO public.roles (name, description) VALUES
  ('super_admin', 'Full system access across all agencies'),
  ('agency_admin', 'Full management access within assigned agency'),
  ('agent', 'Can create and edit own listings, view and update inquiries'),
  ('viewer', 'Read-only access to listings and inquiries')
ON CONFLICT (name) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Seed Permissions
-- ---------------------------------------------------------------------------
INSERT INTO public.permissions (name, description, resource, action) VALUES
  ('manage_agencies', 'Create, update, delete agencies', 'agencies', 'manage'),
  ('manage_users', 'Manage users within agency', 'users', 'manage'),
  ('manage_listings', 'Full CRUD on listings', 'listings', 'manage'),
  ('create_listings', 'Create new listings', 'listings', 'create'),
  ('edit_own_listings', 'Edit own listings only', 'listings', 'edit_own'),
  ('edit_all_listings', 'Edit any listing in agency', 'listings', 'edit_all'),
  ('delete_listings', 'Delete listings', 'listings', 'delete'),
  ('view_listings', 'View listings', 'listings', 'view'),
  ('manage_inquiries', 'Full inquiry management', 'inquiries', 'manage'),
  ('view_inquiries', 'View inquiries', 'inquiries', 'view'),
  ('update_inquiry_status', 'Update inquiry status', 'inquiries', 'update_status'),
  ('manage_billing', 'Manage subscriptions and billing', 'billing', 'manage'),
  ('view_analytics', 'View analytics and reports', 'analytics', 'view'),
  ('manage_settings', 'Manage agency settings', 'settings', 'manage'),
  ('view_audit_logs', 'View audit logs', 'audit_logs', 'view'),
  ('view_leads', 'View leads and messages', 'crm', 'view'),
  ('manage_leads', 'Manage leads and visits', 'crm', 'manage')
ON CONFLICT (name) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Seed Role Permissions
-- ---------------------------------------------------------------------------
-- Super Admin: all permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;

-- Agency Admin: manage users, listings, inquiries, analytics, settings, audit logs
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'agency_admin'
  AND p.name IN (
    'manage_users', 'manage_listings', 'view_listings', 'manage_inquiries',
    'view_inquiries', 'update_inquiry_status', 'view_analytics', 'manage_settings',
    'view_audit_logs', 'view_leads', 'manage_leads'
  )
ON CONFLICT DO NOTHING;

-- Agent: create listings, edit own, view all listings, view/update inquiries, view leads
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'agent'
  AND p.name IN (
    'create_listings', 'edit_own_listings', 'view_listings',
    'view_inquiries', 'update_inquiry_status', 'view_leads'
  )
ON CONFLICT DO NOTHING;

-- Viewer: view listings, view inquiries
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'viewer'
  AND p.name IN ('view_listings', 'view_inquiries')
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- Helper functions
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id UUID, p_agency_id UUID)
RETURNS TEXT AS $$
DECLARE
  role_name TEXT;
BEGIN
  SELECT r.name INTO role_name
  FROM public.user_roles ur
  JOIN public.roles r ON ur.role_id = r.id
  WHERE ur.user_id = p_user_id
    AND ur.agency_id = p_agency_id
  LIMIT 1;

  RETURN COALESCE(role_name, 'viewer');
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION public.has_permission(p_user_id UUID, p_agency_id UUID, p_permission TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  has_perm BOOLEAN;
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = p_user_id
      AND ur.agency_id IS NULL
      AND r.name = 'super_admin'
  ) THEN
    RETURN TRUE;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id
      AND ur.agency_id = p_agency_id
      AND p.name = p_permission
  ) INTO has_perm;

  RETURN COALESCE(has_perm, FALSE);
END;
$$ LANGUAGE plpgsql STABLE;