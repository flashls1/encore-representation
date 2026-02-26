-- ============================================================================
-- SillCon 2026 — Vendor Application System
-- Adds anonymous insert for vendor applications + vendor page CMS content
-- Date: 2026-02-26
-- ============================================================================

-- ============================================================================
-- 1. RLS: Allow anonymous vendor application submissions
-- ============================================================================
CREATE POLICY "Anyone can submit vendor application"
  ON public.vendors FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- 2. Vendor Page Content — Admin-editable CMS text for public vendor page
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.vendor_page_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_intro TEXT DEFAULT '' NOT NULL,
  applications_open BOOLEAN DEFAULT TRUE NOT NULL,
  applications_cta_text TEXT DEFAULT 'Apply to Be a Vendor' NOT NULL,
  payment_section_title TEXT DEFAULT 'Vendor Payment' NOT NULL,
  payment_section_description TEXT DEFAULT 'Use the QR code below or click the link to complete your vendor booth payment via Square.' NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.vendor_page_content ENABLE ROW LEVEL SECURITY;

-- Public can see vendor page content
CREATE POLICY "Public can view vendor page content"
  ON public.vendor_page_content FOR SELECT
  USING (true);

-- Admins can manage vendor page content
CREATE POLICY "Admins can manage vendor page content"
  ON public.vendor_page_content FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed default content
INSERT INTO public.vendor_page_content (page_intro, applications_open)
VALUES (
  E'## Become a Vendor at Sill-Con 2026!\n\nWe are now accepting vendor applications for Sill-Con 2026! Whether you sell anime merchandise, artwork, cosplay supplies, collectibles, or offer related services, we''d love to have you join us at The Patriots Club on Fort Sill.\n\n### What We''re Looking For\n- Anime & manga merchandise\n- Original artwork & prints\n- Cosplay accessories & props\n- Collectible figures & toys\n- Gaming merchandise\n- Japanese snacks & treats\n- Custom apparel & accessories\n\n### Booth Information\n- Standard booth size: 10×10\n- Tables and chairs provided\n- Power available upon request\n- Load-in details will be provided after approval\n\nFill out the application below and our team will review it within 5-7 business days. You''ll receive an email with next steps once approved!',
  TRUE
)
ON CONFLICT DO NOTHING;
