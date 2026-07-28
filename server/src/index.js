import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import pool from './db.js'
import cardsRouter from './routes/cards.js'
import sessionsRouter from './routes/sessions.js'
import presencesRouter from './routes/presences.js'
import qrcodesRouter from './routes/qrcodes.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '50mb' }))

app.use('/uploads', express.static(join(__dirname, '..', 'uploads')))

app.use('/api', cardsRouter)
app.use('/api/sessions', sessionsRouter)
app.use('/api/presences', presencesRouter)
app.use('/api/qrcodes', qrcodesRouter)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

async function start() {
  try {
    await pool.query('SELECT NOW()')
    console.log('Connecte a PostgreSQL')

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Serveur QRCode Core demarre sur http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('Echec de connexion a PostgreSQL:', err.message)
    process.exit(1)
  }
}

start()
