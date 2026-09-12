import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState } from '../../lib/scroll'
import { useCurioStore } from '../../store/useCurioStore'
import { usePrefersReducedMotion } from '../../hooks/useCurio'

/**
 * Atmosphere: a restrained field of drifting dust motes that gives the
 * light world depth and air. One draw call, one shared buffer, slow
 * autonomous drift plus a whisper of scroll response (density swells
 * toward the finale). Frozen under reduced motion.
 */
export function Atmosphere() {
  const compact = useCurioStore((s) => s.compact)
  const reducedMotion = usePrefersReducedMotion()
  const points = useRef<THREE.Points>(null!)
  const mat = useRef<THREE.PointsMaterial>(null!)

  const geometry = useMemo(() => {
    const count = compact ? 320 : 700
    const positions = new Float32Array(count * 3)
    // Deterministic pseudo-random (seeded) so SSR/dev double-mounts agree.
    let seed = 42
    const rand = (): number => {
      seed = (seed * 1664525 + 1013904223) % 4294967296
      return seed / 4294967296
    }
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (rand() - 0.5) * 30
      positions[i * 3 + 1] = rand() * 7.5
      positions[i * 3 + 2] = -9 + rand() * 18
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [compact])

  useEffect(() => {
    const g = geometry
    return () => g.dispose()
  }, [geometry])

  useFrame((state, rawDt) => {
    if (!points.current || reducedMotion) return
    const dt = Math.min(rawDt, 0.05)
    const t = state.clock.elapsedTime
    points.current.rotation.y += dt * 0.006
    points.current.position.y = Math.sin(t * 0.05) * 0.25
    if (mat.current) {
      // The air thickens slightly as the journey descends to contact.
      const target = 0.26 + (scrollState.float / 6) * 0.14
      mat.current.opacity += (target - mat.current.opacity) * Math.min(1, dt)
    }
  })

  return (
    <points ref={points} frustumCulled={false}>
      <primitive object={geometry} attach="geometry" />
      <pointsMaterial
        ref={mat}
        size={0.045}
        color="#8e8e93"
        transparent
        opacity={0.28}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}
