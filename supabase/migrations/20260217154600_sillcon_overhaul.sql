-- ============================================================================
-- SillCon 2026 — Production Overhaul Migration
-- Run against: vyicjgxowsyerwzfirbk.supabase.co
-- Date: 2026-02-17
-- ============================================================================

-- ============================================================================
-- 1. ENUM: Add 'vendor' role
-- ============================================================================
DO $$ BEGIN
  ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'vendor';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- 2. ALTER EXISTING TABLES — Add missing columns
-- ============================================================================

-- site_settings: theme, venue, show hours, ticket URL, event time, tiktok
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS tiktok_url TEXT,
  ADD COLUMN IF NOT EXISTS venue_name TEXT DEFAULT 'The Patriots Club',
  ADD COLUMN IF NOT EXISTS venue_address TEXT DEFAULT 'Fort Sill Army Base, Lawton, OK',
  ADD COLUMN IF NOT EXISTS show_hours_sat TEXT DEFAULT '10:00 AM – 6:00 PM',
  ADD COLUMN IF NOT EXISTS show_hours_sun TEXT DEFAULT '11:00 AM – 5:00 PM',
  ADD COLUMN IF NOT EXISTS vip_early_access TEXT DEFAULT '30 minutes before General Admission',
  ADD COLUMN IF NOT EXISTS ticket_url TEXT,
  ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'cyber-night',
  ADD COLUMN IF NOT EXISTS event_start_time TIMESTAMPTZ DEFAULT '2026-08-22T10:00:00-05:00';

-- home_content: hero modes, countdown
ALTER TABLE public.home_content
  ADD COLUMN IF NOT EXISTS hero_video_url TEXT,
  ADD COLUMN IF NOT EXISTS hero_mode TEXT DEFAULT 'image',
  ADD COLUMN IF NOT EXISTS countdown_enabled BOOLEAN DEFAULT TRUE;

-- vendors: all missing fields for full vendor management
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS contact_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS business_type TEXT,
  ADD COLUMN IF NOT EXISTS tax_id TEXT,
  ADD COLUMN IF NOT EXISTS booth_size TEXT DEFAULT '10x10',
  ADD COLUMN IF NOT EXISTS booth_quantity INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS assigned_spot TEXT,
  ADD COLUMN IF NOT EXISTS booth_fee NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS payment_url TEXT,
  ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS contract_url TEXT,
  ADD COLUMN IF NOT EXISTS contract_status TEXT DEFAULT 'not_sent',
  ADD COLUMN IF NOT EXISTS esignature_name TEXT,
  ADD COLUMN IF NOT EXISTS esignature_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS vendor_status TEXT DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS admin_notes TEXT,
  ADD COLUMN IF NOT EXISTS location_notes TEXT,
  ADD COLUMN IF NOT EXISTS special_requirements TEXT,
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- news_articles: social embed, author, tags
ALTER TABLE public.news_articles
  ADD COLUMN IF NOT EXISTS social_embed_url TEXT,
  ADD COLUMN IF NOT EXISTS author TEXT DEFAULT 'Sill-Con Team',
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- ============================================================================
-- 3. NEW TABLES
-- ============================================================================

-- Newsletter signups
CREATE TABLE IF NOT EXISTS public.newsletter_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  signed_up_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  source TEXT DEFAULT 'website'
);

ALTER TABLE public.newsletter_signups ENABLE ROW LEVEL SECURITY;

-- Volunteer applications
CREATE TABLE IF NOT EXISTS public.volunteer_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  available_saturday BOOLEAN DEFAULT FALSE NOT NULL,
  available_sunday BOOLEAN DEFAULT FALSE NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'new' NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.volunteer_applications ENABLE ROW LEVEL SECURITY;

-- Cosplay contest registrations
CREATE TABLE IF NOT EXISTS public.cosplay_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_name TEXT NOT NULL,
  character_name TEXT NOT NULL,
  series_source TEXT NOT NULL,
  reference_photo_url TEXT,
  cosplay_photo_url TEXT,
  email TEXT NOT NULL,
  category TEXT DEFAULT 'novice' NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  decline_reason TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.cosplay_registrations ENABLE ROW LEVEL SECURITY;

-- Base access content (admin-editable page)
CREATE TABLE IF NOT EXISTS public.base_access_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_title TEXT DEFAULT 'Ft Sill Base Access Pre Approval' NOT NULL,
  body_content TEXT DEFAULT '' NOT NULL,
  external_url TEXT,
  button_text TEXT DEFAULT 'Apply for Base Access',
  is_visible BOOLEAN DEFAULT TRUE NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.base_access_content ENABLE ROW LEVEL SECURITY;

-- Contact form submissions
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Vendor load-in instructions (single row, rich text)
CREATE TABLE IF NOT EXISTS public.vendor_load_in_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT DEFAULT '' NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.vendor_load_in_info ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. RLS POLICIES — New tables
-- ============================================================================

-- Newsletter: anyone can subscribe, only admin can read/delete
CREATE POLICY "Anyone can subscribe to newsletter"
  ON public.newsletter_signups FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Admins can view newsletter signups"
  ON public.newsletter_signups FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete newsletter signups"
  ON public.newsletter_signups FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Volunteers: anyone can apply, only admin can read/update/delete
CREATE POLICY "Anyone can submit volunteer application"
  ON public.volunteer_applications FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Admins can view volunteer applications"
  ON public.volunteer_applications FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update volunteer applications"
  ON public.volunteer_applications FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete volunteer applications"
  ON public.volunteer_applications FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Cosplay: anyone can register, public sees approved, admin sees all
CREATE POLICY "Anyone can register for cosplay"
  ON public.cosplay_registrations FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Public can view approved cosplay registrations"
  ON public.cosplay_registrations FOR SELECT
  USING (status = 'approved' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update cosplay registrations"
  ON public.cosplay_registrations FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete cosplay registrations"
  ON public.cosplay_registrations FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Base access: public sees if visible, admin can manage
CREATE POLICY "Public can view visible base access content"
  ON public.base_access_content FOR SELECT
  USING (is_visible = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage base access content"
  ON public.base_access_content FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Contact submissions: anyone can submit, admin can read/delete
CREATE POLICY "Anyone can submit contact form"
  ON public.contact_submissions FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Admins can view contact submissions"
  ON public.contact_submissions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete contact submissions"
  ON public.contact_submissions FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Vendor load-in: public vendors can read, admin can manage
CREATE POLICY "Vendors can view load-in info"
  ON public.vendor_load_in_info FOR SELECT
  USING (public.has_role(auth.uid(), 'vendor') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage load-in info"
  ON public.vendor_load_in_info FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- 5. STORAGE BUCKETS
-- ============================================================================

-- guest-images bucket should already exist from initial migration
-- Create remaining buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('site-assets', 'site-assets', true),
  ('vendor-logos', 'vendor-logos', true),
  ('vendor-contracts', 'vendor-contracts', false),
  ('hero-media', 'hero-media', true),
  ('cosplay-photos', 'cosplay-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: site-assets
CREATE POLICY "Public can view site assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-assets');
CREATE POLICY "Admins can upload site assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update site assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete site assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'admin'));

-- Storage RLS: vendor-logos
CREATE POLICY "Public can view vendor logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vendor-logos');
CREATE POLICY "Admins can upload vendor logos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'vendor-logos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update vendor logos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'vendor-logos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete vendor logos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'vendor-logos' AND public.has_role(auth.uid(), 'admin'));

-- Storage RLS: vendor-contracts (private — admin only)
CREATE POLICY "Admins can view vendor contracts"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vendor-contracts' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can upload vendor contracts"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'vendor-contracts' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update vendor contracts"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'vendor-contracts' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete vendor contracts"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'vendor-contracts' AND public.has_role(auth.uid(), 'admin'));

-- Storage RLS: hero-media
CREATE POLICY "Public can view hero media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'hero-media');
CREATE POLICY "Admins can upload hero media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'hero-media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update hero media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'hero-media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete hero media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'hero-media' AND public.has_role(auth.uid(), 'admin'));

-- Storage RLS: cosplay-photos
CREATE POLICY "Public can view cosplay photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cosplay-photos');
CREATE POLICY "Anyone can upload cosplay photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'cosplay-photos');
CREATE POLICY "Admins can update cosplay photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'cosplay-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete cosplay photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'cosplay-photos' AND public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- 6. REALTIME — Enable for new tables
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.guests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cosplay_registrations;

-- ============================================================================
-- 7. SEED DATA
-- ============================================================================

-- Update existing site_settings row with event info
UPDATE public.site_settings SET
  site_name = 'Sill-Con 2026',
  site_description = 'The ultimate anime convention at Fort Sill, Lawton, Oklahoma — August 22-23, 2026',
  venue_name = 'The Patriots Club',
  venue_address = 'Fort Sill Army Base, Lawton, OK',
  event_start_date = '2026-08-22',
  event_end_date = '2026-08-23',
  event_start_time = '2026-08-22T10:00:00-05:00',
  show_hours_sat = '10:00 AM – 6:00 PM',
  show_hours_sun = '11:00 AM – 5:00 PM',
  theme = 'cyber-night',
  updated_at = now();

-- Update existing home_content row
UPDATE public.home_content SET
  hero_title = 'SILL-CON 2026',
  hero_subtitle = 'The ultimate anime convention at Fort Sill, Oklahoma — August 22-23, 2026',
  cta_primary_text = 'Get Tickets',
  countdown_enabled = TRUE,
  hero_mode = 'image',
  updated_at = now();

-- Insert 5 "Coming Soon" guest placeholders
INSERT INTO public.guests (name, role, description, featured, sort_order) VALUES
  ('Coming Soon', 'Special Guest', 'Stay tuned for exciting guest announcements!', TRUE, 1),
  ('Coming Soon', 'Voice Actor', 'Guest announcement coming soon — follow us for updates!', FALSE, 2),
  ('Coming Soon', 'Artist', 'Talented artist reveal dropping soon!', FALSE, 3),
  ('Coming Soon', 'Cosplay Guest', 'Amazing cosplayer announcement on the way!', FALSE, 4),
  ('Coming Soon', 'Special Guest', 'One more surprise guest to be revealed!', FALSE, 5)
ON CONFLICT DO NOTHING;

-- Insert schedule days
INSERT INTO public.schedule_days (name, date, sort_order) VALUES
  ('Saturday', '2026-08-22', 1),
  ('Sunday', '2026-08-23', 2)
ON CONFLICT DO NOTHING;

-- Insert base access default content
INSERT INTO public.base_access_content (page_title, body_content, button_text, is_visible)
VALUES (
  'Ft Sill Base Access Pre Approval',
  E'## Base Access Requirements\n\nFort Sill is an active military installation. All attendees must be pre-approved for base access.\n\n### What You Need\n- Valid government-issued photo ID (driver''s license, state ID, or passport)\n- Vehicle registration and proof of insurance (if driving)\n- Complete the online pre-approval form at least **72 hours before the event**\n\n### Important Notes\n- All vehicles are subject to search at the gate\n- No weapons of any kind are permitted on base\n- Follow all posted speed limits and base regulations\n- GPS may not work reliably on base — follow posted signs to The Patriots Club\n\n### Day of Event\n- Use the **Medicine Bluffs Gate** entrance\n- Have your ID and confirmation email ready\n- Allow extra time for gate processing',
  'Apply for Base Access',
  TRUE
)
ON CONFLICT DO NOTHING;

-- Insert default vendor load-in info
INSERT INTO public.vendor_load_in_info (content)
VALUES (
  E'## Vendor Load-In Instructions\n\n### Saturday Load-In\n- **Arrive:** 7:00 AM - 9:00 AM\n- **Setup must be complete by:** 9:30 AM\n- **Doors open to public:** 10:00 AM\n\n### What to Bring\n- Your vendor confirmation email\n- Valid photo ID\n- All merchandise, displays, and signage\n- Extension cords (limited power outlets available)\n- Tablecloths and any booth decorations\n\n### Parking\n- Vendor parking is available in the lot adjacent to The Patriots Club\n- Unload at the vendor entrance, then move your vehicle to the parking lot\n\n### Prohibited Items\n- No outside food sales without prior approval\n- No items that violate base regulations\n- No open flames or candles\n\n### Day-of Contact\n- Event Coordinator: TBD\n- Phone: TBD'
)
ON CONFLICT DO NOTHING;

-- Update navigation items to include new pages
DELETE FROM public.navigation_items;
INSERT INTO public.navigation_items (label, url, sort_order, visible) VALUES
  ('Home', '/', 1, TRUE),
  ('Guests', '/guests', 2, TRUE),
  ('Schedule', '/schedule', 3, TRUE),
  ('Vendors', '/vendors', 4, TRUE),
  ('Cosplay', '/cosplay', 5, TRUE),
  ('News', '/news', 6, TRUE),
  ('Volunteer', '/volunteer', 7, TRUE),
  ('Base Access', '/base-access', 8, TRUE),
  ('Contact', '/contact', 9, TRUE);
