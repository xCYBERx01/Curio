import { useEffect, useState, useSyncExternalStore } from 'react'
import { NODES } from '../data/nodes.ts'
import { useCurioStore } from '../store/useCurioStore.ts'

function matchQuery(query: string): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia(query).matches
}

function subscribeToQuery(query: string, onChange: () => void): () => void {
  const mql = window.matchMedia(query)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

/** Tracks `(prefers-reduced-motion: reduce)` — transitions go short/instant. */
export function usePrefersReducedMotion(): boolean {
  const value = useSyncExternalStore(
    (cb) => subscribeToQuery('(prefers-reduced-motion: reduce)', cb),
    () => matchQuery('(prefers-reduced-motion: reduce)'),
    () => false,
  )
  return value
}

const COMPACT_QUERY = '(max-width: 860px), (pointer: coarse) and (max-width: 1024px)'

/**
 * Compact-viewport flag. Mirrors into the Zustand store so the camera rig
 * and hit areas can react without every 3D component adding listeners.
 */
export function useCompactViewport(): boolean {
  const [compact, setCompact] = useState(() => matchQuery(COMPACT_QUERY))
  const setStoreCompact = useCurioStore((s) => s.setCompact)

  useEffect(() => {
    setStoreCompact(matchQuery(COMPACT_QUERY))
    const update = (): void => {
      const next = matchQuery(COMPACT_QUERY)
      setCompact(next)
      setStoreCompact(next)
    }
    return subscribeToQuery(COMPACT_QUERY, update)
  }, [setStoreCompact])

  return compact
}

/**
 * Global keyboard navigation: Escape closes focus, [ / ] (or arrows) step
 * through nodes in index order, Enter on a focused overview does nothing.
 * Node buttons in the header provide the equivalent pointer path.
 */
export function useCurioKeyboard(): void {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      const { activeNodeId, selectNode, clearSelection } = useCurioStore.getState()
      if (e.key === 'Escape') {
        e.preventDefault()
        clearSelection()
        return
      }
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== '[' && e.key !== ']') return
      // Don't hijack typing in inputs.
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
      e.preventDefault()
      const forward = e.key === 'ArrowRight' || e.key === ']'
      const current = NODES.findIndex((n) => n.id === activeNodeId)
      const next = current === -1 ? (forward ? 0 : NODES.length - 1) : (current + (forward ? 1 : -1) + NODES.length) % NODES.length
      selectNode(NODES[next].id)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
