-- ============================================================================
-- Add hero text visibility toggle and CTA vertical offset
-- ============================================================================

ALTER TABLE home_content
  ADD COLUMN IF NOT EXISTS hero_text_visible BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS cta_offset_top TEXT DEFAULT '0';
