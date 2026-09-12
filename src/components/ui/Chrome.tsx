import { useEffect } from 'react'
import { animate } from 'animejs'
import { NAV_SECTIONS, SECTION_MAP } from '../../data/sections'
import { useCurioStore } from '../../store/useCurioStore'
import { usePrefersReducedMotion } from '../../hooks/useCurio'
import { SiteIndex } from './SiteIndex'

/**
 * Restrained chrome: wordmark, live section readout, index. Navigation
 * lives in the rail + index; the header only orients. Never touches 3D
 * except through the store.
 */
export function Chrome() {
  const ready = useCurioStore((s) => s.ready)
  const activeSection = useCurioStore((s) => s.activeSection)
  const reducedMotion = usePrefersReducedMotion()
  const spec = SECTION_MAP[activeSection]

  useEffect(() => {
    if (!ready) return
    const d = reducedMotion ? 1 : 650
    const a = animate('.curio-header', {
      opacity: [0, 1],
      translateY: [-8, 0],
      duration: d,
      ease: 'outCubic',
    })
    const b = animate('.curio-sec, .curio-rail', {
      opacity: [0, 1],
      duration: d,
      ease: 'outCubic',
    })
    return () => {
      a.cancel()
      b.cancel()
    }
  }, [ready, reducedMotion])

  return (
    <header className="curio-header">
      <button
        type="button"
        className="curio-wordmark"
        aria-label="Curio — back to start"
        onClick={() => useCurioStore.getState().goToSection(0)}
      >
        <span className="mark">
          <span className="dot" aria-hidden="true" />
          CURIO
        </span>
        <span className="sub">AHMED — ROBOTICS &amp; AI</span>
      </button>
      <div className="curio-current" role="status" aria-live="polite">
        {spec.nav ?? '00 — ENTER'}
      </div>
      <nav className="curio-sections" aria-label="Journey chapters">
        {NAV_SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            data-active={activeSection === s.id}
            aria-current={activeSection === s.id ? 'true' : undefined}
            onClick={() => useCurioStore.getState().goToSection(s.stop)}
          >
            {s.nav}
          </button>
        ))}
      </nav>
      <SiteIndex />
    </header>
  )
}
