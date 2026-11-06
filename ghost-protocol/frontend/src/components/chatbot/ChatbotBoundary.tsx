import { Component, type ReactNode } from 'react'

/** The assistant is optional: if it ever throws, render nothing rather than breaking the portfolio. */
export default class ChatbotBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}
