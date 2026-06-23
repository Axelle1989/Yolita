-- À exécuter dans Supabase : SQL Editor → New query → coller ceci → Run

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_number text not null,
  items jsonb not null,
  total numeric not null,
  location jsonb,
  address text,
  payment text,
  status text not null default 'pending',
  status_history jsonb not null default '[]'::jsonb,
  admin_message text default '',
  client_message text default '',
  client_email text,
  client_name text,
  client_phone text,
  created_at timestamptz not null default now()
);

alter table orders enable row level security;

-- Un client connecté ne peut voir QUE ses propres commandes
create policy "Un client voit ses propres commandes"
  on orders for select
  using (auth.uid() = user_id);

-- Un client connecté ne peut créer une commande QUE pour lui-même
create policy "Un client crée ses propres commandes"
  on orders for insert
  with check (auth.uid() = user_id);

-- Pas de policy update/delete GÉNÉRALE pour les clients : la modification du
-- statut par l'admin et la suppression passent uniquement par l'Edge Function
-- admin-orders, qui utilise la clé de service (jamais exposée au navigateur).

-- Exception : un client peut marquer SA PROPRE commande comme "complétée"
-- (étape "j'ai bien reçu mon yaourt") depuis la page de confirmation.
create policy "Un client finalise sa propre commande"
  on orders for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists orders_created_at_idx on orders (created_at desc);
