import { Component } from 'react'
import type { ReactNode } from 'react'
import { WebGLFallback } from '../ui/WebGLFallback.tsx'

interface Props {
  children: ReactNode
}

interface State {
  failed: boolean
  textMode: boolean
  /** Surfaced so the exact failure can be reported instead of guessed. */
  message: string | null
}

/**
 * A crashed WebGL scene degrades to retry / text mode — never a blank
 * page, never a silent failure. The captured message is shown so real
 * device failures can be diagnosed from a screenshot or paste.
 */
export class CanvasErrorBoundary extends Component<Props, State> {
  state: State = { failed: false, textMode: false, message: null }

  static getDerivedStateFromError(error: unknown): Partial<State> {
    const message =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : typeof error === 'string'
          ? error
          : 'Unknown render failure'
    const stack =
      error instanceof Error && typeof error.stack === 'string'
        ? error.stack.split('\n').slice(0, 4).join('\n')
        : null
    return { failed: true, message: stack ? `${message}\n${stack}` : message }
  }

  componentDidCatch(error: unknown): void {
    if (import.meta.env.DEV) console.error('[curio] canvas crashed.', error)
  }

  render(): ReactNode {
    if (this.state.textMode) {
      return <WebGLFallback reason="error" />
    }
    if (this.state.failed) {
      return (
        <div className="curio-error" role="alert">
          <h1>3D unavailable</h1>
          <p>
            The spatial scene could not start on this device. The portfolio
            content remains fully available below.
          </p>
          {this.state.message && (
            <details className="curio-details">
              <summary>ERROR DETAILS</summary>
              <p>
                <code>{this.state.message}</code>
              </p>
            </details>
          )}
          <div className="curio-links">
            <button
              type="button"
              className="curio-retry"
              onClick={() => this.setState({ failed: false, message: null })}
            >
              RETRY 3D
            </button>
            <button
              type="button"
              className="curio-retry"
              onClick={() => this.setState({ textMode: true })}
            >
              TEXT MODE
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
