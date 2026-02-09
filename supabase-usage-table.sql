-- Supabase Dashboard > SQL Editor içinde bu sorguyu çalıştırın.
-- Kullanım sayacı tablosu (her kullanıcı için 2 ücretsiz hak takibi).

create table if not exists public.usage (
  user_id uuid primary key references auth.users(id) on delete cascade,
  count int not null default 0,
  is_pro boolean not null default false,
  one_time_credits int not null default 0
);

-- Tablo zaten varsa: alter table public.usage add column if not exists one_time_credits int not null default 0;

alter table public.usage enable row level security;

-- Kullanıcı sadece kendi satırını okuyabilsin (API service_role ile yazacak)
create policy "Users can read own usage"
  on public.usage for select
  using (auth.uid() = user_id);
