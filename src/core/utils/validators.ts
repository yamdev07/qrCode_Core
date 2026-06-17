import { z } from 'zod'

export const urlSchema = z
  .string()
  .url('Veuillez entrer une URL valide')
  .max(2048, "L'URL ne doit pas dépasser 2048 caractères")

export const qrOptionsSchema = z.object({
  url: urlSchema,
  size: z.number().min(64).max(1024).default(256),
  format: z.enum(['png', 'svg', 'dataUrl']).default('png'),
  errorCorrectionLevel: z.enum(['L', 'M', 'Q', 'H']).default('M'),
  foreground: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#000000'),
  background: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#FFFFFF'),
  margin: z.number().min(0).max(20).default(4)
})

export const personCardSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis').max(120, 'Le nom est trop long'),
  rectoUrl: urlSchema,
  versoUrl: urlSchema.or(z.literal('')).optional()
})

export const sessionSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis').max(255),
  code_unique: z.string().min(3).max(50).optional(),
  date: z.string().datetime().optional()
})

export const presenceSchema = z.object({
  session_id: z.string().uuid('ID de session invalide'),
  utilisateur_id: z.string().min(1),
  timestamp: z.string().datetime().optional()
})

export type URlValidation = z.infer<typeof urlSchema>
export type QROptionsValidation = z.infer<typeof qrOptionsSchema>
export type PersonCardValidation = z.infer<typeof personCardSchema>
export type SessionValidation = z.infer<typeof sessionSchema>
export type PresenceValidation = z.infer<typeof presenceSchema>
