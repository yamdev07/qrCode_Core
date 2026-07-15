import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = path.resolve(__dirname, '../../uploads')

// Ensure uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    // Create subdirectory based on first path segment
    const cardId = _req.params.cardId || 'misc'
    const dir = path.join(UPLOAD_DIR, cardId)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
  },
  filename: (_req, file, cb) => {
    // Preserve original filename
    cb(null, file.originalname)
  }
})

const upload = multer({ storage })

const router = Router()

// POST /api/storage/:cardId/:filename — upload a file
router.post('/:cardId/:filename', upload.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: 'Aucun fichier fourni' })
    return
  }

  const { cardId, filename } = req.params
  const relativePath = `${cardId}/${filename}`

  res.json({
    path: relativePath,
    url: `/uploads/${relativePath}`
  })
})

// POST /api/storage/:cardId — upload with multer (multiple files)
router.post('/:cardId', upload.array('files', 20), (req, res) => {
  const files = req.files as Express.Multer.File[]
  if (!files || files.length === 0) {
    res.status(400).json({ message: 'Aucun fichier fourni' })
    return
  }

  const cardId = req.params.cardId
  const paths = files.map(f => `${cardId}/${f.originalname}`)

  res.json({
    paths,
    urls: paths.map(p => `/uploads/${p}`)
  })
})

// GET /api/storage/:cardId/:filename — serve a file
router.get('/:cardId/:filename', (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.cardId, req.params.filename)
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ message: 'Fichier introuvable' })
    return
  }
  res.sendFile(filePath)
})

// GET /api/storage/:cardId — list files for a card
router.get('/:cardId', (req, res) => {
  const dir = path.join(UPLOAD_DIR, req.params.cardId)
  if (!fs.existsSync(dir)) {
    res.json([])
    return
  }

  const files = fs.readdirSync(dir).map(name => ({
    name,
    path: `${req.params.cardId}/${name}`,
    url: `/uploads/${req.params.cardId}/${name}`
  }))

  res.json(files)
})

// DELETE /api/storage/:cardId/:filename
router.delete('/:cardId/:filename', (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.cardId, req.params.filename)
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }
  res.json({ message: 'Fichier supprimé' })
})

export default router
