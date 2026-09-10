import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import { ARCHIVE_IDS, NAV_SECTIONS, SECTION_MAP } from '../../data/sections.ts'
import { PROJECTS } from '../../data/projects.ts'
import { isSafeHref } from '../../lib/links.ts'
import { useCurioStore } from '../../store/useCurioStore.ts'
import { usePrefersReducedMotion } from '../../hooks/useCurio.ts'

/**
 * Secondary navigation: journey stops plus the full project archive.
 * Transient open-state stays local; destinations go through the store.
 */
export function SiteIndex() {
  const [open, setOpen] = useState(false)
  const activeSection = useCurioStore((s) => s.activeSection)
  const reducedMotion = usePrefersReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = panelRef.current
    if (!el || !open || reducedMotion) return
    animate(el, { opacity: [0, 1], translateX: [-12, 0], duration: 320, ease: 'outCubic' })
  }, [open, reducedMotion])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="curio-index">
      <button
        type="button"
        data-index-toggle
        className="curio-index-toggle"
        aria-expanded={open}
        aria-controls="curio-site-index"
        onClick={() => setOpen((v) => !v)}
      >
        INDEX {open ? '−' : '+'}
      </button>
      {open && (
        <div ref={panelRef} id="curio-site-index" className="curio-index-panel" role="dialog" aria-label="Full site index">
          <section className="curio-index-group">
            <h3>JOURNEY</h3>
            <ul>
              {NAV_SECTIONS.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    aria-current={activeSection === s.id ? 'true' : undefined}
                    onClick={() => {
                      useCurioStore.getState().goToSection(s.stop)
                      setOpen(false)
                    }}
                  >
                    <span className="idx">{s.nav?.split(' ')[0]}</span>
                    <span>{s.title.toUpperCase()}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
          <section className="curio-index-group">
            <h3>ARCHIVE</h3>
            <ul>
              {ARCHIVE_IDS.map((id, i) => {
                const p = PROJECTS[id]
                const href = p.links.find((l) => isSafeHref(l.href))?.href
                const label = `${String(i + 1).padStart(2, '0')} — ${p.tagline}`
                return (
                  <li key={id}>
                    {href ? (
                      <a className="curio-index-link" href={href} target="_blank" rel="noreferrer">
                        {label}
                      </a>
                    ) : (
                      <span className="curio-index-link">{label}</span>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
          <p className="curio-index-note">
            {SECTION_MAP[activeSection].nav ?? 'INTRO'} — {SECTION_MAP[activeSection].title.toUpperCase()}
          </p>
        </div>
      )}
    </div>
  )
}
