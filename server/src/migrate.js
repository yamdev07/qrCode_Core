import pg from 'pg'
import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'

dotenv.config()

const pool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'qrcode_core',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
})

const DATA_DIR = path.resolve(process.cwd(), '../data')

async function migrate() {
  console.log('Creation du schema PostgreSQL...')

  const schema = fs.readFileSync(path.resolve(import.meta.dirname, '../schema.sql'), 'utf-8')
  await pool.query(schema)
  console.log('Schema cree.')

  console.log('Migration des cartes...')
  const cardDirs = fs.readdirSync(DATA_DIR).filter(d => {
    const full = path.join(DATA_DIR, d)
    return fs.statSync(full).isDirectory() && d !== 'sessions'
  })

  for (const cardId of cardDirs) {
    const metaFile = path.join(DATA_DIR, cardId, 'meta.json')
    if (!fs.existsSync(metaFile)) continue

    const meta = JSON.parse(fs.readFileSync(metaFile, 'utf-8'))

    await pool.query(
      'INSERT INTO cards (id, nom, prenoms, poste, created_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
      [cardId, meta.nom || '', meta.prenoms || '', meta.poste || '', meta.createdAt || new Date().toISOString()]
    )

    const files = fs.readdirSync(path.join(DATA_DIR, cardId)).filter(f => f !== 'meta.json')
    for (const file of files) {
      const filePath = path.join(DATA_DIR, cardId, file)
      const ext = path.extname(file).toLowerCase()
      const mime = ext === '.jpg' ? 'image/jpeg' : 'image/png'
      const imageBuffer = fs.readFileSync(filePath)
      const order = parseInt(file.replace(/\D/g, '')) || 1

      await pool.query(
        'INSERT INTO cards_images (card_id, image_data, mime_type, image_order) VALUES ($1, $2, $3, $4)',
        [cardId, imageBuffer, mime, order]
      )
    }

    console.log(`  Carte migree: ${cardId} (${meta.nom} ${meta.prenoms})`)
  }

  console.log('Migration des sessions...')
  const sessionsDir = path.join(DATA_DIR, 'sessions')
  if (fs.existsSync(sessionsDir)) {
    const sessionFiles = fs.readdirSync(sessionsDir).filter(f => f.endsWith('.json'))
    for (const file of sessionFiles) {
      const session = JSON.parse(fs.readFileSync(path.join(sessionsDir, file), 'utf-8'))
      await pool.query(
        `INSERT INTO sessions (id, nom, code_unique, date, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING`,
        [session.id, session.nom, session.code_unique, session.date, session.created_by, session.created_at, session.updated_at]
      )
      console.log(`  Session migree: ${session.nom}`)
    }
  }

  console.log('Migration des presences...')
  const presencesFile = path.join(DATA_DIR, 'presences.json')
  if (fs.existsSync(presencesFile)) {
    const presences = JSON.parse(fs.readFileSync(presencesFile, 'utf-8'))
    for (const p of presences) {
      await pool.query(
        `INSERT INTO presences (id, session_id, utilisateur_id, agent_nom, timestamp, created_at)
         VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
        [p.id, p.session_id, p.utilisateur_id, p.agent_nom, p.timestamp, p.created_at]
      )
    }
    console.log(`  ${presences.length} presences migrees.`)
  }

  console.log('Migration terminee !')
  await pool.end()
}

migrate().catch(err => {
  console.error('Erreur de migration:', err)
  process.exit(1)
})
