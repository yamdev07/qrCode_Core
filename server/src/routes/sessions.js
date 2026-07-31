import { Router } from 'express'
import crypto from 'node:crypto'
import db from '../db.js'
import { requireAuth } from '../auth.js'

const router = Router()

router.get('/', requireAuth, async (_req, res) => {
  try {
    const result = await db.query(`
      SELECT s.*,
        (SELECT COUNT(*) FROM presences p WHERE p.session_id = s.id) AS presence_count
      FROM sessions s
      ORDER BY s.date DESC
    `)
    res.json(result.rows)
  } catch (err) {
    console.error('Erreur get sessions:', err)
    res.status(500).json({ error: err.message })
  }
})

router.post('/', requireAuth, async (req, res) => {
  try {
    const { nom, code_unique, date } = req.body
    if (!nom) return res.status(400).json({ error: 'Le nom est requis' })

    const id = crypto.randomBytes(16).toString('hex')
    const now = new Date().toISOString()
    const code = code_unique || crypto.randomBytes(4).toString('hex').toUpperCase()

    // date est un champ texte fourni par le client ; created_at / updated_at
    // sont remplis par le DEFAULT CURRENT_TIMESTAMP(6) de la table.
    await db.query(
      'INSERT INTO sessions (id, nom, code_unique, date) VALUES (?, ?, ?, ?)',
      [id, nom, code, date || now]
    )

    const created = await db.query('SELECT * FROM sessions WHERE id = ?', [id])
    res.json(created.rows[0])
  } catch (err) {
    console.error('Erreur create session:', err)
    res.status(500).json({ error: err.message })
  }
})

router.get('/lookup', async (req, res) => {
  try {
    const { code } = req.query
    if (!code) return res.status(400).json({ error: 'Code requis' })

    const result = await db.query('SELECT * FROM sessions WHERE code_unique = ?', [code])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session introuvable' })
    }
    res.json(result.rows[0])
  } catch (err) {
    console.error('Erreur lookup session:', err)
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params
    const result = await db.query('SELECT * FROM sessions WHERE id = ?', [id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session introuvable' })
    }
    res.json(result.rows[0])
  } catch (err) {
    console.error('Erreur get session:', err)
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params
    const existing = await db.query('SELECT * FROM sessions WHERE id = ?', [id])
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Session introuvable' })
    }

    const { nom, code_unique, date } = req.body

    await db.query(
      `UPDATE sessions SET nom = ?, code_unique = ?, date = ?, updated_at = CURRENT_TIMESTAMP(6)
       WHERE id = ?`,
      [
        nom || existing.rows[0].nom,
        code_unique || existing.rows[0].code_unique,
        date || existing.rows[0].date,
        id
      ]
    )

    const updated = await db.query('SELECT * FROM sessions WHERE id = ?', [id])
    res.json(updated.rows[0])
  } catch (err) {
    console.error('Erreur update session:', err)
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params
    const result = await db.query('DELETE FROM sessions WHERE id = ?', [id])
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Session introuvable' })
    }
    res.json({ success: true })
  } catch (err) {
    console.error('Erreur delete session:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router
