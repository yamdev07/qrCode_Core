import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Pool MySQL/MariaDB exposé avec une interface proche de node-postgres, pour
 * que les routes restent lisibles : `query()` renvoie `{ rows, rowCount }`.
 *
 * Différences MySQL assumées côté requêtes (voir routes/) :
 *   - placeholders positionnels `?` au lieu de `$1, $2, ...`
 *   - pas de `RETURNING` : on ré-interroge par id après INSERT/UPDATE
 *   - `rowCount` (affectedRows) pour savoir si un DELETE a touché une ligne
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME || 'qrcode_core',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
  // Renvoie les DATETIME comme chaînes brutes plutôt que comme objets Date,
  // pour que le JSON sorti soit stable quel que soit le fuseau du serveur.
  dateStrings: true
})

/**
 * Exécute une requête et renvoie un objet façon pg.
 * - SELECT  -> { rows: [...], rowCount }
 * - autres  -> { rows: [], rowCount: affectedRows, insertId }
 */
async function query(sql, params = []) {
  const [result] = await pool.query(sql, params)
  if (Array.isArray(result)) {
    return { rows: result, rowCount: result.length }
  }
  return { rows: [], rowCount: result.affectedRows ?? 0, insertId: result.insertId }
}

export default { query, pool }
