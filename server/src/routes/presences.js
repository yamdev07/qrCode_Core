import { Router } from 'express'
import crypto from 'node:crypto'
import db from '../db.js'
import { requireAuth } from '../auth.js'

const router = Router()

/** ISO (2026-07-29T10:00:00.000Z) -> DATETIME MySQL (2026-07-29 10:00:00.000). */
function toMysqlDateTime(iso) {
  return iso.replace('T', ' ').replace('Z', '')
}

router.post('/', async (req, res) => {
  try {
    const { session_id, utilisateur_id, agent_nom, timestamp } = req.body
    if (!session_id || !utilisateur_id || !agent_nom) {
      return res.status(400).json({ error: 'session_id, utilisateur_id et agent_nom requis' })
    }

    const id = crypto.randomBytes(16).toString('hex')
    const ts = toMysqlDateTime(timestamp || new Date().toISOString())

    // created_at est rempli par le DEFAULT CURRENT_TIMESTAMP(6) de la table.
    await db.query(
      `INSERT INTO presences (id, session_id, utilisateur_id, agent_nom, timestamp)
       VALUES (?, ?, ?, ?, ?)`,
      [id, session_id, utilisateur_id, agent_nom, ts]
    )

    const created = await db.query('SELECT * FROM presences WHERE id = ?', [id])
    res.json(created.rows[0])
  } catch (err) {
    console.error('Erreur mark presence:', err)
    res.status(500).json({ error: err.message })
  }
})

router.get('/', requireAuth, async (req, res) => {
  try {
    const { session_id } = req.query
    if (!session_id) return res.status(400).json({ error: 'session_id requis' })

    const result = await db.query(
      'SELECT * FROM presences WHERE session_id = ? ORDER BY created_at DESC',
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

    const result = await db.query(
      'SELECT COUNT(*) AS n FROM presences WHERE session_id = ? AND utilisateur_id = ?',
      [session_id, user_id]
    )
    res.json({ data: result.rows[0].n > 0 })
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

    const result = await db.query(
      'SELECT COUNT(*) AS n FROM presences WHERE session_id = ? AND agent_nom = ?',
      [session_id, agent_nom]
    )
    res.json({ data: result.rows[0].n > 0 })
  } catch (err) {
    console.error('Erreur verify agent:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router
