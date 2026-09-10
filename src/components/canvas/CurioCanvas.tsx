import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { OVERVIEW_POSITION } from '../../data/nodes.ts'
import { isWebGLAvailable } from '../../lib/platform.ts'
import { useCurioStore } from '../../store/useCurioStore.ts'
import { WebGLFallback } from '../ui/WebGLFallback.tsx'
import { CanvasErrorBoundary } from './CanvasErrorBoundary.tsx'
import { SceneRoot } from './SceneRoot.tsx'

/**
 * CurioCanvas — the 3D layer. Owns renderer, background, fog and the
 * background-deselect contract (onPointerMissed). All DOM lives outside.
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
            position: [...OVERVIEW_POSITION],
            fov: compact ? 48 : 40,
            near: 0.1,
            far: 60,
          }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping
            gl.toneMappingExposure = 1.05
          }}
          // Background click (missed every mesh) deselects. Node presses
          // stopPropagation, so they can never trigger this path.
          onPointerMissed={(event) => {
            if (event.button !== 0) return
            useCurioStore.getState().clearSelection()
          }}
          aria-label="Curio 3D scene. Use the index buttons above for keyboard access."
        >
          <color attach="background" args={['#0a0a0b']} />
          <fog attach="fog" args={['#0a0a0b', 11, 27]} />
          <Suspense fallback={null}>
            <SceneRoot />
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  )
}
