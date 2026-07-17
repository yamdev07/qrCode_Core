import pg from 'pg'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const pool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'qrcode_core',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
})

const UPLOADS_CARDS = path.resolve(__dirname, '..', 'uploads', 'cards')
const UPLOADS_QRCODES = path.resolve(__dirname, '..', 'uploads', 'qrcodes')

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

async function migrateCards() {
  console.log('Migration des images de cartes...')

  const result = await pool.query('SELECT id, card_id, image_data, mime_type, image_order FROM cards_images')
  console.log(`  ${result.rows.length} images a migrer`)

  for (const row of result.rows) {
    const ext = row.mime_type?.includes('png') ? 'png' : 'jpg'
    const filename = `${String(row.image_order).padStart(2, '0')}.${ext}`
    const cardDir = path.join(UPLOADS_CARDS, row.card_id)
    ensureDir(cardDir)

    const filePath = path.join(cardDir, filename)
    fs.writeFileSync(filePath, row.image_data)

    const imagePath = `cards/${row.card_id}/${filename}`
    await pool.query('UPDATE cards_images SET image_path = $1 WHERE id = $2', [imagePath, row.id])
    console.log(`  Image migree: ${imagePath}`)
  }
}

async function migrateQrCodes() {
  console.log('Migration des images QR codes...')

  const result = await pool.query('SELECT id, image_data, mime_type FROM qr_codes')
  console.log(`  ${result.rows.length} QR codes a migrer`)

  ensureDir(UPLOADS_QRCODES)

  for (const row of result.rows) {
    const ext = row.mime_type?.includes('png') ? 'png' : 'jpg'
    const filename = `${row.id}.${ext}`
    const filePath = path.join(UPLOADS_QRCODES, filename)

    fs.writeFileSync(filePath, row.image_data)

    const imagePath = `qrcodes/${filename}`
    await pool.query('UPDATE qr_codes SET image_path = $1 WHERE id = $2', [imagePath, row.id])
    console.log(`  QR migre: ${imagePath}`)
  }
}

async function updateSchema() {
  console.log('Mise a jour du schema...')

  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cards_images' AND column_name = 'image_path') THEN
        ALTER TABLE cards_images ADD COLUMN image_path TEXT NOT NULL DEFAULT '';
      END IF;
    END $$;
  `)

  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'qr_codes' AND column_name = 'image_path') THEN
        ALTER TABLE qr_codes ADD COLUMN image_path TEXT NOT NULL DEFAULT '';
      END IF;
    END $$;
  `)

  console.log('Schema mis a jour.')
}

async function dropOldColumns() {
  console.log('Suppression des anciennes colonnes image_data...')

  await pool.query(`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cards_images' AND column_name = 'image_data') THEN
        ALTER TABLE cards_images DROP COLUMN image_data;
      END IF;
    END $$;
  `)

  await pool.query(`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'qr_codes' AND column_name = 'image_data') THEN
        ALTER TABLE qr_codes DROP COLUMN image_data;
      END IF;
    END $$;
  `)

  console.log('Anciennes colonnes supprimees.')
}

async function migrate() {
  try {
    await pool.query('SELECT NOW()')
    console.log('Connecte a PostgreSQL')

    await updateSchema()
    await migrateCards()
    await migrateQrCodes()
    await dropOldColumns()

    console.log('Migration terminee !')
    await pool.end()
  } catch (err) {
    console.error('Erreur de migration:', err)
    process.exit(1)
  }
}

migrate()
