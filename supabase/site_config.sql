-- À exécuter dans Supabase : SQL Editor → New query → coller ceci → Run

create table if not exists site_config (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- Tout le monde (visiteurs du site) peut LIRE la config (produits, prix, etc.)
alter table site_config enable row level security;

create policy "Lecture publique de la config" 
  on site_config for select 
  using (true);

-- Tout le monde peut aussi ÉCRIRE pour l'instant (limitation actuelle : voir note ci-dessous)
create policy "Écriture publique de la config" 
  on site_config for all
  using (true)
  with check (true);

-- Ligne initiale (sera remplie automatiquement par le site au premier lancement
-- si elle n'existe pas, mais on peut la pré-créer vide ici)
insert into site_config (id, data)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;
