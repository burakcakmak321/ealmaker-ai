-- Supabase Dashboard > SQL Editor içinde çalıştırın.
-- Premium süre ve hak limiti için yeni sütunlar.

ALTER TABLE public.usage ADD COLUMN IF NOT EXISTS pro_expires_at timestamptz;
ALTER TABLE public.usage ADD COLUMN IF NOT EXISTS premium_credits int NOT NULL DEFAULT 0;
