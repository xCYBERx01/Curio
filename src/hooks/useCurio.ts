import { useEffect, useState, useSyncExternalStore } from 'react'
import { SECTIONS, SECTION_MAP } from '../data/sections'
import { preloadArtifactAsset } from '../lib/models'
import { syncScrollState } from '../lib/scroll'
import { useCurioStore } from '../store/useCurioStore'

function matchQuery(query: string): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia(query).matches
}

function subscribeToQuery(query: string, onChange: () => void): () => void {
  const mql = window.matchMedia(query)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

/** Tracks `(prefers-reduced-motion: reduce)` — motion goes short/instant. */
export function usePrefersReducedMotion(): boolean {
  const value = useSyncExternalStore(
    (cb) => subscribeToQuery('(prefers-reduced-motion: reduce)', cb),
    () => matchQuery('(prefers-reduced-motion: reduce)'),
    () => false,
  )
  return value
}

const COMPACT_QUERY = '(max-width: 860px), (pointer: coarse) and (max-width: 1024px)'

/** Compact-viewport flag mirrored into the store for camera + DOM density. */
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
 * Scroll driver: rAF-throttled scroll listener. Continuous progress lives
 * in the mutable scrollState (read by the frame loop); discrete stop
 * changes go through Zustand (drives DOM overlay, rail, header).
 */
export function useScrollDriver(): void {
  useEffect(() => {
    let queued = false
    let armPreloaded = false
    let nrlPreloaded = false
    const onScroll = (): void => {
      if (queued) return
      queued = true
      requestAnimationFrame(() => {
        queued = false
        const f = syncScrollState()
        const stop = Math.min(SECTIONS.length - 1, Math.max(0, Math.round(f)))
        useCurioStore.getState().setActiveSection(SECTIONS[stop].id)
        // Stream bay models progressively as the journey approaches them —
        // first paint never pays for geometry. URLs come from the section
        // data (single source of truth). Procedural fallbacks hold each
        // bay until its GLB arrives.
        if (!armPreloaded && f > 0.4) {
          armPreloaded = true
          preloadArtifactAsset(SECTION_MAP.arm.assetUrl)
        }
        // Stream the heavy NRL assembly only once the journey is underway —
        // never block first paint with it.
        if (!nrlPreloaded && f > 0.7) {
          nrlPreloaded = true
          preloadArtifactAsset(SECTION_MAP.voltedge.assetUrl)
        }
      })
    }
    syncScrollState()
    const initial = Math.round(syncScrollState())
    useCurioStore.getState().setActiveSection(SECTIONS[initial].id)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
}

/**
 * Keyboard journey: arrows step between stops, Escape returns to intro.
 * Native scroll already moves the world; keys just request destinations.
 */
export function useCurioKeyboard(): void {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
      const st = useCurioStore.getState()
      const current = SECTIONS.findIndex((s) => s.id === st.activeSection)
      if (e.key === 'Escape') {
        e.preventDefault()
        st.goToSection(0)
        return
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ']') {
        e.preventDefault()
        st.goToSection(Math.min(SECTIONS.length - 1, current + 1))
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === '[') {
        e.preventDefault()
        st.goToSection(Math.max(0, current - 1))
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
