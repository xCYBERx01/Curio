import { CurioCanvas } from '../components/canvas/CurioCanvas.tsx'
import { Chrome } from '../components/ui/Chrome.tsx'
import { DetailPanel } from '../components/ui/DetailPanel.tsx'
import { LoadScreen } from '../components/ui/LoadScreen.tsx'
import { NODES } from '../data/nodes.ts'
import { IDENTITY_CONTENT, PROJECTS } from '../data/projects.ts'
import { useCompactViewport, useCurioKeyboard } from '../hooks/useCurio.ts'

/**
 * Curio — spatial portfolio. Composition only:
 * 3D layer (CurioCanvas) + DOM layer (Chrome, DetailPanel) + load gate.
 * All shared state lives in Zustand; no prop drilling.
 */
export default function App() {
  useCompactViewport()
  useCurioKeyboard()

  return (
    <div className="curio-root">
      <a href="#curio-detail-heading" className="skip-link">
        Skip to project details
      </a>
      <LoadScreen />
      <Chrome />
      <main className="curio-stage" aria-label="Curio spatial portfolio">
        <CurioCanvas />
        <DetailPanel />
      </main>

      {/* Semantic text alternative: indexed by search, read by screen readers. */}
      <section className="curio-sr-content" aria-label="Portfolio content, text version">
        <h1>
          Ahmed — Robotics &amp; AI Student. {IDENTITY_CONTENT.tagline}
        </h1>
        <p>{IDENTITY_CONTENT.description}</p>
        <ul>
          {NODES.map((n) => (
            <li key={n.id}>
              {n.label} ({n.type}
              {n.type !== 'identity' && PROJECTS[n.id] ? `, ${PROJECTS[n.id].tagline}` : ''})
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
