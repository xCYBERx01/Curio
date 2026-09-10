import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import { GROUP_LABELS, GROUP_ORDER, NODES } from '../../data/nodes.ts'
import type { NodeGroup } from '../../data/nodes.ts'
import { useCurioStore } from '../../store/useCurioStore.ts'
import { usePrefersReducedMotion } from '../../hooks/useCurio.ts'

/**
 * Full site index: every node grouped by discipline. The keyboard and
 * touch path to non-featured nodes (and the primary nav on mobile, where
 * the header row is hidden). Local useState — this is transient UI state,
 * not global selection state.
 */
export function SiteIndex() {
  const [open, setOpen] = useState(false)
  const activeNodeId = useCurioStore((s) => s.activeNodeId)
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
  }, [open ])

  const groups = GROUP_ORDER.map((g: NodeGroup) => ({
    group: g,
    nodes: NODES.filter((n) => (g === 'featured' ? n.featured : n.group === g && !n.featured)),
  })).filter((g) => g.nodes.length > 0)

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
          {groups.map(({ group, nodes }) => (
            <section key={group} className="curio-index-group">
              <h3>{GROUP_LABELS[group].toUpperCase()}</h3>
              <ul>
                {nodes.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      data-node-btn={n.id}
                      aria-pressed={activeNodeId === n.id}
                      onClick={() => {
                        useCurioStore.getState().selectNode(n.id)
                        setOpen(false)
                      }}
                    >
                      <span className="idx">{n.index}</span>
                      <span>{n.short.toUpperCase()}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
