-- QRCode Core - PostgreSQL Schema

CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  prenoms TEXT DEFAULT '',
  poste TEXT DEFAULT '',
  scan_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cards_images (
  id SERIAL PRIMARY KEY,
  card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  image_path TEXT NOT NULL,
  mime_type TEXT DEFAULT 'image/jpeg',
  image_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  nom TEXT NOT NULL,
  code_unique TEXT UNIQUE NOT NULL,
  date TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS presences (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  utilisateur_id TEXT NOT NULL,
  agent_nom TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS qr_codes (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  image_path TEXT NOT NULL,
  mime_type TEXT DEFAULT 'image/png',
  format TEXT DEFAULT 'png',
  size INTEGER DEFAULT 300,
  margin INTEGER DEFAULT 2,
  foreground TEXT DEFAULT '#000000',
  background TEXT DEFAULT '#FFFFFF',
  error_correction_level TEXT DEFAULT 'M',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cards_images_card_id ON cards_images(card_id);
CREATE INDEX IF NOT EXISTS idx_presences_session_id ON presences(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_code_unique ON sessions(code_unique);
CREATE INDEX IF NOT EXISTS idx_qr_codes_created_at ON qr_codes(created_at DESC);
