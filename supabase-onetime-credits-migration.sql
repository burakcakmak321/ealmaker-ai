-- Supabase Dashboard > SQL Editor içinde bu sorguyu çalıştırın.
-- Tek seferlik kullanım hakkı için one_time_credits sütununu ekler.

ALTER TABLE public.usage ADD COLUMN IF NOT EXISTS one_time_credits int NOT NULL DEFAULT 0;
