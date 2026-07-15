# QR Code Pro

Application de generation de QR codes pour cartes professionnelles, avec suivi des scans, gestion de sessions et marquage de presence.

## Stack technique

| Couche | Technologie |
|--------|------------|
| Frontend | Vue 3 + Vite + TypeScript |
| UI | PrimeVue + TailwindCSS |
| Etat | Pinia |
| Backend | Express.js (server/) |
| BDD | PostgreSQL (local) |
| Auth | JWT (bcrypt + jsonwebtoken) |
| Stockage | Fichiers locaux (server/uploads/) |
| Tests | Vitest |

## Architecture du projet

```
qr-code-core/
├── src/                        # Frontend Vue 3
│   ├── core/                   # Infrastructure partagee
│   │   ├── api/                # Client HTTP (ofetch)
│   │   ├── database/           # Client API local
│   │   ├── errors/             # Classes d'erreur custom
│   │   ├── logger/             # Utilitaire de log (consola)
│   │   ├── composables/        # Composables partages
│   │   ├── types/              # Types globaux
│   │   └── utils/              # Validators (Zod), formatters
│   ├── modules/                # Modules metier
│   │   ├── admin/              # Panel admin (auth, gestion cartes)
│   │   ├── generator/          # Generation QR + upload cartes
│   │   ├── scanner/            # Scan QR + marquage presence
│   │   └── sessions/           # Gestion des sessions
│   ├── router/                 # Vue Router + guards
│   ├── stores/                 # Pinia stores
│   └── views/                  # Pages (Home, Login, Admin, etc.)
│
├── server/                     # Backend Express.js
│   ├── src/
│   │   ├── index.ts            # Point d'entree du serveur
│   │   ├── db.ts               # Pool PostgreSQL (node-postgres)
│   │   ├── middleware/
│   │   │   └── auth.ts         # Middleware JWT
│   │   └── routes/
│   │       ├── auth.routes.ts  # Login / logout / session
│   │       ├── cards.routes.ts # CRUD cartes + increment scan
│   │       ├── sessions.routes.ts  # CRUD sessions
│   │       ├── presences.routes.ts # CRUD presences
│   │       └── storage.routes.ts   # Upload/serve fichiers
│   ├── uploads/                # Fichiers uploades (images, QR, meta)
│   ├── sql/
│   │   └── init.sql            # Schema de la base de donnees
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                    # Variables d'environnement backend
│
├── docker-compose.yml          # (optionnel) PostgreSQL + pgAdmin en container
├── .env                        # Variables frontend
└── package.json                # Dependances frontend
```

## Pre-requis

- Node.js >= 18
- PostgreSQL (installe localement ou via Docker)
- npm

## Installation

### 1. Cloner et installer les dependances

```bash
git clone <repo-url>
cd Qr_Code_Core

# Dependances frontend
npm install

# Dependances backend
cd server
npm install
cd ..
```

### 2. Configurer PostgreSQL

#### Option A : PostgreSQL local (recommande)

Creer la base et l'utilisateur :

```bash
sudo -u postgres psql -c "CREATE USER qradmin WITH PASSWORD 'qrpassword' CREATEDB;"
sudo -u postgres psql -c "CREATE DATABASE qrdb OWNER qradmin;"
sudo -u postgres psql -d qrdb -f server/sql/init.sql
```

#### Option B : Via Docker

```bash
docker compose up -d
```

Le schema est initialise automatiquement via `server/sql/init.sql`.

### 3. Creer le compte administrateur

Generer un hash bcrypt pour votre mot de passe :

```bash
cd server
node -e "const b=require('bcrypt');b.hash('votre_mdp',10).then(h=>console.log(h))"
```

Puis inserer l'utilisateur :

```bash
sudo -u postgres psql -d qrdb -c "INSERT INTO users (email, password, role) VALUES ('admin@qrapp.local', 'VOTRE_HASH_ICI', 'admin');"
```

Ou via `psql` directement :

```bash
sudo -u postgres psql -d qrdb
```

```sql
INSERT INTO users (email, password, role)
VALUES ('admin@qrapp.local', '$2b$10$...', 'admin');
```

### 4. Configurer l'environnement

Frontend (`.env` a la racine) :

```
VITE_API_URL=http://localhost:3001
VITE_APP_ENV=development
```

Backend (`server/.env`) :

```
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=qrdb
DB_USER=qradmin
DB_PASSWORD=qrpassword
JWT_SECRET=votre-secret-jwt
UPLOAD_DIR=./uploads
```

### 5. Demarrer l'application

```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
npm run dev
```

L'app est accessible sur `http://localhost:3000`.

## Endpoints API

| Methode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/login` | Connexion (email + mot de passe) |
| GET | `/api/auth/session` | Verifier le token JWT |
| POST | `/api/auth/logout` | Deconnexion |
| GET | `/api/cards` | Lister les cartes |
| POST | `/api/cards` | Creer une carte |
| POST | `/api/cards/:id/scan` | Incrementer le compteur de scans |
| GET | `/api/sessions` | Lister les sessions (avec count presences) |
| POST | `/api/sessions` | Creer une session |
| PUT | `/api/sessions/:id` | Modifier une session |
| DELETE | `/api/sessions/:id` | Supprimer une session |
| GET | `/api/sessions/code/:code` | Trouver une session par code unique |
| POST | `/api/presences` | Marquer une presence |
| GET | `/api/presences/session/:id` | Presences d'une session |
| POST | `/api/storage/:cardId/:filename` | Upload un fichier |
| GET | `/uploads/:cardId/:filename` | Servir un fichier |

## Scripts utiles

### Frontend

```bash
npm run dev          # Serveur de dev
npm run build        # Build production
npm run lint         # Linter + corriger
npm run type-check   # Verification TypeScript
npm run test         # Tests unitaires
```

### Backend

```bash
cd server
npm run dev          # Serveur de dev (avec reload)
npm run start        # Serveur production
```

## Donnees

Le schema PostgreSQL contient 4 tables :

- **users** — Comptes administrateurs (email, password bcrypt, role)
- **cards** — Cartes professionnelles (nom, prenoms, poste, qr_path, scan_count)
- **sessions** — Sessions de formation/reunion (nom, code_unique, date)
- **presences** — Presences marquees par agent (session_id, utilisateur_id, agent_nom)
