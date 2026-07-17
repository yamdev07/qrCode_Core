import { Router } from 'express'
import crypto from 'node:crypto'
import pool from '../db.js'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*,
        (SELECT COUNT(*)::int FROM presences p WHERE p.session_id = s.id) AS presence_count
      FROM sessions s
      ORDER BY s.date DESC
    `)
    res.json(result.rows)
  } catch (err) {
    console.error('Erreur get sessions:', err)
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { nom, code_unique, date } = req.body
    if (!nom) return res.status(400).json({ error: 'Le nom est requis' })

    const id = crypto.randomBytes(16).toString('hex')
    const now = new Date().toISOString()
    const code = code_unique || crypto.randomBytes(4).toString('hex').toUpperCase()

    const result = await pool.query(
      `INSERT INTO sessions (id, nom, code_unique, date, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, nom, code, date || now, now, now]
    )

    res.json(result.rows[0])
  } catch (err) {
    console.error('Erreur create session:', err)
    res.status(500).json({ error: err.message })
  }
})

router.get('/lookup', async (req, res) => {
  try {
    const { code } = req.query
    if (!code) return res.status(400).json({ error: 'Code requis' })

    const result = await pool.query('SELECT * FROM sessions WHERE code_unique = $1', [code])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session introuvable' })
    }
    res.json(result.rows[0])
  } catch (err) {
    console.error('Erreur lookup session:', err)
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('SELECT * FROM sessions WHERE id = $1', [id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session introuvable' })
    }
    res.json(result.rows[0])
  } catch (err) {
    console.error('Erreur get session:', err)
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const existing = await pool.query('SELECT * FROM sessions WHERE id = $1', [id])
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Session introuvable' })
    }

    const { nom, code_unique, date } = req.body
    const now = new Date().toISOString()

    const result = await pool.query(
      `UPDATE sessions SET nom = $1, code_unique = $2, date = $3, updated_at = $4
       WHERE id = $5 RETURNING *`,
      [
        nom || existing.rows[0].nom,
        code_unique || existing.rows[0].code_unique,
        date || existing.rows[0].date,
        now,
        id
      ]
    )

    res.json(result.rows[0])
  } catch (err) {
    console.error('Erreur update session:', err)
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('DELETE FROM sessions WHERE id = $1 RETURNING id', [id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session introuvable' })
    }
    res.json({ success: true })
  } catch (err) {
    console.error('Erreur delete session:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router
