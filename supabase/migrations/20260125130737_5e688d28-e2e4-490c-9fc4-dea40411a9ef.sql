-- Make certificates bucket private instead of public
UPDATE storage.buckets 
SET public = false 
WHERE id = 'certificates';

-- Drop the overly permissive public read policy
DROP POLICY IF EXISTS "Public can view certificates" ON storage.objects;

-- Keep existing authenticated user policies (already exist):
-- - "Users can upload own certificates" (INSERT)
-- - "Users can update own certificates" (UPDATE) 
-- - "Users can delete own certificates" (DELETE)

-- Create policy for authenticated users to view their own certificate files
CREATE POLICY "Users can view own certificate files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'certificates' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for recruiters to view verified certificate files
CREATE POLICY "Recruiters can view verified certificate files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'certificates'
  AND EXISTS (
    SELECT 1 FROM public.certificates c
    WHERE c.certificate_url LIKE '%/' || name
    AND c.verification_status = 'verified'
    AND public.has_role(auth.uid(), 'recruiter'::app_role)
  )
);