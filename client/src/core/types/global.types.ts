// Types globaux utilisés partout dans l'app

export type AsyncState<T> = {
  data: T | null
  error: string | null
  isLoading: boolean
}

export type QRCodeFormat = 'png' | 'svg' | 'dataUrl'

export type QRCodeOptions = {
  url: string
  size: number
  format: QRCodeFormat
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'
  foreground: string
  background: string
  margin: number
}

export type ApiResponse<T> = {
  success: boolean
  data: T | null
  error: string | null
  timestamp: string
}

export type UserRole = 'admin' | 'organizer' | 'participant'

export type UserProfile = {
  id: string
  email: string
  role: UserRole
  created_at: string
}
