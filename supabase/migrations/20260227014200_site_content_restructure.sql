-- ============================================================================
-- CMS Restructure: upcoming_events, about_content, book_content tables
-- ============================================================================

-- ─── Upcoming Events ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS upcoming_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  event_date DATE,
  event_time TEXT DEFAULT '',
  location TEXT DEFAULT '',
  link_url TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE upcoming_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read upcoming_events"
  ON upcoming_events FOR SELECT USING (true);

CREATE POLICY "Authenticated write upcoming_events"
  ON upcoming_events FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated update upcoming_events"
  ON upcoming_events FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated delete upcoming_events"
  ON upcoming_events FOR DELETE TO authenticated USING (true);

-- ─── About Content ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS about_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_title TEXT DEFAULT 'About Encore Representation',
  page_description TEXT DEFAULT '',
  hero_image_url TEXT DEFAULT '',
  sections JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read about_content"
  ON about_content FOR SELECT USING (true);

CREATE POLICY "Authenticated write about_content"
  ON about_content FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated update about_content"
  ON about_content FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated delete about_content"
  ON about_content FOR DELETE TO authenticated USING (true);

-- ─── Book Content ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS book_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_title TEXT DEFAULT 'Book Talent',
  page_description TEXT DEFAULT '',
  hero_image_url TEXT DEFAULT '',
  sections JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE book_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read book_content"
  ON book_content FOR SELECT USING (true);

CREATE POLICY "Authenticated write book_content"
  ON book_content FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated update book_content"
  ON book_content FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated delete book_content"
  ON book_content FOR DELETE TO authenticated USING (true);

-- ─── Seed initial rows ──────────────────────────────────────────────────────
INSERT INTO about_content (page_title, page_description)
VALUES ('About Encore Representation', 'Encore Representation is a premier talent representation agency.')
ON CONFLICT DO NOTHING;

INSERT INTO book_content (page_title, page_description)
VALUES ('Book Talent', 'Interested in booking one of our talented clients? Reach out to us.')
ON CONFLICT DO NOTHING;
