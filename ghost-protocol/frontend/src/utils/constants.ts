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
  dark: '#0d0d14',
  darker: '#181825',
  panel: '#181825',
  green: '#00e67a',
  cyan: '#00c4f0',
  olive: '#5a8a6a',
  light: '#f0f0f0',
  muted: '#9a9aaa',
  dim: '#4a4a5a',
  red: '#ff3344',
  yellow: '#ffcc00',
} as const

export const LOADING_DURATION = 3500
export const PARTICLE_COUNT = 60
export const PARTICLE_COUNT_MOBILE = 25

export const API_ENDPOINTS = {
  chat: '/api/chat',
} as const
