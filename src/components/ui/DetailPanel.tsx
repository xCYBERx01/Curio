import { useEffect, useRef } from 'react'
import { createTimeline, stagger } from 'animejs'
import { GROUP_LABELS, NODE_MAP } from '../../data/nodes.ts'
import { IDENTITY_CONTENT, PROJECTS } from '../../data/projects.ts'
import { useCurioStore } from '../../store/useCurioStore.ts'
import { usePrefersReducedMotion } from '../../hooks/useCurio.ts'

/** External links are allow-listed to http(s) — never trust raw hrefs. */
export function isSafeHref(href: string): boolean {
  try {
    const url = new URL(href, window.location.origin)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Detail panel — the primary DOM interface for node content.
 * Animated exclusively with Anime.js v4 (opacity/transform only);
 * the 3D camera is never touched here.
 */
export function DetailPanel() {
  const activeNodeId = useCurioStore((s) => s.activeNodeId)
  const reducedMotion = usePrefersReducedMotion()
  const panelRef = useRef<HTMLElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const lastId = useRef<string | null>(null)

  const spec = activeNodeId ? NODE_MAP[activeNodeId] : undefined
  const open = spec !== undefined

  useEffect(() => {
    const el = panelRef.current
    if (!el || !spec) return
    lastId.current = spec.id
    closeRef.current?.focus({ preventScroll: true })
    if (reducedMotion) return
    const tl = createTimeline({ defaults: { ease: 'outCubic' } })
    tl.add(el, { opacity: [0, 1], translateX: [18, 0], duration: 420 })
    tl.add(
      el.querySelectorAll('.curio-anim'),
      { opacity: [0, 1], translateY: [8, 0], duration: 360, delay: stagger(55) },
      '-=220',
    )
  }, [spec, reducedMotion])

  const handleClose = (): void => {
    const id = lastId.current
    useCurioStore.getState().clearSelection()
    // Return keyboard focus to the control that opened this node.
    requestAnimationFrame(() => {
      const btn =
        (id ? document.querySelector(`[data-node-btn="${id}"]`) : null) ??
        document.querySelector('[data-index-toggle]')
      if (btn instanceof HTMLElement) btn.focus({ preventScroll: true })
    })
  }

  const isIdentity = spec?.type === 'identity'
  const project = spec && !isIdentity ? PROJECTS[spec.id] : undefined
  const links = (project?.links ?? []).filter((l) => isSafeHref(l.href))

  return (
    <aside
      ref={panelRef}
      id="curio-detail"
      className="curio-detail"
      data-open={open}
      aria-hidden={!open}
      aria-labelledby="curio-detail-heading"
    >
      {spec && (
        <>
          <div className="curio-detail-head">
            <div className="curio-anim">
              <div className="curio-detail-kicker">
                {spec.index} — {GROUP_LABELS[spec.group].toUpperCase()}
              </div>
              <h2 id="curio-detail-heading" className="curio-detail-title">
                {isIdentity ? IDENTITY_CONTENT.name : spec.label}
              </h2>
            </div>
            <button
              ref={closeRef}
              type="button"
              className="curio-detail-close"
              aria-label={`Close ${spec.label}`}
              onClick={handleClose}
            >
              &times;
            </button>
          </div>

          <p className="curio-detail-tagline curio-anim">
            {isIdentity ? IDENTITY_CONTENT.tagline : project?.tagline}
          </p>

          <dl className="curio-meta curio-anim">
            <div className="curio-meta-row">
              <dt>ID</dt>
              <dd>{spec.id}</dd>
            </div>
            <div className="curio-meta-row">
              <dt>TYPE</dt>
              <dd>{spec.type}</dd>
            </div>
            <div className="curio-meta-row">
              <dt>POS</dt>
              <dd>{spec.position.map((v) => v.toFixed(1)).join(' / ')}</dd>
            </div>
            <div className="curio-meta-row">
              <dt>STATUS</dt>
              <dd>{project ? project.status.toUpperCase() : 'ACTIVE'}</dd>
            </div>
          </dl>

          <p className="curio-detail-body curio-anim">
            {isIdentity ? IDENTITY_CONTENT.description : project?.description}
          </p>

          {isIdentity ? (
            <ul className="curio-stack curio-anim" aria-label="Focus areas">
              {IDENTITY_CONTENT.focusAreas.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          ) : (
            <>
              {project && project.stack.length > 0 && (
                <ul className="curio-stack curio-anim" aria-label="Technologies">
                  {project.stack.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
              {links.length > 0 ? (
                <div className="curio-links curio-anim">
                  {links.map((l) => (
                    <a key={l.href + l.label} href={l.href} target="_blank" rel="noreferrer">
                      {l.label.toUpperCase()} ↗
                    </a>
                  ))}
                </div>
              ) : (
                project?.status === 'forthcoming' && (
                  <p className="curio-pending curio-anim">
                    // CONTENT FORTHCOMING — EDIT src/data/projects.ts
                  </p>
                )
              )}
            </>
          )}
        </>
      )}
    </aside>
  )
}
