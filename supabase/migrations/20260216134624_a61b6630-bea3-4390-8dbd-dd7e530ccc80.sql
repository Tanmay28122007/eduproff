
-- Create issued_certificates table for institution-issued certificates
CREATE TABLE public.issued_certificates (
  certificate_id TEXT NOT NULL PRIMARY KEY,
  student_name TEXT NOT NULL,
  course_name TEXT NOT NULL,
  institution_id UUID NOT NULL,
  issue_date DATE NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.issued_certificates ENABLE ROW LEVEL SECURITY;

-- Institutions can insert their own certificates
CREATE POLICY "Institutions can insert certificates"
ON public.issued_certificates
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = institution_id
  AND has_role(auth.uid(), 'institution'::app_role)
);

-- Institutions can view their own certificates
CREATE POLICY "Institutions can view own certificates"
ON public.issued_certificates
FOR SELECT
TO authenticated
USING (
  auth.uid() = institution_id
  AND has_role(auth.uid(), 'institution'::app_role)
);

-- Institutions can delete their own certificates
CREATE POLICY "Institutions can delete own certificates"
ON public.issued_certificates
FOR DELETE
TO authenticated
USING (
  auth.uid() = institution_id
  AND has_role(auth.uid(), 'institution'::app_role)
);

-- Allow service role to read for verification (edge functions use service role)
-- No extra policy needed since service role bypasses RLS

-- Create index for fast certificate lookups during verification
CREATE INDEX idx_issued_certificates_id ON public.issued_certificates (certificate_id);
