-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
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

-- Create site_settings table
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT NOT NULL DEFAULT 'Sill-Con',
  site_description TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_address TEXT,
  event_start_date DATE,
  event_end_date DATE,
  facebook_url TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  discord_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create home_content table
CREATE TABLE public.home_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_title TEXT NOT NULL DEFAULT 'Welcome to Sill-Con',
  hero_subtitle TEXT,
  hero_image_url TEXT,
  cta_primary_text TEXT,
  cta_primary_url TEXT,
  cta_secondary_text TEXT,
  cta_secondary_url TEXT,
  stats_guests INTEGER,
  stats_vendors INTEGER,
  stats_events INTEGER,
  featured_content_title TEXT,
  featured_content_description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.home_content ENABLE ROW LEVEL SECURITY;

-- Create guests table
CREATE TABLE public.guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  image_url TEXT,
  description TEXT,
  featured BOOLEAN DEFAULT false NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- Create guest_known_for table
CREATE TABLE public.guest_known_for (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID REFERENCES public.guests(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.guest_known_for ENABLE ROW LEVEL SECURITY;

-- Create vendors table
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  booth_number TEXT,
  logo_url TEXT,
  website_url TEXT,
  featured BOOLEAN DEFAULT false NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Create vendor_specialties table
CREATE TABLE public.vendor_specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  specialty TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.vendor_specialties ENABLE ROW LEVEL SECURITY;

-- Create schedule_days table
CREATE TABLE public.schedule_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.schedule_days ENABLE ROW LEVEL SECURITY;

-- Create schedule_events table
CREATE TABLE public.schedule_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID REFERENCES public.schedule_days(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT,
  event_type TEXT,
  guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  featured BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.schedule_events ENABLE ROW LEVEL SECURITY;

-- Create news_articles table
CREATE TABLE public.news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category TEXT,
  featured_image_url TEXT,
  published BOOLEAN DEFAULT false NOT NULL,
  featured BOOLEAN DEFAULT false NOT NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

-- Create navigation_items table
CREATE TABLE public.navigation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  visible BOOLEAN DEFAULT true NOT NULL,
  is_external BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;

-- Create contact_settings table
CREATE TABLE public.contact_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_title TEXT NOT NULL DEFAULT 'Contact Us',
  page_description TEXT,
  form_enabled BOOLEAN DEFAULT true NOT NULL,
  notification_email TEXT,
  success_message TEXT,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.contact_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for site_settings
CREATE POLICY "Anyone can view site settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can update site settings"
  ON public.site_settings FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for home_content
CREATE POLICY "Anyone can view home content"
  ON public.home_content FOR SELECT
  USING (true);

CREATE POLICY "Admins can update home content"
  ON public.home_content FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert home content"
  ON public.home_content FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for guests
CREATE POLICY "Anyone can view guests"
  ON public.guests FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage guests"
  ON public.guests FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for guest_known_for
CREATE POLICY "Anyone can view guest known for"
  ON public.guest_known_for FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage guest known for"
  ON public.guest_known_for FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for vendors
CREATE POLICY "Anyone can view vendors"
  ON public.vendors FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage vendors"
  ON public.vendors FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for vendor_specialties
CREATE POLICY "Anyone can view vendor specialties"
  ON public.vendor_specialties FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage vendor specialties"
  ON public.vendor_specialties FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for schedule_days
CREATE POLICY "Anyone can view schedule days"
  ON public.schedule_days FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage schedule days"
  ON public.schedule_days FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for schedule_events
CREATE POLICY "Anyone can view schedule events"
  ON public.schedule_events FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage schedule events"
  ON public.schedule_events FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for news_articles
CREATE POLICY "Anyone can view published news"
  ON public.news_articles FOR SELECT
  USING (published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage news"
  ON public.news_articles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for navigation_items
CREATE POLICY "Anyone can view visible navigation"
  ON public.navigation_items FOR SELECT
  USING (visible = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage navigation"
  ON public.navigation_items FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for contact_settings
CREATE POLICY "Anyone can view contact settings"
  ON public.contact_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can update contact settings"
  ON public.contact_settings FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime on home_content
ALTER PUBLICATION supabase_realtime ADD TABLE public.home_content;

-- Insert initial data
INSERT INTO public.site_settings (site_name, site_description)
VALUES ('Sill-Con', 'The premier anime, gaming, and pop culture convention');

INSERT INTO public.home_content (hero_title, hero_subtitle)
VALUES ('Welcome to Sill-Con', 'Your ultimate destination for anime, gaming, and pop culture');

INSERT INTO public.contact_settings (page_title, page_description, form_enabled)
VALUES ('Contact Us', 'Get in touch with the Sill-Con team', true);