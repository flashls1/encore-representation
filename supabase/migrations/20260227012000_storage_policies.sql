-- ============================================================================
-- Storage bucket RLS policies for: media-library, talent-media, guest-images
-- ============================================================================

-- Allow anyone to read/download files from public buckets
CREATE POLICY "Public read access on media-library"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media-library');

CREATE POLICY "Public read access on talent-media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'talent-media');

CREATE POLICY "Public read access on guest-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'guest-images');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated upload on media-library"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media-library');

CREATE POLICY "Authenticated upload on talent-media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'talent-media');

CREATE POLICY "Authenticated upload on guest-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'guest-images');

-- Allow authenticated users to update (overwrite) files
CREATE POLICY "Authenticated update on media-library"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'media-library');

CREATE POLICY "Authenticated update on talent-media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'talent-media');

CREATE POLICY "Authenticated update on guest-images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'guest-images');

-- Allow authenticated users to delete files
CREATE POLICY "Authenticated delete on media-library"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'media-library');

CREATE POLICY "Authenticated delete on talent-media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'talent-media');

CREATE POLICY "Authenticated delete on guest-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'guest-images');
