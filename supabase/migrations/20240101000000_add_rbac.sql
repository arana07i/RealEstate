-- =============================================================================
-- RBAC Migration — Role-Based Access Control
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Profiles (extends auth.users)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_id   UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
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
-- 2. Roles
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
-- 3. Permissions
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
-- 4. User Roles (many-to-many)
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
-- 5. Role Permissions (many-to-many)
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
-- 6. Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_agency_id ON public.profiles(agency_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_agency_id ON public.user_roles(agency_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON public.role_permissions(permission_id);

-- ---------------------------------------------------------------------------
-- 7. Seed Roles
-- ---------------------------------------------------------------------------
INSERT INTO public.roles (name, description) VALUES
  ('super_admin', 'Full system access across all agencies'),
  ('agency_admin', 'Full management access within assigned agency'),
  ('agent', 'Can create and edit own listings, view and update inquiries'),
  ('viewer', 'Read-only access to listings and inquiries')
ON CONFLICT (name) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 8. Seed Permissions
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
  ('manage_api_keys', 'Manage API keys', 'api_keys', 'manage'),
  ('manage_webhooks', 'Manage webhooks', 'webhooks', 'manage'),
  ('view_leads', 'View leads and messages', 'crm', 'view')
ON CONFLICT (name) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 9. Seed Role Permissions
-- ---------------------------------------------------------------------------
-- Super Admin: all permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;

-- Agency Admin: manage users, listings, inquiries, analytics, settings, audit logs, api keys
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'agency_admin'
  AND p.name IN (
    'manage_users', 'manage_listings', 'view_listings', 'manage_inquiries',
    'view_inquiries', 'update_inquiry_status', 'view_analytics', 'manage_settings',
    'view_audit_logs', 'manage_api_keys'
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
-- 10. Helper function to get user role
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

-- ---------------------------------------------------------------------------
-- 11. Helper function to check permission
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_permission(p_user_id UUID, p_agency_id UUID, p_permission TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  has_perm BOOLEAN;
BEGIN
  -- Super admin has all permissions
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
