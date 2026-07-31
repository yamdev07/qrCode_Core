import crypto from 'node:crypto'

/**
 * Authentification admin — compte unique, sans dépendance externe.
 *
 * Choix : jeton signé maison (HMAC-SHA256) plutôt qu'une lib JWT, pour ne rien
 * avoir à installer/téléverser en plus. Le mot de passe et le secret viennent
 * du .env, jamais du code.
 */

const ADMIN_USER = process.env.ADMIN_USER || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''

// Secret de signature des jetons. À définir dans .env pour que les sessions
// survivent aux redémarrages ; sinon on en génère un au boot (les sessions
// existantes seront alors invalidées à chaque redémarrage).
const AUTH_SECRET =
  process.env.AUTH_SECRET || crypto.randomBytes(32).toString('hex')

if (!process.env.AUTH_SECRET) {
  console.warn(
    'AUTH_SECRET absent du .env : un secret temporaire est genere. ' +
      'Les connexions seront perdues a chaque redemarrage. Definissez AUTH_SECRET.'
  )
}

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000 // 12 h

function b64url(buf) {
  return Buffer.from(buf).toString('base64url')
}

/** Comparaison à temps constant de deux chaînes (anti timing-attack). */
function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest()
  const hb = crypto.createHash('sha256').update(String(b)).digest()
  return crypto.timingSafeEqual(ha, hb)
}

/** Vérifie identifiant + mot de passe contre la config .env. */
export function checkCredentials(username, password) {
  if (!ADMIN_PASSWORD) return false
  const userOk = safeEqual(username || '', ADMIN_USER)
  const passOk = safeEqual(password || '', ADMIN_PASSWORD)
  // On évalue les deux systématiquement pour ne pas fuiter par le timing.
  return userOk && passOk
}

/** Émet un jeton signé { sub, exp }. */
export function issueToken(sub = 'admin') {
  const payload = b64url(JSON.stringify({ sub, exp: Date.now() + TOKEN_TTL_MS }))
  const sig = b64url(crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest())
  return `${payload}.${sig}`
}

/** Renvoie le payload si le jeton est valide et non expiré, sinon null. */
export function verifyToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null
  const [payload, sig] = token.split('.')
  const expected = b64url(crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest())
  const sigBuf = Buffer.from(sig || '', 'utf8')
  const expBuf = Buffer.from(expected, 'utf8')
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null
  }
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (!data.exp || data.exp < Date.now()) return null
    return data
  } catch {
    return null
  }
}

/** Middleware Express : exige un jeton valide dans l'en-tête Authorization. */
export function requireAuth(req, res, next) {
  const header = req.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  const payload = verifyToken(token)
  if (!payload) {
    return res.status(401).json({ error: 'Authentification requise' })
  }
  req.admin = payload
  next()
}
