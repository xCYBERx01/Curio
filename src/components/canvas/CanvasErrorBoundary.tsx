import { Component } from 'react'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  failed: boolean
}

/**
 * A crashed WebGL scene must degrade to the DOM fallback, never a blank page.
 */
export class CanvasErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: unknown): void {
    if (import.meta.env.DEV) console.error('[curio] canvas crashed.', error)
  }

  render(): ReactNode {
    if (this.state.failed) {
      return (
        <div className="curio-error" role="alert">
          <h1>3D unavailable</h1>
          <p>
            The spatial scene could not start on this device. The portfolio
            content below remains fully available.
          </p>
          <button
            type="button"
            className="curio-retry"
            onClick={() => this.setState({ failed: false })}
          >
            RETRY 3D
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
