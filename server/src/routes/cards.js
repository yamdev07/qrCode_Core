import { Router } from 'express'
import crypto from 'node:crypto'
import { mkdirSync, writeFileSync, existsSync, readdirSync, unlinkSync, rmdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import pool from '../db.js'

const router = Router()
const UPLOADS_DIR = resolve(import.meta.dirname, '..', '..', 'uploads', 'cards')

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true })
}

router.post('/upload', async (req, res) => {
  try {
    const { nom, prenoms, poste, images } = req.body
    if (!nom || !images?.length) {
      return res.status(400).json({ error: 'Données manquantes' })
    }

    const cardId = crypto.randomBytes(16).toString('hex')
    const cardDir = join(UPLOADS_DIR, cardId)
    ensureDir(cardDir)

    await pool.query(
      'INSERT INTO cards (id, nom, prenoms, poste) VALUES ($1, $2, $3, $4)',
      [cardId, nom, prenoms || '', poste || '']
    )

    for (let i = 0; i < images.length; i++) {
      const dataUrl = images[i]
      const typeMatch = dataUrl.match(/^data:image\/(\w+);base64,/)
      let ext = typeMatch ? typeMatch[1].toLowerCase() : 'png'
      if (ext === 'jpeg') ext = 'jpg'
      const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '')
      const imageBuffer = Buffer.from(base64, 'base64')

      const filename = `${String(i + 1).padStart(2, '0')}.${ext}`
      writeFileSync(join(cardDir, filename), imageBuffer)

      const imagePath = `cards/${cardId}/${filename}`
      await pool.query(
        'INSERT INTO cards_images (card_id, image_path, mime_type, image_order) VALUES ($1, $2, $3, $4)',
        [cardId, imagePath, `image/${ext}`, i + 1]
      )
    }

    res.json({ id: cardId, viewUrl: `/carte/${cardId}` })
  } catch (err) {
    console.error('Erreur upload:', err)
    res.status(500).json({ error: err.message })
  }
})

router.get('/card', async (req, res) => {
  try {
    const { id } = req.query
    if (!id || !/^[a-f0-9]{32}$/.test(id)) {
      return res.status(400).json({ error: 'ID invalide' })
    }

    const cardResult = await pool.query('SELECT * FROM cards WHERE id = $1', [id])
    if (cardResult.rows.length === 0) {
      return res.status(404).json({ error: 'Carte introuvable' })
    }

    const card = cardResult.rows[0]
    const imagesResult = await pool.query(
      'SELECT image_path, mime_type FROM cards_images WHERE card_id = $1 ORDER BY image_order',
      [id]
    )

    const imageUrls = imagesResult.rows.map(img => `/uploads/${img.image_path}`)

    res.json({
      meta: { nom: card.nom, prenoms: card.prenoms, poste: card.poste },
      imageUrls
    })
  } catch (err) {
    console.error('Erreur get card:', err)
    res.status(500).json({ error: err.message })
  }
})

router.get('/cards-list', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT id AS "cardId", nom, prenoms, poste, created_at AS "createdAt" FROM cards ORDER BY created_at DESC'
    )
    res.json(result.rows)
  } catch (err) {
    console.error('Erreur list cards:', err)
    res.status(500).json({ error: err.message })
  }
})

router.delete('/card/delete/:cardId', async (req, res) => {
  try {
    const { cardId } = req.params
    const result = await pool.query('DELETE FROM cards WHERE id = $1 RETURNING id', [cardId])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Carte introuvable' })
    }

    const cardDir = join(UPLOADS_DIR, cardId)
    if (existsSync(cardDir)) {
      for (const file of readdirSync(cardDir)) {
        unlinkSync(join(cardDir, file))
      }
      rmdirSync(cardDir)
    }

    res.json({ success: true })
  } catch (err) {
    console.error('Erreur delete card:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router
