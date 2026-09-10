import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { isPoseSettled } from '../../lib/camera.ts'
import type { Vec3 } from '../../store/useCurioStore.ts'
import { useCurioStore } from '../../store/useCurioStore.ts'
import { usePrefersReducedMotion } from '../../hooks/useCurio.ts'

/**
 * The SOLE owner of the camera. Nothing else may set camera position,
 * rotation, or lookAt. Transitions are damped lerps from the camera's
 * *current* state toward the latest store target, so interruptions
 * (select B mid-flight to A) glide instead of snapping.
 *
 * A faint pointer parallax is applied only while settled in overview,
 * keeping focus/return poses fully deterministic.
 */
export function CameraRig() {
  const camera = useThree((s) => s.camera)
  const pointer = useThree((s) => s.pointer)
  const cameraTarget = useCurioStore((s) => s.cameraTarget)
  const cameraMode = useCurioStore((s) => s.cameraMode)
  const reducedMotion = usePrefersReducedMotion()

  const desiredPos = useMemo(() => new THREE.Vector3(...cameraTarget.position), [cameraTarget])
  const desiredLook = useMemo(() => new THREE.Vector3(...cameraTarget.lookAt), [cameraTarget])
  const look = useMemo(() => new THREE.Vector3(...cameraTarget.lookAt), [])
  const parallax = useRef(0)
  const placed = useRef(false)

  useEffect(() => {
    desiredPos.set(...cameraTarget.position)
    desiredLook.set(...cameraTarget.lookAt)
  }, [cameraTarget, desiredPos, desiredLook])

  // Snap to overview on first mount — no fly-in from the default pose.
  useEffect(() => {
    if (placed.current) return
    placed.current = true
    camera.position.copy(desiredPos)
    look.copy(desiredLook)
    camera.lookAt(look)
  }, [camera, desiredPos, desiredLook, look])

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const st = useCurioStore.getState()

    // Parallax weight eases to 0 during transitions / focus / reduced motion.
    const wantParallax = !reducedMotion && !st.isTransitioning && st.cameraMode === 'overview' ? 1 : 0
    parallax.current = THREE.MathUtils.damp(parallax.current, wantParallax, 4, dt)

    const lambda = reducedMotion ? 80 : 3.6
    const goalX = desiredPos.x + pointer.x * 0.3 * parallax.current
    const goalY = desiredPos.y + pointer.y * 0.18 * parallax.current

    camera.position.x = THREE.MathUtils.damp(camera.position.x, goalX, lambda, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, goalY, lambda, dt)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, desiredPos.z, lambda, dt)

    look.x = THREE.MathUtils.damp(look.x, desiredLook.x, lambda, dt)
    look.y = THREE.MathUtils.damp(look.y, desiredLook.y, lambda, dt)
    look.z = THREE.MathUtils.damp(look.z, desiredLook.z, lambda, dt)
    camera.lookAt(look)

    if (st.isTransitioning) {
      const settled = isPoseSettled(
        [camera.position.x, camera.position.y, camera.position.z] as Vec3,
        [look.x, look.y, look.z] as Vec3,
        st.cameraTarget,
        0.035,
      )
      if (settled) st.setTransitioning(false)
    }
  })

  // Reference cameraMode so the rig re-renders (and re-reads pose) on mode flips.
  void cameraMode
  return null
}
