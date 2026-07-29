import express from 'express'
import cors from 'cors'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import cardsRouter from './routes/cards.js'
import sessionsRouter from './routes/sessions.js'
import presencesRouter from './routes/presences.js'
import qrcodesRouter from './routes/qrcodes.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * Répertoire du front compilé.
 *
 * En production, Apache proxifie l'intégralité du domaine vers ce process : il
 * ne sert aucun fichier lui-même. C'est donc à Express de servir le build du
 * client, sinon "/" et "/carte/<id>" tombent en 404.
 *
 * Un répertoire dédié, jamais la racine du site : celle-ci contient aussi les
 * sources du serveur, donc son .env. Les exposer via express.static rendrait
 * les identifiants de la base téléchargeables publiquement.
 */
export function resolveClientDist() {
  return resolve(process.env.CLIENT_DIST || join(__dirname, '..', 'public'))
}

export function createApp({ getDbStatus = () => 'inconnu' } = {}) {
  const app = express()
  const clientDist = resolveClientDist()
  const hasClientBuild = existsSync(join(clientDist, 'index.html'))

  app.use(cors())
  app.use(express.json({ limit: '50mb' }))

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')))

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      clientBuild: hasClientBuild ? 'servi' : 'absent',
      db: getDbStatus(),
      timestamp: new Date().toISOString()
    })
  })

  app.use('/api', cardsRouter)
  app.use('/api/sessions', sessionsRouter)
  app.use('/api/presences', presencesRouter)
  app.use('/api/qrcodes', qrcodesRouter)

  // Une requête /api inconnue doit rester du JSON : sans ce garde-fou elle
  // tomberait dans le fallback SPA et renverrait du HTML à un appel fetch.
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Endpoint inconnu' })
  })

  if (hasClientBuild) {
    app.use(
      express.static(clientDist, {
        // Les assets Vite sont hashés donc immuables ; index.html et le service
        // worker doivent rester frais, sinon une mise à jour ne parvient jamais
        // aux navigateurs ayant déjà visité le site.
        setHeaders(res, filePath) {
          const name = filePath.split(/[\\/]/).pop()
          const volatile =
            name === 'index.html' || name === 'sw.js' || name.startsWith('workbox-')
          res.setHeader(
            'Cache-Control',
            volatile
              ? 'no-cache, no-store, must-revalidate'
              : 'public, max-age=31536000, immutable'
          )
        }
      })
    )

    // Les routes de vue-router (/carte/<id>, /scan, /admin...) n'existent pas
    // sur le disque : c'est l'app qui les résout côté navigateur.
    app.get('*', (_req, res) => {
      res.sendFile(join(clientDist, 'index.html'))
    })
  }

  return { app, hasClientBuild, clientDist }
}
