import { CurioCanvas } from '../components/canvas/CurioCanvas.tsx'
import { Chrome } from '../components/ui/Chrome.tsx'
import { LoadScreen } from '../components/ui/LoadScreen.tsx'
import { ScrollRail } from '../components/ui/ScrollRail.tsx'
import { SectionOverlay } from '../components/ui/SectionOverlay.tsx'
import { ARCHIVE_IDS, STOP_COUNT } from '../data/sections.ts'
import { IDENTITY_CONTENT, PROJECTS } from '../data/projects.ts'
import { useCompactViewport, useCurioKeyboard, useScrollDriver } from '../hooks/useCurio.ts'

/**
 * Curio — a scroll-driven spatial journey. Composition only:
 * fixed viewport (3D world + editorial overlay + rail) over a tall
 * scroll track that drives everything. All shared state in Zustand;
 * continuous scroll progress in a mutable ref (never re-renders).
 */
export default function App() {
  useCompactViewport()
  useScrollDriver()
  useCurioKeyboard()

  return (
    <div className="curio-root">
      <a href="#curio-overlay" className="skip-link">
        Skip to current section
      </a>
      <LoadScreen />
      <Chrome />
      <div className="curio-viewport">
        <main aria-label="Curio spatial journey">
          <CurioCanvas />
        </main>
        <SectionOverlay />
        <ScrollRail />
      </div>
      {/* Scroll track: its length IS the journey timeline. */}
      <div className="curio-scroll" aria-hidden="true" style={{ height: `${STOP_COUNT * 100}vh` }} />

      {/* Semantic text alternative: indexed by search, read by screen readers. */}
      <section className="curio-sr-content" aria-label="Portfolio content, text version">
        <h1>
          Ahmed — Robotics &amp; AI Student. {IDENTITY_CONTENT.tagline}
        </h1>
        <p>{IDENTITY_CONTENT.description}</p>
        <h2>Featured projects</h2>
        <ul>
          {(['croc-os', 'voltedge', 'arm-5dof'] as const).map((id) => (
            <li key={id}>
              {PROJECTS[id].tagline} {PROJECTS[id].description}
            </li>
          ))}
        </ul>
        <h2>Archive</h2>
        <ul>
          {ARCHIVE_IDS.map((id) => (
            <li key={id}>
              {PROJECTS[id].tagline} — {PROJECTS[id].stack.join(', ')}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
