-- Supabase Dashboard > SQL Editor içinde çalıştırın.
-- Aktivite logu: günlük limit + admin paneli için kullanım takibi.

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module text not null check (module in ('fatura','pazarlik','dilekce','cv')),
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_log_user_created on public.activity_log(user_id, created_at desc);
create index if not exists idx_activity_log_created on public.activity_log(created_at desc);

alter table public.activity_log enable row level security;

-- activity_log sadece API (service_role) tarafından kullanılır; kullanıcı erişimi yok
