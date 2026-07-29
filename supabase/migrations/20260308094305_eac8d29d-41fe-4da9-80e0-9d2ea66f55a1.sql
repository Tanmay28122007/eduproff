
CREATE TABLE public.account_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  flagged_by uuid NOT NULL,
  reason text NOT NULL,
  flag_type text NOT NULL DEFAULT 'suspicious',
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved boolean NOT NULL DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid
);

ALTER TABLE public.account_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access account_flags" ON public.account_flags
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
