import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// POST /api/presences — mark presence
router.post('/', async (req, res) => {
  try {
    const { session_id, utilisateur_id, agent_nom, timestamp } = req.body

    if (!session_id || !utilisateur_id || !agent_nom) {
      res.status(400).json({ message: 'session_id, utilisateur_id et agent_nom requis' })
      return
    }

    const result = await pool.query(
      `INSERT INTO presences (session_id, utilisateur_id, agent_nom, timestamp)
       VALUES ($1, $2, $3, $4)
       RETURNING id, session_id, utilisateur_id, agent_nom, created_at`,
      [session_id, utilisateur_id, agent_nom, timestamp || new Date().toISOString()]
    )

    res.status(201).json(result.rows[0])
  } catch (err: any) {
    if (err.code === '23505') {
      res.status(409).json({ message: 'Présence déjà enregistrée pour cet agent dans cette session' })
      return
    }
    console.error('Error marking presence:', err)
    res.status(500).json({ message: 'Impossible de marquer la présence' })
  }
})

// GET /api/presences/session/:sessionId — get presences for a session
router.get('/session/:sessionId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, session_id, utilisateur_id, agent_nom, created_at
       FROM presences
       WHERE session_id = $1
       ORDER BY created_at DESC`,
      [req.params.sessionId]
    )
    res.json(result.rows)
  } catch (err) {
    console.error('Error getting presences:', err)
    res.status(500).json({ message: 'Impossible de récupérer les présences' })
  }
})

// GET /api/presences/verify/:sessionId/:userId
router.get('/verify/:sessionId/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id FROM presences WHERE session_id = $1 AND utilisateur_id = $2 LIMIT 1',
      [req.params.sessionId, req.params.userId]
    )
    res.json({ exists: result.rows.length > 0 })
  } catch (err) {
    console.error('Error verifying presence:', err)
    res.json({ exists: false })
  }
})

// GET /api/presences/verify-agent/:sessionId/:agentNom
router.get('/verify-agent/:sessionId/:agentNom', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id FROM presences WHERE session_id = $1 AND agent_nom = $2 LIMIT 1',
      [req.params.sessionId, req.params.agentNom]
    )
    res.json({ exists: result.rows.length > 0 })
  } catch (err) {
    console.error('Error verifying agent presence:', err)
    res.json({ exists: false })
  }
})

export default router
