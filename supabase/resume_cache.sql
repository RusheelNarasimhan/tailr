CREATE TABLE IF NOT EXISTS public.resume_generation_cache (
  cache_key TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS resume_generation_cache_created_at_idx
  ON public.resume_generation_cache (created_at DESC);

ALTER TABLE public.resume_generation_cache ENABLE ROW LEVEL SECURITY;
