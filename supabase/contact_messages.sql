-- À exécuter dans Supabase : SQL Editor → New query → coller ceci → Run

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text not null,
  message text not null,
  status text not null default 'new', -- new | read
  created_at timestamptz not null default now()
);

alter table contact_messages enable row level security;

-- N'importe quel visiteur (même non connecté) peut ENVOYER un message.
create policy "Tout le monde peut envoyer un message de contact"
  on contact_messages for insert
  with check (true);

-- Personne ne peut LIRE les messages directement depuis le navigateur :
-- seul l'admin les consulte, via l'Edge Function admin-orders (clé de
-- service, jamais exposée au public). Aucune policy select = accès public
-- bloqué par défaut.

create index if not exists contact_messages_created_at_idx on contact_messages (created_at desc);
