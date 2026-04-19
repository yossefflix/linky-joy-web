-- ============================================
-- SnipLink Database Schema for Supabase
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. User Roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Links table
CREATE TABLE public.links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  original_url TEXT NOT NULL,
  short_code VARCHAR(20) UNIQUE NOT NULL,
  custom_code VARCHAR(50),
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  password TEXT,  -- store hashed on the server side
  is_active BOOLEAN DEFAULT true,
  total_clicks INTEGER DEFAULT 0
);

ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- 4. Clicks table
CREATE TABLE public.clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID REFERENCES public.links(id) ON DELETE CASCADE NOT NULL,
  ip_address INET,
  country VARCHAR(100),
  device VARCHAR(100),
  browser VARCHAR(100),
  timestamp TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;

-- 5. Indexes for performance
CREATE INDEX idx_links_short_code ON public.links(short_code);
CREATE INDEX idx_links_user_id ON public.links(user_id);
CREATE INDEX idx_clicks_link_id ON public.clicks(link_id);
CREATE INDEX idx_clicks_timestamp ON public.clicks(timestamp);

-- ============================================
-- Security Definer function for role checks
-- ============================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- ============================================
-- RLS Policies
-- ============================================

-- User Roles: users can read their own roles
CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Links: users can CRUD their own links
CREATE POLICY "Users can read own links"
  ON public.links FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create links"
  ON public.links FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own links"
  ON public.links FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own links"
  ON public.links FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Links: allow anonymous read by short_code (for redirect)
CREATE POLICY "Anyone can read active links by short_code"
  ON public.links FOR SELECT
  TO anon
  USING (is_active = true);

-- Clicks: users can read clicks for their own links
CREATE POLICY "Users can read clicks for own links"
  ON public.clicks FOR SELECT
  TO authenticated
  USING (
    link_id IN (SELECT id FROM public.links WHERE user_id = auth.uid())
  );

-- Clicks: allow anonymous insert (for redirect tracking)
CREATE POLICY "Anyone can insert clicks"
  ON public.clicks FOR INSERT
  TO anon
  WITH CHECK (true);

-- Clicks: service role can insert (for API routes)
CREATE POLICY "Service can insert clicks"
  ON public.clicks FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Admin: admins can read all links
CREATE POLICY "Admins can read all links"
  ON public.links FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin: admins can read all clicks
CREATE POLICY "Admins can read all clicks"
  ON public.clicks FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- Function: increment click count
-- ============================================

CREATE OR REPLACE FUNCTION public.increment_click_count(link_short_code VARCHAR)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.links
  SET total_clicks = total_clicks + 1
  WHERE short_code = link_short_code;
END;
$$;

-- ============================================
-- Function: get admin stats
-- ============================================

CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT json_build_object(
    'totalUsers', (SELECT COUNT(*) FROM auth.users),
    'totalLinks', (SELECT COUNT(*) FROM public.links),
    'totalClicks', (SELECT COALESCE(SUM(total_clicks), 0) FROM public.links)
  ) INTO result;

  RETURN result;
END;
$$;
