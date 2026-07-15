import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// GET /api/cards — list all cards
router.get('/', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cards ORDER BY created_at DESC')
    res.json(result.rows)
  } catch (err) {
    console.error('Error listing cards:', err)
    res.status(500).json({ message: 'Impossible de charger les cartes' })
  }
})

// GET /api/cards/:id — get single card
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cards WHERE id = $1', [req.params.id])
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Carte introuvable' })
      return
    }
    res.json(result.rows[0])
  } catch (err) {
    console.error('Error getting card:', err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// POST /api/cards — insert a card record
router.post('/', async (req, res) => {
  try {
    const { id, nom, prenoms, poste, qr_path, view_url } = req.body

    if (!id || !nom) {
      res.status(400).json({ message: 'id et nom requis' })
      return
    }

    await pool.query(
      `INSERT INTO cards (id, nom, prenoms, poste, qr_path, view_url)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, nom, prenoms || '', poste || '', qr_path || null, view_url || null]
    )

    res.status(201).json({ message: 'Carte enregistrée' })
  } catch (err) {
    console.error('Error inserting card:', err)
    res.status(500).json({ message: "Impossible d'enregistrer la carte" })
  }
})

// POST /api/cards/:id/scan — increment scan count
router.post('/:id/scan', async (req, res) => {
  try {
    await pool.query('SELECT increment_card_scan($1)', [req.params.id])
    res.json({ message: 'Scan comptabilisé' })
  } catch (err) {
    console.error('Error incrementing scan:', err)
    // Non-blocking — log only
    res.json({ message: 'Erreur (non bloquant)' })
  }
})

// PUT /api/cards/:id — update a card
router.put('/:id', async (req, res) => {
  try {
    const { nom, prenoms, poste, qr_path, view_url } = req.body
    const result = await pool.query(
      `UPDATE cards SET nom = COALESCE($2, nom), prenoms = COALESCE($3, prenoms),
       poste = COALESCE($4, poste), qr_path = COALESCE($5, qr_path),
       view_url = COALESCE($6, view_url) WHERE id = $1 RETURNING *`,
      [req.params.id, nom, prenoms, poste, qr_path, view_url]
    )
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Carte introuvable' })
      return
    }
    res.json(result.rows[0])
  } catch (err) {
    console.error('Error updating card:', err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// DELETE /api/cards/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM cards WHERE id = $1', [req.params.id])
    res.json({ message: 'Carte supprimée' })
  } catch (err) {
    console.error('Error deleting card:', err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

export default router
