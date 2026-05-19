export type ScanResult = {
  content: string
  timestamp: string
  format: 'url' | 'text' | 'presence' | 'unknown'
  sessionId?: string
}

export type PresenceData = {
  session_id: string
  utilisateur_id: string
  agent_nom: string
  timestamp: string
}

export type ScannerState = {
  isScanning: boolean
  lastResult: ScanResult | null
  error: string | null
  cameraActive: boolean
}

export type PresenceConfirmation = {
  id: string
  session_id: string
  utilisateur_id: string
  agent_nom: string
  created_at: string
  session_nom?: string
}

export type AgentConfirmation = {
  sessionId: string
  agentNom: string
  horodatage: string
}
