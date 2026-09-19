-- À exécuter dans Supabase : SQL Editor → New query → coller ceci → Run

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  city text,
  message text not null,
  featured boolean not null default false, -- mis en avant sur la page d'accueil (max 3, géré par l'admin)
  created_at timestamptz not null default now()
);

alter table reviews enable row level security;

-- Tout visiteur du site peut lire les avis mis en avant (page d'accueil publique)
create policy "Lecture publique des avis mis en avant"
  on reviews for select
  using (featured = true);

-- Un client connecté voit aussi ses propres avis, même non encore mis en avant
create policy "Un client voit ses propres avis"
  on reviews for select
  using (auth.uid() = user_id);

-- Tout le monde peut écrire un avis, connecté ou non (aucun compte requis)
create policy "N'importe qui peut publier un avis, connecté ou non"
  on reviews for insert
  with check (user_id is null or auth.uid() = user_id);

-- Pas de policy update pour le client : seul l'admin choisit quels avis mettre
-- en avant, via l'Edge Function admin-orders (clé de service, jamais exposée
-- au navigateur).

create index if not exists reviews_created_at_idx on reviews (created_at desc);
