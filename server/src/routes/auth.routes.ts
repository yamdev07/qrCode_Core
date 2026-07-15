import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pool from '../db.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret'

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ message: 'Email et mot de passe requis' })
      return
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.trim()])

    if (result.rows.length === 0) {
      res.status(401).json({ message: 'Email ou mot de passe incorrect.' })
      return
    }

    const user = result.rows[0]
    const valid = await bcrypt.compare(password, user.password)

    if (!valid) {
      res.status(401).json({ message: 'Email ou mot de passe incorrect.' })
      return
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role }
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// GET /api/auth/session — verify token and return user
router.get('/session', async (req, res) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.json({ session: null })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string }
    res.json({
      session: {
        user: { id: decoded.id, email: decoded.email, role: decoded.role },
        access_token: token
      }
    })
  } catch {
    res.json({ session: null })
  }
})

// POST /api/auth/logout
router.post('/logout', (_req, res) => {
  res.json({ message: 'Déconnecté' })
})

export default router
