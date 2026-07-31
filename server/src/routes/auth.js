import { Router } from 'express'
import { checkCredentials, issueToken, requireAuth } from '../auth.js'

const router = Router()

/** Connexion admin : renvoie un jeton signé si les identifiants sont bons. */
router.post('/login', (req, res) => {
  const { username, password } = req.body || {}
  if (!checkCredentials(username, password)) {
    return res.status(401).json({ error: 'Identifiant ou mot de passe incorrect' })
  }
  res.json({ token: issueToken(), user: username })
})

/** Vérifie qu'un jeton est toujours valide (utilisé au démarrage du front). */
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.admin.sub })
})

export default router
