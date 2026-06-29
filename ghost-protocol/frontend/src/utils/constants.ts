export const SITE_TITLE = 'GHOST PROTOCOL'
export const SITE_SUBTITLE = 'COMMAND CENTER'
export const OPERATOR_CALLSIGN = 'GHOST'

export const NAV_TABS = [
  { id: 'dossier', label: 'DOSSIER', icon: '◆' },
  { id: 'missions', label: 'MISSIONS', icon: '◆' },
  { id: 'service-record', label: 'SERVICE RECORD', icon: '◆' },
  { id: 'comms', label: 'COMMS CONSOLE', icon: '◆' },
] as const

export const COLORS = {
  dark: '#080c09',
  darker: '#080c09',
  panel: '#080c09',
  green: '#00e67a',
  cyan: '#00e67a',
  olive: 'rgba(255, 255, 255, 0.5)',
  light: 'rgba(255, 255, 255, 0.94)',
  muted: 'rgba(255, 255, 255, 0.6)',
  dim: 'rgba(255, 255, 255, 0.3)',
  red: '#00e67a',
  yellow: '#00e67a',
} as const

export const LOADING_DURATION = 3500
export const PARTICLE_COUNT = 60
export const PARTICLE_COUNT_MOBILE = 25

export const API_ENDPOINTS = {
  chat: '/api/chat',
} as const
