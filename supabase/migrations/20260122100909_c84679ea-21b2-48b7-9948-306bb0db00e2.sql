-- Create certificates table for storing uploaded certificates
CREATE TABLE public.certificates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    issuer TEXT NOT NULL,
    issue_date DATE,
    certificate_url TEXT,
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed')),
    verification_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Candidates can view their own certificates
CREATE POLICY "Users can view own certificates"
ON public.certificates
FOR SELECT
USING (auth.uid() = user_id);

-- Candidates can insert their own certificates
CREATE POLICY "Users can insert own certificates"
ON public.certificates
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Candidates can update their own certificates
CREATE POLICY "Users can update own certificates"
ON public.certificates
FOR UPDATE
USING (auth.uid() = user_id);

-- Candidates can delete their own certificates
CREATE POLICY "Users can delete own certificates"
ON public.certificates
FOR DELETE
USING (auth.uid() = user_id);

-- Recruiters can view all verified certificates
CREATE POLICY "Recruiters can view verified certificates"
ON public.certificates
FOR SELECT
USING (
    verification_status = 'verified' 
    AND has_role(auth.uid(), 'recruiter'::app_role)
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_certificates_updated_at
BEFORE UPDATE ON public.certificates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();