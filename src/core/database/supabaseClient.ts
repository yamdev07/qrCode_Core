// src/core/database/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'
import { log } from '@core/logger/logger'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  log.error('Variables Supabase manquantes. Vérifie ton fichier .env')
  throw new Error('Configuration Supabase incomplète')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'qrcode-app'
    }
  }
})

log.info('Client Supabase initialisé')
