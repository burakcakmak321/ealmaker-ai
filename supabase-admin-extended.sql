-- Supabase Dashboard > SQL Editor → yapıştır ve Run
-- Tüm tablolar tek seferde oluşturulur.

-- 1. activity_log (admin panel + günlük limit için)
CREATE TABLE IF NOT EXISTS public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_user_created ON public.activity_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON public.activity_log(created_at DESC);
ALTER TABLE public.activity_log DROP CONSTRAINT IF EXISTS activity_log_module_check;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- 2. page_visits (bugün kaç kişi girdi)
CREATE TABLE IF NOT EXISTS public.page_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_visits_created ON public.page_visits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_visits_user ON public.page_visits(user_id, created_at DESC);
ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;

-- 3. user_generations (Projelerim paneli)
CREATE TABLE IF NOT EXISTS public.user_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module text NOT NULL,
  title text,
  input_preview text,
  output_text text NOT NULL,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_generations_user ON public.user_generations(user_id, created_at DESC);
ALTER TABLE public.user_generations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own generations" ON public.user_generations;
CREATE POLICY "Users can read own generations"
  ON public.user_generations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own generations" ON public.user_generations;
CREATE POLICY "Users can delete own generations"
  ON public.user_generations FOR DELETE
  USING (auth.uid() = user_id);
