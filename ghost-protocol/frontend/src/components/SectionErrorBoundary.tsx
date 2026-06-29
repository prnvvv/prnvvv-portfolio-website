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
            color: '#00e67a',
            fontFamily: 'monospace',
            fontSize: '12px',
            border: '1px solid rgba(0,230,122,0.2)',
            margin: '16px',
            background: 'rgba(0,230,122,0.05)',
          }}
        >
          // SECTION ERROR [{this.props.name}]: {this.state.error}
        </div>
      )
    }
    return this.props.children
  }
}
