import dotenv from 'dotenv'
import db from './db.js'
import { createApp } from './app.js'

dotenv.config()

const PORT = process.env.PORT || 3001

/**
 * État de la connexion PostgreSQL, exposé par /api/health.
 *
 * Le serveur démarre même si la base est injoignable. Sortir en erreur (ce que
 * faisait la version précédente) est dangereux en production : sous un
 * superviseur qui relance automatiquement, un mot de passe erroné produit une
 * boucle de crash, et l'on perd tout moyen de diagnostiquer à distance. En
 * restant debout, le serveur continue de servir le front et /api/health dit
 * précisément ce qui ne va pas — il suffit alors de corriger .env et de
 * relancer.
 */
let dbStatus = 'connexion...'

const { app, hasClientBuild, clientDist } = createApp({ getDbStatus: () => dbStatus })

async function checkDb() {
  try {
    await db.query('SELECT NOW()')
    dbStatus = 'connecte'
    console.log('Connecte a PostgreSQL')
  } catch (err) {
    // err.code est le plus parlant : 28P01 = mot de passe refusé,
    // 3D000 = base inexistante, 28000 = utilisateur inconnu,
    // ECONNREFUSED = rien n'écoute sur host:port, ETIMEDOUT = pare-feu.
    const code = err.code || 'sans-code'
    dbStatus = `erreur[${code}]: ${err.message || '(message vide)'}`
    console.error('='.repeat(70))
    console.error('ECHEC DE CONNEXION A POSTGRESQL')
    console.error(`code=${code} message=${err.message}`)
    console.error(
      `Config lue : host=${process.env.DB_HOST} port=${process.env.DB_PORT} ` +
        `db=${process.env.DB_NAME} user=${process.env.DB_USER}`
    )
    console.error("Le serveur demarre quand meme : le front reste servi et")
    console.error('/api/health indique le detail. Corrigez .env puis relancez.')
    console.error('='.repeat(70))
  }
}

async function start() {
  await checkDb()

  if (hasClientBuild) {
    console.log(`Front servi depuis ${clientDist}`)
  } else {
    console.warn(
      `Front introuvable dans ${clientDist} : seule l'API repondra. ` +
        `Deposez-y le contenu de client/dist.`
    )
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur QRCode Core demarre sur http://localhost:${PORT}`)
  })
}

start()
