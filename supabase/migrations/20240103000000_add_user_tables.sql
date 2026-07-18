-- =============================================================================
-- Phase 3B — User Tables Migration
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Add missing fields to profiles table
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS timezone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMPTZ;

-- ---------------------------------------------------------------------------
-- 2. User sessions table
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
-- 3. User preferences table
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
-- 4. Recently viewed table
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
-- 5. Review points table (for detailed review ratings)
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
-- End of Phase 3B User Tables Migration
-- =============================================================================