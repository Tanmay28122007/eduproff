
-- Fix 1: Disable RLS on rate_limits (internal system table, only accessed via service role)
ALTER TABLE public.rate_limits DISABLE ROW LEVEL SECURITY;

-- Fix 2: Ensure profiles table requires authentication for all SELECT access
-- The existing policies are RESTRICTIVE, but we need a PERMISSIVE base policy
-- that requires authentication. Let's verify by adding a permissive policy.
CREATE POLICY "Authenticated users only"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);
