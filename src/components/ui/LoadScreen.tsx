import { useEffect, useState } from 'react'
import { createTimeline } from 'animejs'
import { useCurioStore } from '../../store/useCurioStore'
import { usePrefersReducedMotion } from '../../hooks/useCurio'

/**
 * Restrained load sequence: environment establishes, bar fills, overlay
 * lifts. Fast by design (~1s) — never a cinematic gate. Failsafe marks
 * ready even if animation is interrupted.
 */
export function LoadScreen() {
  const ready = useCurioStore((s) => s.ready)
  const reducedMotion = usePrefersReducedMotion()
  const [gone, setGone] = useState(false)

  useEffect(() => {
    if (ready) return
    if (reducedMotion) {
      useCurioStore.getState().markReady()
      return
    }
    const tl = createTimeline()
    tl.add('.curio-loader-bar', {
      scaleX: [0, 1],
      duration: 550,
      ease: 'inOutCubic',
    })
    tl.add(
      '.curio-loader',
      {
        opacity: [1, 0],
        duration: 280,
        ease: 'outCubic',
        onComplete: () => useCurioStore.getState().markReady(),
      },
      '+=60',
    )
    const failsafe = window.setTimeout(() => useCurioStore.getState().markReady(), 3000)
    return () => {
      window.clearTimeout(failsafe)
      tl.cancel()
    }
  }, [ready, reducedMotion])

  useEffect(() => {
    if (!ready) return
    const t = window.setTimeout(() => setGone(true), reducedMotion ? 5 : 340)
    return () => window.clearTimeout(t)
  }, [ready, reducedMotion])

  if (gone) return null

  return (
    <div className="curio-loader" style={{ pointerEvents: ready ? 'none' : 'auto' }} aria-hidden={ready}>
      <div className="curio-loader-inner">
        <div className="curio-loader-mark">CURIO</div>
        <div className="curio-loader-sub">AHMED — ROBOTICS &amp; AI</div>
        <div className="curio-loader-track">
          <div className="curio-loader-bar" />
        </div>
      </div>
    </div>
  )
}
