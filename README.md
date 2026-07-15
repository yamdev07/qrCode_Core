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
├── client/                     # Frontend Vue 3
│   ├── src/
│   │   ├── core/               # Infrastructure partagee
│   │   │   ├── api/            # Client HTTP (ofetch)
│   │   │   ├── database/       # Client API local
│   │   │   ├── errors/         # Classes d'erreur custom
│   │   │   ├── logger/         # Utilitaire de log (consola)
│   │   │   ├── composables/    # Composables partages
│   │   │   ├── types/          # Types globaux
│   │   │   └── utils/          # Validators (Zod), formatters
│   │   ├── modules/            # Modules metier
│   │   │   ├── admin/          # Panel admin (auth, gestion cartes)
│   │   │   ├── generator/      # Generation QR + upload cartes
│   │   │   ├── scanner/        # Scan QR + marquage presence
│   │   │   └── sessions/       # Gestion des sessions
│   │   ├── router/             # Vue Router + guards
│   │   ├── stores/             # Pinia stores
│   │   └── views/              # Pages
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
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
│   ├── uploads/                # Fichiers uploades
│   ├── sql/
│   │   └── init.sql            # Schema de la base de donnees
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── package.json                # Scripts racine (concurrently)
├── docker-compose.yml          # (optionnel) PostgreSQL en container
└── README.md
```

## Pre-requis

- Node.js >= 18
- PostgreSQL (installe localement)
- npm

## Installation

### 1. Cloner et installer les dependances

```bash
git clone <repo-url>
cd Qr_Code_Core

# Installer tout (client + server + concurrently)
npm run install:all
```

### 2. Configurer PostgreSQL

```bash
sudo -u postgres psql -c "CREATE USER qradmin WITH PASSWORD 'qrpassword' CREATEDB;"
sudo -u postgres psql -c "CREATE DATABASE qrdb OWNER qradmin;"
sudo -u postgres psql -d qrdb -f server/sql/init.sql
```

### 3. Creer le compte administrateur

Generer un hash bcrypt :

```bash
cd server
node -e "const b=require('bcrypt');b.hash('votre_mdp',10).then(h=>console.log(h))"
```

Inserer l'utilisateur :

```bash
sudo -u postgres psql -d qrdb -c "INSERT INTO users (email, password, role) VALUES ('admin@qrapp.local', 'VOTRE_HASH_ICI', 'admin');"
```

### 4. Demarrer l'application

```bash
# Tout en un (client + server)
npm run dev

# Ou separement :
npm run dev:server    # Backend sur :3001
npm run dev:client    # Frontend sur :3000
```

## Endpoints API

| Methode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/login` | Connexion |
| GET | `/api/auth/session` | Verifier le token JWT |
| POST | `/api/auth/logout` | Deconnexion |
| GET | `/api/cards` | Lister les cartes |
| POST | `/api/cards` | Creer une carte |
| POST | `/api/cards/:id/scan` | Incrementer le compteur de scans |
| GET | `/api/sessions` | Lister les sessions |
| POST | `/api/sessions` | Creer une session |
| PUT | `/api/sessions/:id` | Modifier une session |
| DELETE | `/api/sessions/:id` | Supprimer une session |
| GET | `/api/sessions/code/:code` | Trouver par code unique |
| POST | `/api/presences` | Marquer une presence |
| GET | `/api/presences/session/:id` | Presences d'une session |
| POST | `/api/storage/:cardId/:filename` | Upload un fichier |
| GET | `/uploads/:cardId/:filename` | Servir un fichier |

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Demarrer client + server |
| `npm run dev:client` | Frontend seul |
| `npm run dev:server` | Backend seul |
| `npm run build` | Build production |
| `npm run lint` | Linter + corriger |
| `npm run type-check` | Verification TypeScript |
| `npm run test` | Tests unitaires |
