import { ARCHIVE_IDS } from '../../data/sections'
import { IDENTITY_CONTENT, getProject } from '../../data/projects'
import { isSafeHref } from '../../lib/links'

/**
 * Full DOM fallback: used when WebGL is unavailable. The 3D journey must
 * never be the only way to access portfolio information — every project
 * reads here as text.
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
      <p>{IDENTITY_CONTENT.description}</p>
      <ol>
        {(['croc-os', 'voltedge', 'arm-5dof', ...ARCHIVE_IDS] as const).map((id) => {
          const p = getProject(id)
          const href = p.links.find((l) => isSafeHref(l.href))?.href
          return (
            <li key={id}>
              <strong>{p.tagline}</strong>
              <span>{p.description}</span>
              {p.stack.length > 0 && <span>Stack: {p.stack.join(', ')}</span>}
              {href && (
                <span>
                  <a href={href} target="_blank" rel="noreferrer">
                    Open link ↗
                  </a>
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
