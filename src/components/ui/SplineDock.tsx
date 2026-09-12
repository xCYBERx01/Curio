import { Suspense, lazy, useEffect, useState } from 'react'
import { SECTION_MAP } from '../../data/sections'
import { useCurioStore } from '../../store/useCurioStore'

const SplineScene = lazy(() => import('@splinetool/react-spline'))

/**
 * Spline dock: renders a Spline-authored scene full-viewport for any stop
 * whose section data carries a `splineUrl`, crossfaded over the R3F world
 * (which stays visible behind it while loading — no blank frame, ever).
 *
 * No stop configures a URL yet, so this costs nothing today. To dock a
 * scene: design it at spline.design, publish to get the `.splinecode` URL,
 * and set `splineUrl` on the stop in `src/data/sections.ts`.
 */
export function SplineDock() {
  const activeSection = useCurioStore((s) => s.activeSection)
  const url = SECTION_MAP[activeSection].splineUrl ?? null
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!url) {
      setVisible(false)
      return
    }
    const t = window.setTimeout(() => setVisible(true), 60)
    return () => window.clearTimeout(t)
  }, [url])

  if (!url) return null

  return (
    <div className="curio-spline" data-visible={visible} aria-hidden="true">
      <Suspense fallback={null}>
        <SplineScene scene={url} />
      </Suspense>
    </div>
  )
}
