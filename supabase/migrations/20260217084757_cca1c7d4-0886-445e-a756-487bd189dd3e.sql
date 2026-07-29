
-- Create verification_logs table
CREATE TABLE public.verification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  certificate_id TEXT NOT NULL,
  recruiter_id UUID NOT NULL,
  status TEXT NOT NULL,
  trust_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;

-- Recruiters can view only their own logs
CREATE POLICY "Recruiters can view own logs"
  ON public.verification_logs
  FOR SELECT
  USING (auth.uid() = recruiter_id);

-- Recruiters can insert their own logs
CREATE POLICY "Recruiters can insert own logs"
  ON public.verification_logs
  FOR INSERT
  WITH CHECK (auth.uid() = recruiter_id);
