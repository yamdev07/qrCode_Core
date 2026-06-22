-- =====================================================================
--  Mise en place du suivi des cartes + tableau d'administration
--  À exécuter dans Supabase → SQL Editor → New query → Run.
-- =====================================================================

-- 1) Table des cartes ---------------------------------------------------
create table if not exists public.cards (
  id          uuid primary key,
  nom         text not null,
  prenoms     text default '',
  poste       text default '',
  qr_path     text,                       -- chemin du PNG du QR dans le bucket "cartes"
  view_url    text,                       -- URL /carte/:id encodée dans le QR
  scan_count  integer not null default 0, -- nombre total de scans
  created_at  timestamptz not null default now()
);

alter table public.cards enable row level security;

-- 2) Policies RLS -------------------------------------------------------
-- Insertion : depuis le navigateur avec la clé anon (lors de la génération).
drop policy if exists "cards_insert_anon" on public.cards;
create policy "cards_insert_anon"
  on public.cards for insert to anon, authenticated
  with check (true);

-- Lecture : réservée aux administrateurs connectés (tableau d'admin).
drop policy if exists "cards_select_auth" on public.cards;
create policy "cards_select_auth"
  on public.cards for select to authenticated
  using (true);

-- 3) Incrément du compteur de scans ------------------------------------
-- SECURITY DEFINER : permet d'incrémenter sans donner d'accès en lecture
-- ni en écriture directe sur la table à la clé anon.
create or replace function public.increment_card_scan(card_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.cards set scan_count = scan_count + 1 where id = card_id;
$$;

grant execute on function public.increment_card_scan(uuid) to anon, authenticated;

-- 4) Compte administrateur ---------------------------------------------
-- Crée un utilisateur dans : Authentication → Users → Add user
-- (email + mot de passe). C'est ce compte qui se connecte sur /admin.
