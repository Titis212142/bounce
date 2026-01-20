# Dopamine Orbs Studio

Outil de génération et publication automatique de vidéos TikTok verticales (65s) avec jeu 2D satisfaisant.

## Architecture

Monorepo pnpm avec 3 apps principales:

- **apps/studio** - UI Next.js (génération, library, scheduler, analytics)
- **apps/engine** - Moteur de génération vidéo (Canvas 2D + Matter.js + Remotion)
- **apps/api** - Backend Fastify (OAuth TikTok, jobs queue, upload/publish)

## Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Fastify, TypeScript, Prisma, BullMQ
- **Database**: PostgreSQL
- **Queue**: Redis (BullMQ)
- **Video**: Remotion, Canvas 2D, Matter.js
- **Storage**: Local dev / S3-compatible (MinIO) prod

## Setup

### Prérequis

- Node.js >= 18
- pnpm >= 8
- PostgreSQL
- Redis

### Installation

```bash
pnpm install
```

### Configuration

Copier `.env.example` vers `.env` et remplir les variables:

```bash
cp .env.example .env
```

Variables requises:
- `TIKTOK_CLIENT_KEY` - TikTok App Client Key
- `TIKTOK_CLIENT_SECRET` - TikTok App Client Secret
- `TIKTOK_REDIRECT_URI` - OAuth redirect URI
- `BASE_URL` - URL de base de l'app (ex: http://localhost:3000)
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `STORAGE_TYPE` - `local` ou `s3`
- `STORAGE_ENDPOINT` - Endpoint S3/MinIO (si storage s3)
- `STORAGE_ACCESS_KEY` - Access key S3
- `STORAGE_SECRET_KEY` - Secret key S3
- `STORAGE_BUCKET` - Bucket name

### Base de données

```bash
pnpm db:generate
pnpm db:migrate
```

### Développement

```bash
# Démarrer studio + API (dans des terminaux séparés)
pnpm dev:studio  # UI sur http://localhost:3000
pnpm dev:api     # API sur http://localhost:3001
pnpm worker      # Worker BullMQ (nécessaire pour traiter les jobs)
```

### Génération batch (CLI)

```bash
pnpm generate:batch [count]
# Exemple: pnpm generate:batch 30
```

### TikTok API Setup

1. Créer une app sur [TikTok for Developers](https://developers.tiktok.com/)
2. Activer le produit "Content Posting API"
3. Configurer les scopes: `user.info.basic`, `video.upload`, `video.publish`
4. Ajouter le redirect URI dans la config de l'app
5. Copier Client Key et Client Secret dans `.env`

## Structure

```
.
├── apps/
│   ├── studio/          # Next.js UI
│   ├── engine/          # Video generation engine
│   └── api/             # Fastify backend
├── packages/
│   └── shared/          # Shared types/utils
├── prisma/              # Prisma schema
└── outputs/             # Generated videos (gitignored)
```

## Workflow

1. **Génération**: Créer vidéo 65s avec seed aléatoire
2. **Preview**: Visualiser dans l'UI
3. **Planification**: Programmer publication
4. **Publication**: Upload/Publish via TikTok Content Posting API

## TikTok API

L'app utilise uniquement les APIs officielles TikTok:
- OAuth 2.0 pour authentification
- Content Posting API pour upload/publish
- Scopes requis: `video.upload`, `video.publish`

Modes de publication:
- **Upload only**: Upload + utilisateur finalise dans TikTok
- **Direct Post**: Publication automatique (si autorisé)

## License

MIT
