import { useEffect } from 'react'
import { animate, stagger } from 'animejs'
import { FEATURED_NODES, NODES } from '../../data/nodes.ts'
import { useCurioStore } from '../../store/useCurioStore.ts'
import { usePrefersReducedMotion } from '../../hooks/useCurio.ts'
import { SiteIndex } from './SiteIndex.tsx'

/**
 * DOM chrome: wordmark, featured index, full site index, status readout,
 * hints. Pure DOM — never touches the 3D scene except through the store.
 */
export function Chrome() {
  const ready = useCurioStore((s) => s.ready)
  const activeNodeId = useCurioStore((s) => s.activeNodeId)
  const cameraMode = useCurioStore((s) => s.cameraMode)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (!ready) return
    const d = reducedMotion ? 1 : 650
    animate('.curio-header', {
      opacity: [0, 1],
      translateY: [-8, 0],
      duration: d,
      ease: 'outCubic',
    })
    animate('.curio-nav-btn, .curio-index-toggle', {
      opacity: [0, 1],
      translateY: [-6, 0],
      duration: reducedMotion ? 1 : 450,
      delay: stagger(35),
      ease: 'outCubic',
    })
    animate('.curio-status, .curio-hints', {
      opacity: [0, 1],
      duration: d,
      ease: 'outCubic',
    })
  }, [ready, reducedMotion])

  return (
    <>
      <header className="curio-header">
        <div className="curio-wordmark" aria-label="Curio — Ahmed, Robotics and AI">
          <span className="mark">
            <span className="dot" aria-hidden="true" />
            CURIO
          </span>
          <span className="sub">AHMED — ROBOTICS &amp; AI</span>
        </div>
        <nav className="curio-nav" aria-label="Featured index">
          {FEATURED_NODES.map((n) => (
            <button
              key={n.id}
              type="button"
              data-node-btn={n.id}
              className="curio-nav-btn"
              aria-pressed={activeNodeId === n.id}
              aria-label={`Focus ${n.label}`}
              onClick={() => useCurioStore.getState().selectNode(n.id)}
            >
              <span className="idx">{n.index}</span>
              <span>{n.short.toUpperCase()}</span>
            </button>
          ))}
        </nav>
        <SiteIndex />
      </header>

      <div className="curio-status" role="status" aria-live="polite">
        <span>
          CAM <span className="live">{cameraMode.toUpperCase()}</span>
        </span>
        <span>
          SEL <span className="live">{activeNodeId ? activeNodeId.toUpperCase() : '—'}</span>
        </span>
        <span>{String(NODES.length).padStart(2, '0')} NODES</span>
      </div>

      <div className="curio-hints">
        <span>
          <kbd>ESC</kbd> CLOSE
        </span>
        <span>
          <kbd>&larr;</kbd>
          <kbd>&rarr;</kbd> STEP
        </span>
        <button
          type="button"
          className="curio-overview-btn"
          onClick={() => useCurioStore.getState().clearSelection()}
        >
          OVERVIEW
        </button>
      </div>
    </>
  )
}
