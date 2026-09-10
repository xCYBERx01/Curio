import { NODES } from '../../data/nodes.ts'
import { IDENTITY_CONTENT, PROJECTS } from '../../data/projects.ts'

/**
 * Full DOM fallback: used when WebGL is unavailable. The 3D scene must
 * never be the only way to access portfolio information.
 */
export function WebGLFallback({ reason }: { reason: 'unavailable' | 'error' }) {
  return (
    <div className="curio-fallback">
      <h1>Curio — Ahmed · Robotics &amp; AI</h1>
      <p>
        {reason === 'unavailable'
          ? 'Your device could not start WebGL, so here is the full portfolio as text. '
          : 'The 3D scene failed to start, so here is the full portfolio as text. '}
        {IDENTITY_CONTENT.tagline}
      </p>
      <ol>
        {NODES.map((n) => (
          <li key={n.id}>
            <strong>
              {n.index} — {n.label}
            </strong>
            <span>
              {n.type === 'identity'
                ? IDENTITY_CONTENT.description
                : (PROJECTS[n.id]?.description ?? '')}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
