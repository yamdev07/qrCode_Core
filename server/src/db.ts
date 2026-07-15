import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config({ path: '../.env' })

const pool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'qrdb',
  user: process.env.DB_USER || 'qradmin',
  password: process.env.DB_PASSWORD || 'qrpassword',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

export default pool
