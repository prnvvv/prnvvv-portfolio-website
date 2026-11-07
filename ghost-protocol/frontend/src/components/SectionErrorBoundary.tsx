import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  name: string
}

interface State {
  hasError: boolean
  error: string
}

function sendErrorLog(error: Error, component: string): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined
  if (import.meta.env.PROD && dsn) {
    try {
      const match = dsn.match(/^https:\/\/(.+)@(.+)\.ingest\.sentry\.io\/(\d+)$/)
      if (!match) return
      const host = match[2]
      const projectId = match[3]
      const url = `https://${host}.ingest.sentry.io/api/${projectId}/envelope/`
      void fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
          level: 'error',
          message: error.message,
          culprit: component,
          timestamp: new Date().toISOString(),
          request: { url: window.location.href },
        }),
      })
    } catch {
    }
  }
}

export class SectionErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: '' }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    sendErrorLog(error, this.props.name)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '40px',
            color: '#00e67a',
            fontFamily: 'monospace',
            fontSize: '12px',
            border: '1px solid rgba(0,230,122,0.2)',
            margin: '16px',
            background: 'rgba(0,230,122,0.05)',
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>// SECTION ERROR</span>
          <span style={{ color: 'rgba(0,230,122,0.7)' }}> [{this.props.name}]: </span>
          {this.state.error}
        </div>
      )
    }
    return this.props.children
  }
}
