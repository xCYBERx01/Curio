import { Component, Suspense, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

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

/**
 * Auto-fitted presentation: normalizes any GLB to `height` units tall
 * and grounds it at the group origin — blind-safe for models whose
 * proportions were authored elsewhere.
 */
export function FittedArtifactModel({ url, height = 1.6 }: { url: string; height?: number }) {
  const gltf = useGLTF(url)
  const scene = useMemo(() => {
    const cloned = gltf.scene.clone()
    const box = new THREE.Box3().setFromObject(cloned)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const s = height / Math.max(size.x, size.y, size.z, 0.001)
    cloned.scale.setScalar(s)
    cloned.position.set(-center.x * s, -box.min.y * s, -center.z * s)
    return cloned
  }, [gltf, height])
  return <primitive object={scene} />
}

export function ArtifactModel({
  url,
  fallback,
  fitHeight = null,
}: {
  url: string | null
  fallback: ReactNode
  fitHeight?: number | null
}) {
  if (!url) return <>{fallback}</>
  return (
    <ArtifactErrorBoundary key={url} fallback={fallback}>
      <Suspense fallback={fallback}>
        {fitHeight ? <FittedArtifactModel url={url} height={fitHeight} /> : <Model url={url} />}
      </Suspense>
    </ArtifactErrorBoundary>
  )
}
