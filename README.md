# QR Code Pro

Application de generation de QR codes pour cartes professionnelles, avec suivi des scans, gestion de sessions et marquage de presence.

## Stack technique

| Couche | Technologie |
|--------|------------|
| Frontend | Vue 3 + Vite + TypeScript |
| UI | PrimeVue + TailwindCSS |
| Etat | Pinia |
| Backend | Express.js (server/) |
| BDD | PostgreSQL 16 (local, via Docker) |
| Auth | JWT (bcrypt + jsonwebtoken) |
| Stockage | Fichiers locaux (server/uploads/) |
| Tests | Vitest |

## Architecture du projet

```
qr-code-core/
├── src/                        # Frontend Vue 3
│   ├── core/                   # Infrastructure partagee
│   │   ├── api/                # Client HTTP (ofetch)
│   │   ├── database/           # Client API local (remplace Supabase)
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
├── docker-compose.yml          # PostgreSQL + pgAdmin
├── .env                        # Variables frontend
└── package.json                # Dependances frontend
```

## Pre-requis

- Node.js >= 18
- Docker + Docker Compose
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

### 2. Demarrer PostgreSQL

```bash
docker compose up -d
```

Cela lance :
- **PostgreSQL** sur `localhost:5432` (user: `qradmin`, pass: `qrpassword`, db: `qrdb`)
- **pgAdmin** sur `http://localhost:5050` (email: `admin@qrapp.local`, pass: `admin`)

Le schema de la base est initialise automatiquement via `server/sql/init.sql`.

### 3. Creer le compte administrateur

Le mot de passe par defaut dans `init.sql` est un hash bcrypt a remplacer. Generer votre hash :

```bash
cd server
node -e "const b=require('bcrypt');b.hash('votre_mdp',10).then(h=>console.log(h))"
```

Collez le hash dans `server/sql/init.sql` dans la ligne INSERT INTO users, puis relancez PostgreSQL :

```bash
docker compose down -v && docker compose up -d
```

Ou creer l'utilisateur directement via pgAdmin ou psql.

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

### Docker

```bash
docker compose up -d           # Demarrer PostgreSQL
docker compose down            # Arreter PostgreSQL
docker compose down -v         # Arreter + supprimer les donnees
docker compose logs postgres   # Voir les logs PostgreSQL
```

## Donnees

Le schema PostgreSQL contient 4 tables :

- **users** — Comptes administrateurs (email, password bcrypt, role)
- **cards** — Cartes professionnelles (nom, prenoms, poste, qr_path, scan_count)
- **sessions** — Sessions de formation/reunion (nom, code_unique, date)
- **presences** — Presences marquees par agent (session_id, utilisateur_id, agent_nom)

La fonction `increment_card_scan(card_id)` est geree par le backend directement.
