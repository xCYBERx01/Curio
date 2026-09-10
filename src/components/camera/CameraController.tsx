import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { sampleCameraPose } from '../../lib/camera'
import type { CameraPose } from '../../store/useCurioStore'
import { useCurioStore } from '../../store/useCurioStore'
import { scrollState } from '../../lib/scroll'
import { usePrefersReducedMotion } from '../../hooks/useCurio'

/**
 * The SOLE owner of the camera. Scroll progress is the single driver:
 * poses are sampled continuously and damped toward — interruptions are
 * impossible by construction (there is nothing to interrupt, only scroll).
 * Reduced motion steps discretely between stops instead of gliding.
 */
export function CameraController() {
  const camera = useThree((s) => s.camera)
  const compact = useCurioStore((s) => s.compact)
  const reducedMotion = usePrefersReducedMotion()

  const look = useMemo(() => new THREE.Vector3(0, 1.9, -1.5), [])
  const target = useMemo<CameraPose>(
    () => ({ position: [0, 3.6, 12.0], lookAt: [0, 1.9, -1.5] }),
    [],
  )
  const placed = useRef(false)
  const lastStop = useRef(-1)

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)

    if (reducedMotion) {
      const stop = Math.round(scrollState.float)
      if (stop !== lastStop.current || !placed.current) {
        lastStop.current = stop
        placed.current = true
        sampleCameraPose(stop, compact, true, target)
        camera.position.set(...target.position)
        look.set(...target.lookAt)
      }
      camera.lookAt(look)
      return
    }

    sampleCameraPose(scrollState.float, compact, false, target)
    if (!placed.current) {
      placed.current = true
      camera.position.set(...target.position)
      look.set(...target.lookAt)
      camera.lookAt(look)
      return
    }

    const lambda = 3.4
    camera.position.x = THREE.MathUtils.damp(camera.position.x, target.position[0], lambda, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, target.position[1], lambda, dt)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, target.position[2], lambda, dt)
    look.x = THREE.MathUtils.damp(look.x, target.lookAt[0], lambda, dt)
    look.y = THREE.MathUtils.damp(look.y, target.lookAt[1], lambda, dt)
    look.z = THREE.MathUtils.damp(look.z, target.lookAt[2], lambda, dt)
    camera.lookAt(look)
  })

  return null
}
