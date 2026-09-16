-- À exécuter dans Supabase : SQL Editor → New query → coller ceci → Run

-- ============ FAVORIS ============
create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table favorites enable row level security;

create policy "Un client gère ses propres favoris"
  on favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============ DEMANDES DE DEVIS (acheteurs en gros) ============
create table if not exists quote_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_name text,
  client_email text,
  message text not null,
  status text not null default 'pending', -- pending | answered
  admin_response text default '',
  admin_price numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table quote_requests enable row level security;

-- Un client voit et crée SES propres demandes de devis
create policy "Un client voit ses propres devis"
  on quote_requests for select
  using (auth.uid() = user_id);

create policy "Un client crée ses propres devis"
  on quote_requests for insert
  with check (auth.uid() = user_id);

-- Pas de policy update pour le client : seul l'admin répond,
-- via l'Edge Function admin-orders (clé de service, jamais exposée au navigateur).

create index if not exists quote_requests_created_at_idx on quote_requests (created_at desc);
