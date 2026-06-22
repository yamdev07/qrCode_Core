# Mise en place Supabase (cartes & administration)

Étapes à faire **une seule fois** dans le dashboard Supabase du projet.

## 1. Variables d'environnement

Dans `.env` à la racine :

```
VITE_SUPABASE_URL=https://<projet>.supabase.co
VITE_SUPABASE_ANON_KEY=<clé anon / publishable>
```

Puis redémarrer `npm run dev`.

## 2. Stockage des images et des QR

- **Storage → New bucket** → nom **`cartes`** → cocher **Public** → Create.
- Policies de stockage (SQL Editor) si l'upload échoue :

```sql
create policy "cartes_insert_anon" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'cartes');
create policy "cartes_update_anon" on storage.objects
  for update to anon, authenticated
  using (bucket_id = 'cartes') with check (bucket_id = 'cartes');
create policy "cartes_read_public" on storage.objects
  for select to anon using (bucket_id = 'cartes');
```

## 3. Suivi des cartes + administration

- **SQL Editor** → coller le contenu de [`admin-setup.sql`](./admin-setup.sql) → **Run**.
  (Crée la table `cards`, les policies RLS et la fonction `increment_card_scan`.)

## 4. Compte administrateur

- **Authentication → Users → Add user** → renseigner email + mot de passe.
- Ce compte sert à se connecter sur la page **`/admin`** de l'application.

## Récapitulatif du fonctionnement

- À la génération d'une carte : les images + le QR (`qr.png`) sont stockés
  dans `cartes/{id}/`, et une ligne est insérée dans la table `cards`.
- Le QR encode l'URL `…/carte/{id}`. À chaque ouverture de cette page,
  `increment_card_scan` augmente le compteur de scans.
- La page `/admin` (connexion requise) liste les cartes, le nombre de scans
  et permet de re-télécharger le QR stocké.
