import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { isWebGLAvailable } from '../../lib/platform.ts'
import { useCurioStore } from '../../store/useCurioStore.ts'
import { WebGLFallback } from '../ui/WebGLFallback.tsx'
import { CanvasErrorBoundary } from './CanvasErrorBoundary.tsx'
import { Scene } from './Scene.tsx'

/**
 * CurioCanvas — the 3D layer. Owns renderer, background and fog.
 * Scroll drives the journey; artifact clicks navigate explicitly with
 * stopPropagation. All DOM lives outside.
 */
export function CurioCanvas() {
  const compact = useCurioStore((s) => s.compact)
  const webgl = useMemo(() => isWebGLAvailable(), [])

  if (!webgl) return <WebGLFallback reason="unavailable" />

  return (
    <div className="curio-canvas-wrap" aria-hidden={false}>
      <CanvasErrorBoundary>
        <Canvas
          dpr={compact ? [1, 1.5] : [1, 1.75]}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
            stencil: false,
          }}
          camera={{
            position: [0, 3.6, 12.0],
            fov: compact ? 46 : 38,
            near: 0.1,
            far: 70,
          }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping
            gl.toneMappingExposure = 1.1
          }}
          aria-label="Curio 3D journey. Scroll to travel; use the rail or index for keyboard access."
        >
          <color attach="background" args={['#0a0a0b']} />
          <fog attach="fog" args={['#0a0a0b', 14, 30]} />
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
        <div className="curio-vignette" aria-hidden="true" />
      </CanvasErrorBoundary>
    </div>
  )
}
