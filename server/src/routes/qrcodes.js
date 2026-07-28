import { Router } from 'express'
import crypto from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import pool from '../db.js'

const router = Router()
const UPLOADS_DIR = resolve(import.meta.dirname, '..', '..', 'uploads', 'qrcodes')

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true })
}

router.post('/', async (req, res) => {
  try {
    const { url, imageDataUrl, format, size, margin, foreground, background, errorCorrectionLevel } = req.body

    if (!url || !imageDataUrl) {
      return res.status(400).json({ error: 'url et imageData requis' })
    }

    const id = crypto.randomBytes(16).toString('hex')
    const typeMatch = imageDataUrl.match(/^data:image\/(\w+);base64,/)
    const ext = typeMatch ? typeMatch[1].toLowerCase() : 'png'
    const mime = `image/${ext}`
    const base64 = imageDataUrl.replace(/^data:image\/\w+;base64,/, '')
    const imageBuffer = Buffer.from(base64, 'base64')

    ensureDir(UPLOADS_DIR)
    const filename = `${id}.${ext}`
    writeFileSync(join(UPLOADS_DIR, filename), imageBuffer)

    const imagePath = `qrcodes/${filename}`

    const result = await pool.query(
      `INSERT INTO qr_codes (id, url, image_path, mime_type, format, size, margin, foreground, background, error_correction_level)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, url, image_path, mime_type, format, size, margin, foreground, background, error_correction_level, created_at`,
      [id, url, imagePath, mime, format || 'png', size || 300, margin || 2, foreground || '#000000', background || '#FFFFFF', errorCorrectionLevel || 'M']
    )

    res.json(result.rows[0])
  } catch (err) {
    console.error('Erreur save qrcode:', err)
    res.status(500).json({ error: err.message })
  }
})

router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, url, image_path, mime_type, format, size, margin, foreground, background, error_correction_level, created_at FROM qr_codes ORDER BY created_at DESC'
    )
    res.json(result.rows)
  } catch (err) {
    console.error('Erreur list qrcodes:', err)
    res.status(500).json({ error: err.message })
  }
})

router.get('/by-url', async (req, res) => {
  try {
    const { url } = req.query
    if (!url) return res.status(400).json({ error: 'url requise' })
    const result = await pool.query(
      'SELECT id, url, image_path, mime_type, format, size, created_at FROM qr_codes WHERE url = $1 ORDER BY created_at DESC LIMIT 1',
      [url]
    )
    if (result.rows.length === 0) return res.json(null)
    res.json(result.rows[0])
  } catch (err) {
    console.error('Erreur find qrcode by url:', err)
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id/image', async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('SELECT image_path, mime_type FROM qr_codes WHERE id = $1', [id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'QR code introuvable' })
    }
    const row = result.rows[0]
    res.redirect(`/uploads/${row.image_path}`)
  } catch (err) {
    console.error('Erreur get qrcode image:', err)
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query(
      'SELECT id, url, image_path, mime_type, format, size, margin, foreground, background, error_correction_level, created_at FROM qr_codes WHERE id = $1',
      [id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'QR code introuvable' })
    }
    res.json(result.rows[0])
  } catch (err) {
    console.error('Erreur get qrcode:', err)
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('DELETE FROM qr_codes WHERE id = $1 RETURNING id', [id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'QR code introuvable' })
    }
    res.json({ success: true })
  } catch (err) {
    console.error('Erreur delete qrcode:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router
