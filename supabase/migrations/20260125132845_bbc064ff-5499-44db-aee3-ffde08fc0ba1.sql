-- Create rate_limits table for tracking API request rates
CREATE TABLE public.rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  window_start BIGINT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for cleaning up old entries
CREATE INDEX idx_rate_limits_window ON public.rate_limits(window_start);

-- Enable RLS - only service role can access
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- No public policies - only accessible via service role in edge functions