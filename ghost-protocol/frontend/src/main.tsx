import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'
import './styles/military.css'
import './styles/mobile-fixes.css'

const REQUIRED_VARS: string[] = []
const MISSING = REQUIRED_VARS.filter((key) => !import.meta.env[key])
if (MISSING.length > 0) {
  throw new Error(
    `[GHOST PROTOCOL] Missing required environment variables:\n  ${MISSING.join('\n  ')}\n\n` +
      'Check .env.local for configuration.'
  )
}

if (import.meta.env.PROD && window.location.protocol !== 'https:') {
  window.location.replace(
    `https://${window.location.host}${window.location.pathname}${window.location.search}`
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
