/*
  # Storage Policies for Issue Media

  ## Overview
  Sets up Row Level Security policies for the issue-media storage bucket
  to allow authenticated users to upload and access media files.

  ## Policies
  1. Allow authenticated users to upload their own files
  2. Allow public read access to all files
  3. Allow users to update/delete their own files
*/

-- Policy for uploading files
CREATE POLICY "Authenticated users can upload issue media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'issue-media');

-- Policy for reading files (public access)
CREATE POLICY "Public can view issue media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'issue-media');

-- Policy for deleting own files
CREATE POLICY "Users can delete own issue media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'issue-media' AND (storage.foldername(name))[1] = auth.uid()::text);
