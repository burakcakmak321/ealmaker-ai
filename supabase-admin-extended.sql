-- Supabase Dashboard > SQL Editor içinde çalıştırın.
-- Admin panel genişletmesi: ziyaret takibi, kullanıcı üretim geçmişi.

-- 1. activity_log: yeni modülleri kabul et (check constraint güncelle)
-- Eski constraint varsa kaldır, yenisi daha esnek
-- Eski modül kısıtlamasını kaldır (eticaret, sosyalmedya, blogseo, transform_* eklenmiş)
ALTER TABLE public.activity_log DROP CONSTRAINT IF EXISTS activity_log_module_check;

-- 2. Sayfa ziyaretleri (bugün kaç kişi girdi)
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
-- Sadece service_role ile erişim (admin API)

-- 3. Kullanıcı üretim geçmişi (projeler kaybolmasın)
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

-- Kullanıcı sadece kendi kayıtlarını görebilsin
CREATE POLICY "Users can read own generations"
  ON public.user_generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own generations"
  ON public.user_generations FOR DELETE
  USING (auth.uid() = user_id);
