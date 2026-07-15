-- =====================================================================
--  Schéma complet pour l'app QR Code (PostgreSQL local)
-- =====================================================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1) Table des utilisateurs (auth admin) --------------------------------
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT NOT NULL UNIQUE,
  password    TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'admin',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Table des cartes ---------------------------------------------------
CREATE TABLE IF NOT EXISTS cards (
  id          UUID PRIMARY KEY,
  nom         TEXT NOT NULL,
  prenoms     TEXT DEFAULT '',
  poste       TEXT DEFAULT '',
  qr_path     TEXT,
  view_url    TEXT,
  scan_count  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) Table des sessions -------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom         TEXT NOT NULL,
  code_unique TEXT NOT NULL UNIQUE,
  date        TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4) Table des présences ------------------------------------------------
CREATE TABLE IF NOT EXISTS presences (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  utilisateur_id  TEXT NOT NULL,
  agent_nom       TEXT NOT NULL,
  timestamp       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_presences_session ON presences(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_code ON sessions(code_unique);

-- 5) Compteur de scans (function) ---------------------------------------
CREATE OR REPLACE FUNCTION increment_card_scan(card_id UUID)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE cards SET scan_count = scan_count + 1 WHERE id = card_id;
$$;

-- 6) Permissions pour l'utilisateur applicatif ---------------------------
GRANT USAGE ON SCHEMA public TO qradmin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO qradmin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO qradmin;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO qradmin;

-- 7) Compte admin par defaut (mot de passe: admin123)
INSERT INTO users (email, password, role)
VALUES ('admin@qrapp.local', '$2b$10$8hy0PUrdwNGZtp/dYeFcQepOwG8LFxIJvcGI.zg5mxZ3orYt/Hm9u', 'admin')
ON CONFLICT (email) DO NOTHING;
