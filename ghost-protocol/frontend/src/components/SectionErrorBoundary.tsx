import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  name: string
}

interface State {
  hasError: boolean
  error: string
}

export class SectionErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: '' }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '40px',
            color: '#ff4444',
            fontFamily: 'monospace',
            fontSize: '12px',
            border: '1px solid rgba(255,68,68,0.2)',
            margin: '16px',
            background: 'rgba(255,68,68,0.05)',
          }}
        >
          // SECTION ERROR [{this.props.name}]: {this.state.error}
        </div>
      )
    }
    return this.props.children
  }
}
