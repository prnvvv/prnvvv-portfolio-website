export const SITE_TITLE = 'GHOST PROTOCOL'
export const SITE_SUBTITLE = 'COMMAND CENTER'
export const OPERATOR_CALLSIGN = 'GHOST'

export const NAV_TABS = [
  { id: 'dossier', label: 'OPERATOR DOSSIER', icon: '◆' },
  { id: 'arsenal', label: 'ARSENAL', icon: '⚔' },
  { id: 'missions', label: 'MISSIONS', icon: '⌖' },
  { id: 'service-record', label: 'SERVICE RECORD', icon: '★' },
  { id: 'intel-reports', label: 'INTEL REPORTS', icon: '▣' },
  { id: 'comms', label: 'COMMS CONSOLE', icon: '◈' },
] as const

export const COLORS = {
  dark: '#0a0c0a',
  darker: '#0d110d',
  panel: '#1a2e1a',
  green: '#00ff88',
  olive: '#5a8a6a',
  light: '#c8ffd4',
  red: '#ff3344',
  yellow: '#ffcc00',
} as const

export const LOADING_DURATION = 3500
export const PARTICLE_COUNT = 60

export const API_ENDPOINTS = {
  chat: '/api/chat',
} as const
