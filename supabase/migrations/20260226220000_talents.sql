-- ============================================
-- Encore Representation — Talent Tables
-- ============================================

-- Talents
CREATE TABLE IF NOT EXISTS talents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  headshot_url TEXT,
  bio TEXT,
  featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Talent Roles / Characters
CREATE TABLE IF NOT EXISTS talent_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID NOT NULL REFERENCES talents(id) ON DELETE CASCADE,
  character_name TEXT NOT NULL,
  show_name TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Talent Gallery Images
CREATE TABLE IF NOT EXISTS talent_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID NOT NULL REFERENCES talents(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_talents_sort ON talents(sort_order, last_name);
CREATE INDEX IF NOT EXISTS idx_talents_featured ON talents(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_talent_roles_talent ON talent_roles(talent_id);
CREATE INDEX IF NOT EXISTS idx_talent_images_talent ON talent_images(talent_id);

-- RLS: Public read, admin-only write
ALTER TABLE talents ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_images ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "talents_public_read" ON talents FOR SELECT USING (true);
CREATE POLICY "talent_roles_public_read" ON talent_roles FOR SELECT USING (true);
CREATE POLICY "talent_images_public_read" ON talent_images FOR SELECT USING (true);

-- Admin write policies (uses has_role function from existing schema)
CREATE POLICY "talents_admin_write" ON talents FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "talent_roles_admin_write" ON talent_roles FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "talent_images_admin_write" ON talent_images FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Storage bucket for talent media
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('talent-media', 'talent-media', true, 10485760)
ON CONFLICT (id) DO NOTHING;

-- Public read on talent-media bucket
CREATE POLICY "talent_media_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'talent-media');

-- Admin upload/delete on talent-media bucket
CREATE POLICY "talent_media_admin_write" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'talent-media'
    AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "talent_media_admin_delete" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'talent-media'
    AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Updated_at trigger for talents
CREATE OR REPLACE FUNCTION update_talents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER talents_updated_at
  BEFORE UPDATE ON talents
  FOR EACH ROW
  EXECUTE FUNCTION update_talents_updated_at();
