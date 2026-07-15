import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// GET /api/sessions — list sessions with presence count
router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, COALESCE(pc.count, 0)::int AS presence_count
      FROM sessions s
      LEFT JOIN (
        SELECT session_id, COUNT(*) AS count
        FROM presences
        GROUP BY session_id
      ) pc ON pc.session_id = s.id
      ORDER BY s.date DESC
    `)
    res.json(result.rows)
  } catch (err) {
    console.error('Error listing sessions:', err)
    res.status(500).json({ message: 'Impossible de récupérer les sessions' })
  }
})

// GET /api/sessions/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sessions WHERE id = $1', [req.params.id])
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Session introuvable' })
      return
    }
    res.json(result.rows[0])
  } catch (err) {
    console.error('Error getting session:', err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// GET /api/sessions/code/:code — find session by unique code
router.get('/code/:code', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sessions WHERE code_unique = $1', [req.params.code])
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Session introuvable' })
      return
    }
    res.json(result.rows[0])
  } catch (err) {
    console.error('Error getting session by code:', err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// POST /api/sessions — create a session
router.post('/', async (req, res) => {
  try {
    const { nom, code_unique, date, created_by } = req.body

    if (!nom) {
      res.status(400).json({ message: 'Le nom est requis' })
      return
    }

    const uniqueCode = code_unique || crypto.randomUUID().split('-')[0].toUpperCase()
    const sessionDate = date || new Date().toISOString()

    const result = await pool.query(
      `INSERT INTO sessions (nom, code_unique, date, created_by)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [nom, uniqueCode, sessionDate, created_by || null]
    )

    res.status(201).json(result.rows[0])
  } catch (err: any) {
    if (err.code === '23505') {
      res.status(409).json({ message: 'Ce code unique existe déjà' })
      return
    }
    console.error('Error creating session:', err)
    res.status(500).json({ message: 'Impossible de créer la session' })
  }
})

// PUT /api/sessions/:id
router.put('/:id', async (req, res) => {
  try {
    const { nom, code_unique, date } = req.body
    const result = await pool.query(
      `UPDATE sessions
       SET nom = COALESCE($2, nom),
           code_unique = COALESCE($3, code_unique),
           date = COALESCE($4, date),
           updated_at = now()
       WHERE id = $1 RETURNING *`,
      [req.params.id, nom, code_unique, date]
    )
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Session introuvable' })
      return
    }
    res.json(result.rows[0])
  } catch (err) {
    console.error('Error updating session:', err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// DELETE /api/sessions/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM sessions WHERE id = $1', [req.params.id])
    res.json({ message: 'Session supprimée' })
  } catch (err) {
    console.error('Error deleting session:', err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

export default router
