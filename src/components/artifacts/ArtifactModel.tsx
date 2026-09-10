import { Component, Suspense, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useGLTF } from '@react-three/drei'

/**
 * Reusable GLB layer: cached via useGLTF, cloned per instance, preloaded
 * up front. Any failure renders the procedural fallback — never crashes.
 */

interface BoundaryProps {
  fallback: ReactNode
  children: ReactNode
}

interface BoundaryState {
  failed: boolean
}

export class ArtifactErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false }

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: unknown): void {
    if (import.meta.env.DEV) console.error('[curio] artifact asset failed — using fallback.', error)
  }

  render(): ReactNode {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

function Model({ url }: { url: string }) {
  const gltf = useGLTF(url)
  const scene = useMemo(() => gltf.scene.clone(), [gltf])
  return <primitive object={scene} />
}

export function preloadArtifactAsset(url: string | null): void {
  if (url) useGLTF.preload(url)
}

/** Renders `url` when set, otherwise the procedural `fallback` directly. */
export function ArtifactModel({ url, fallback }: { url: string | null; fallback: ReactNode }) {
  if (!url) return <>{fallback}</>
  return (
    <ArtifactErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <Model url={url} />
      </Suspense>
    </ArtifactErrorBoundary>
  )
}
