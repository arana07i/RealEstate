-- =============================================================================
-- Phase 3B — CRM Tables Migration
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Visits table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.visits (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id               UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  property_id             UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  lead_id                 UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  agent_id                UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title                   TEXT NOT NULL,
  description             TEXT,
  location                TEXT,
  scheduled_at            TIMESTAMPTZ NOT NULL,
  duration                INTEGER CHECK (duration IS NULL OR duration > 0),
  status                  TEXT NOT NULL DEFAULT 'scheduled'
                        CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  reminder_enabled        BOOLEAN NOT NULL DEFAULT false,
  reminder_type           TEXT CHECK (reminder_type IN ('email', 'sms', 'push')),
  reminder_sent_at        TIMESTAMPTZ,
  google_calendar_event_id TEXT,
  meeting_link            TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
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

-- ---------------------------------------------------------------------------
-- 14. Add missing listing fields
-- ---------------------------------------------------------------------------
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS property_score INTEGER CHECK (property_score IS NULL OR property_score >= 0 AND property_score <= 100);
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS energy_rating TEXT;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS nearby_schools_count INTEGER CHECK (nearby_schools_count IS NULL OR nearby_schools_count >= 0);
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS distance_to_metro NUMERIC(6, 2) CHECK (distance_to_metro IS NULL OR distance_to_metro >= 0);
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS virtual_tour_url TEXT;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS agent_name TEXT;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS agent_phone TEXT;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS agent_avatar TEXT;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS agent_availability TEXT;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS amenities TEXT[];
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS floor_plans JSONB;

-- =============================================================================
-- End of Phase 3B Migration
-- =============================================================================