import { Router } from 'express'
import crypto from 'node:crypto'
import pool from '../db.js'

const router = Router()

router.post('/', async (req, res) => {
  try {
    const { session_id, utilisateur_id, agent_nom, timestamp } = req.body
    if (!session_id || !utilisateur_id || !agent_nom) {
      return res.status(400).json({ error: 'session_id, utilisateur_id et agent_nom requis' })
    }

    const id = crypto.randomBytes(16).toString('hex')
    const now = new Date().toISOString()

    const result = await pool.query(
      `INSERT INTO presences (id, session_id, utilisateur_id, agent_nom, timestamp, created_at)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, session_id, utilisateur_id, agent_nom, timestamp || now, now]
    )

    res.json(result.rows[0])
  } catch (err) {
    console.error('Erreur mark presence:', err)
    res.status(500).json({ error: err.message })
  }
})

router.get('/', async (req, res) => {
  try {
    const { session_id } = req.query
    if (!session_id) return res.status(400).json({ error: 'session_id requis' })

    const result = await pool.query(
      'SELECT * FROM presences WHERE session_id = $1 ORDER BY created_at DESC',
      [session_id]
    )
    res.json(result.rows)
  } catch (err) {
    console.error('Erreur get presences:', err)
    res.status(500).json({ error: err.message })
  }
})

router.get('/verify', async (req, res) => {
  try {
    const { session_id, user_id } = req.query
    if (!session_id || !user_id) {
      return res.status(400).json({ error: 'session_id et user_id requis' })
    }

    const result = await pool.query(
      'SELECT EXISTS(SELECT 1 FROM presences WHERE session_id = $1 AND utilisateur_id = $2) AS exists',
      [session_id, user_id]
    )
    res.json({ data: result.rows[0].exists })
  } catch (err) {
    console.error('Erreur verify presence:', err)
    res.status(500).json({ error: err.message })
  }
})

router.get('/verify-agent', async (req, res) => {
  try {
    const { session_id, agent_nom } = req.query
    if (!session_id || !agent_nom) {
      return res.status(400).json({ error: 'session_id et agent_nom requis' })
    }

    const result = await pool.query(
      'SELECT EXISTS(SELECT 1 FROM presences WHERE session_id = $1 AND agent_nom = $2) AS exists',
      [session_id, agent_nom]
    )
    res.json({ data: result.rows[0].exists })
  } catch (err) {
    console.error('Erreur verify agent:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router
