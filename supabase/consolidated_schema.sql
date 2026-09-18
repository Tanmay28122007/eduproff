-- =========================================================
-- EDUPROOF CONSOLIDATED SUPABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =========================================================

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('candidate', 'recruiter', 'institution', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Timestamp update trigger helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 3. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    role_preference TEXT DEFAULT NULL,
    is_blocked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Create User Roles Table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- 5. Role Helper Functions (Security Definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- 6. Create Certificates Table (Candidate uploads)
CREATE TABLE IF NOT EXISTS public.certificates (
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

-- 7. Create Issued Certificates Table (Official institution registry)
CREATE TABLE IF NOT EXISTS public.issued_certificates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    certificate_id TEXT NOT NULL UNIQUE,
    student_name TEXT NOT NULL,
    course_name TEXT NOT NULL,
    institution_id UUID DEFAULT gen_random_uuid(),
    issue_date DATE NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_issued_certificates_id ON public.issued_certificates (certificate_id);

-- 8. Create Verification Logs Table
CREATE TABLE IF NOT EXISTS public.verification_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    certificate_id TEXT NOT NULL,
    recruiter_id UUID NOT NULL,
    status TEXT NOT NULL,
    trust_score INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 9. Create Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    content TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 10. Create Account Flags Table
CREATE TABLE IF NOT EXISTS public.account_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    flagged_by UUID NOT NULL,
    reason TEXT NOT NULL,
    flag_type TEXT NOT NULL DEFAULT 'suspicious',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID
);

-- 11. Create Rate Limits Table
CREATE TABLE IF NOT EXISTS public.rate_limits (
    key TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 0,
    window_start BIGINT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issued_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- 13. Setup RLS Policies

-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Recruiters can view candidate profiles" ON public.profiles;
CREATE POLICY "Recruiters can view candidate profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'recruiter'));

DROP POLICY IF EXISTS "Admin full access profiles" ON public.profiles;
CREATE POLICY "Admin full access profiles" ON public.profiles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- User Roles
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
CREATE POLICY "Users can insert own role" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin full access user_roles" ON public.user_roles;
CREATE POLICY "Admin full access user_roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Certificates
DROP POLICY IF EXISTS "Users can view own certificates" ON public.certificates;
CREATE POLICY "Users can view own certificates" ON public.certificates FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own certificates" ON public.certificates;
CREATE POLICY "Users can insert own certificates" ON public.certificates FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own certificates" ON public.certificates;
CREATE POLICY "Users can update own certificates" ON public.certificates FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own certificates" ON public.certificates;
CREATE POLICY "Users can delete own certificates" ON public.certificates FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Recruiters can view verified certificates" ON public.certificates;
CREATE POLICY "Recruiters can view verified certificates" ON public.certificates FOR SELECT USING (
    verification_status = 'verified' AND public.has_role(auth.uid(), 'recruiter')
);

DROP POLICY IF EXISTS "Admin full access certificates" ON public.certificates;
CREATE POLICY "Admin full access certificates" ON public.certificates FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Issued Certificates (Public lookup for verification)
DROP POLICY IF EXISTS "Public can verify issued certificates" ON public.issued_certificates;
CREATE POLICY "Public can verify issued certificates" ON public.issued_certificates FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Institutions can insert certificates" ON public.issued_certificates;
CREATE POLICY "Institutions can insert certificates" ON public.issued_certificates FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = institution_id AND public.has_role(auth.uid(), 'institution')
);

DROP POLICY IF EXISTS "Admin full access issued_certificates" ON public.issued_certificates;
CREATE POLICY "Admin full access issued_certificates" ON public.issued_certificates FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Verification Logs
DROP POLICY IF EXISTS "Recruiters can view own logs" ON public.verification_logs;
CREATE POLICY "Recruiters can view own logs" ON public.verification_logs FOR SELECT USING (auth.uid() = recruiter_id);

DROP POLICY IF EXISTS "Recruiters can insert own logs" ON public.verification_logs;
CREATE POLICY "Recruiters can insert own logs" ON public.verification_logs FOR INSERT WITH CHECK (auth.uid() = recruiter_id);

DROP POLICY IF EXISTS "Admin full access verification_logs" ON public.verification_logs;
CREATE POLICY "Admin full access verification_logs" ON public.verification_logs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Messages
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can mark received messages as read" ON public.messages;
CREATE POLICY "Users can mark received messages as read" ON public.messages FOR UPDATE TO authenticated USING (auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Admin full access messages" ON public.messages;
CREATE POLICY "Admin full access messages" ON public.messages FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Account Flags
DROP POLICY IF EXISTS "Admin full access account_flags" ON public.account_flags;
CREATE POLICY "Admin full access account_flags" ON public.account_flags FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 14. Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_certificates_updated_at ON public.certificates;
CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON public.certificates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 15. Create Storage Bucket for Certificates
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'certificates');

DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
CREATE POLICY "Allow public reads" ON storage.objects FOR SELECT USING (bucket_id = 'certificates');
