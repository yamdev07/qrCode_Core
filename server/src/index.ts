import dotenv from 'dotenv'
dotenv.config({ path: '../.env' })

import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

import authRoutes from './routes/auth.routes.js'
import cardsRoutes from './routes/cards.routes.js'
import sessionsRoutes from './routes/sessions.routes.js'
import presencesRoutes from './routes/presences.routes.js'
import storageRoutes from './routes/storage.routes.js'
import { authMiddleware } from './middleware/auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = parseInt(process.env.PORT || '3001')

// Middleware
app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'] }))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Static uploads
const UPLOAD_DIR = path.resolve(__dirname, '../uploads')
app.use('/uploads', express.static(UPLOAD_DIR))

// Public routes
app.use('/api/auth', authRoutes)

// Protected routes (require JWT)
app.use('/api/cards', authMiddleware, cardsRoutes)
app.use('/api/sessions', authMiddleware, sessionsRoutes)
app.use('/api/presences', authMiddleware, presencesRoutes)
app.use('/api/storage', authMiddleware, storageRoutes)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`)
  console.log(`📦 Uploads served from ${UPLOAD_DIR}`)
})
