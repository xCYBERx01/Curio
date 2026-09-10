import { STOP_COUNT } from '../data/sections'

/**
 * Transient scroll state — the single continuous driver of camera, stage
 * and artifact wake. A mutable module ref (not Zustand): it updates every
 * scroll event and is read every frame; putting it in the store would
 * re-render React at scroll frequency. Discrete section changes DO go
 * through Zustand (see useScrollDriver).
 */
export const scrollState = {
  /** 0..1 across the whole journey. */
  progress: 0,
  /** 0..(STOP_COUNT-1) continuous stop float. */
  float: 0,
}

export function readScrollProgress(): number {
  const doc = document.documentElement
  const max = Math.max(1, doc.scrollHeight - window.innerHeight)
  return Math.min(1, Math.max(0, window.scrollY / max))
}

export function syncScrollState(): number {
  const progress = readScrollProgress()
  scrollState.progress = progress
  scrollState.float = progress * (STOP_COUNT - 1)
  return scrollState.float
}

export function scrollToSection(stop: number): void {
  const clamped = Math.min(STOP_COUNT - 1, Math.max(0, stop))
  const doc = document.documentElement
  const max = Math.max(1, doc.scrollHeight - window.innerHeight)
  const reduced =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: (clamped / (STOP_COUNT - 1)) * max, behavior: reduced ? 'auto' : 'smooth' })
}
