import { NAV_SECTIONS, SECTION_MAP } from '../../data/sections'
import { useCurioStore } from '../../store/useCurioStore'

/**
 * Scroll rail: one tick per navigable stop. Clicking requests a
 * destination; scroll does the travelling. The journey's minimal nav.
 */
export function ScrollRail() {
  const activeSection = useCurioStore((s) => s.activeSection)

  return (
    <nav className="curio-rail" aria-label="Journey stops">
      {NAV_SECTIONS.map((s) => (
        <button
          key={s.id}
          type="button"
          className="curio-rail-stop"
          data-active={SECTION_MAP[activeSection].stop >= s.stop}
          aria-current={activeSection === s.id ? 'true' : undefined}
          aria-label={`Go to ${s.title}`}
          onClick={() => useCurioStore.getState().goToSection(s.stop)}
        >
          <span className="rail-idx">{s.nav?.split(' ')[0]}</span>
          <span className="rail-dot" aria-hidden="true" />
          <span className="rail-label">{s.nav?.split(' ').slice(1).join(' ')}</span>
        </button>
      ))}
    </nav>
  )
}
