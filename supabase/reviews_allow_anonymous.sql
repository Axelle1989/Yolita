-- À exécuter APRÈS reviews.sql (si tu l'as déjà exécuté avant) :
-- ajoute juste le droit de laisser un avis SANS être connecté.
-- SQL Editor → New query → coller ceci → Run

create policy "N'importe qui peut publier un avis, connecté ou non"
  on reviews for insert
  with check (user_id is null or auth.uid() = user_id);
