
-- 1. Enable RLS on rate_limits (service_role bypasses RLS, so no policy = locked to service_role only)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- 2. Drop overly permissive profiles policy
DROP POLICY IF EXISTS "Authenticated users only" ON public.profiles;

-- 3. Drop broken user_roles policy (used wrong column `id` instead of `user_id`)
DROP POLICY IF EXISTS "Allow user to read own role" ON public.user_roles;

-- 4. Restrict EXECUTE on SECURITY DEFINER function has_role to service_role only.
-- RLS policies invoke it via the security-definer context, so they still work.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;

REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM authenticated;

-- 5. Add format validation on issued certificate IDs
ALTER TABLE public.issued_certificates
  ADD CONSTRAINT issued_certificates_id_format
  CHECK (
    length(certificate_id) BETWEEN 3 AND 100
    AND certificate_id ~ '^[A-Za-z0-9_-]+$'
  );

-- 6. Document immutability of issued_certificates (no UPDATE policy is intentional)
COMMENT ON TABLE public.issued_certificates IS
  'Issued certificates are immutable after issuance for audit integrity. No UPDATE policy exists by design; institutions must DELETE and re-INSERT to correct errors.';
