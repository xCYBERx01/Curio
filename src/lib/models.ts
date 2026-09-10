import { useGLTF } from '@react-three/drei'

/**
 * GLB cache warming. Lives in lib (not a component file) so hooks and
 * components can share it without layering inversions or fast-refresh
 * hazards. Failures reject silently — Suspense fallbacks own the UI.
 */
export function preloadArtifactAsset(url: string | null | undefined): void {
  if (!url) return
  try {
    const result = useGLTF.preload(url) as unknown
    if (result instanceof Promise) {
      result.catch(() => {
        if (import.meta.env.DEV) console.warn(`[curio] preload failed: ${url}`)
      })
    }
  } catch {
    if (import.meta.env.DEV) console.warn(`[curio] preload failed: ${url}`)
  }
}
