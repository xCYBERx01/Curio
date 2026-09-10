import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { PROJECT_SLOT, SECTION_MAP, slotProximity } from '../../data/sections'
import { scrollState } from '../../lib/scroll'
import { useCurioStore } from '../../store/useCurioStore'
import { usePrefersReducedMotion } from '../../hooks/useCurio'
import { ArtifactModel } from './ArtifactModel'

const L1 = 0.62
const L2 = 0.55
const SHOULDER_Y = 0.44

/**
 * 5-DOF-style articulated arm: base yaw + shoulder/elbow analytic IK that
 * subtly tracks the visitor, wrist + gripper that open as the bay goes
 * live. Clicking the arm when already focused triggers one wave cycle —
 * the single memorable interaction. Otherwise click travels to the ARM stop.
 */
export function RobotArm({ bare = false }: { bare?: boolean }) {
  const reducedMotion = usePrefersReducedMotion()
  const pointer = useThree((s) => s.pointer)

  const yaw = useRef<THREE.Group>(null!)
  const shoulder = useRef<THREE.Group>(null!)
  const elbow = useRef<THREE.Group>(null!)
  const fingerL = useRef<THREE.Mesh>(null!)
  const fingerR = useRef<THREE.Mesh>(null!)
  const glowMat = useRef<THREE.MeshBasicMaterial>(null!)

  const waveT = useRef(1)

  useFrame((_state, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const f = scrollState.float
    const prox = slotProximity(f, PROJECT_SLOT.arm)

    let targetYaw = 0.25
    let targetShoulder = 0.55
    let targetElbow = -1.05
    let grip = 0.05

    if (!reducedMotion) {
      // Subtle visitor tracking: yaw follows azimuth, pitch solves a
      // clamped 2-bone IK in the facing plane. Heavily damped — alive,
      // never twitchy.
      const tx = pointer.x * 2.4
      const ty = 1.45 + pointer.y * 0.85
      targetYaw = THREE.MathUtils.clamp(Math.atan2(tx, 2.2), -0.75, 0.75)
      const dx = 1.15
      const dy = THREE.MathUtils.clamp(ty - SHOULDER_Y, -0.2, 1.1)
      const reach = Math.min(L1 + L2 - 0.06, Math.max(0.4, Math.hypot(dx, dy)))
      const cosElbow = THREE.MathUtils.clamp((reach * reach - L1 * L1 - L2 * L2) / (2 * L1 * L2), -1, 1)
      targetElbow = -Math.acos(cosElbow)
      const a1 = Math.atan2(dx, dy)
      const cosA2 = THREE.MathUtils.clamp((L1 * L1 + reach * reach - L2 * L2) / (2 * L1 * reach), -1, 1)
      targetShoulder = THREE.MathUtils.clamp(a1 + Math.acos(cosA2) - 0.35, -0.2, 1.2)
      grip = 0.04 + prox * 0.1
    }

    // One-shot wave cycle on click.
    if (waveT.current < 1) {
      waveT.current = Math.min(1, waveT.current + dt / 1.3)
      const w = Math.sin(waveT.current * Math.PI * 2) * (1 - waveT.current)
      targetElbow += w * 0.55
      targetShoulder += w * 0.25
      grip += Math.sin(waveT.current * Math.PI) * 0.08
    }

    const k = Math.min(1, dt * 3.2)
    if (yaw.current) yaw.current.rotation.y += (targetYaw - yaw.current.rotation.y) * k
    if (shoulder.current) {
      shoulder.current.rotation.x += (targetShoulder - shoulder.current.rotation.x) * k
    }
    if (elbow.current) elbow.current.rotation.x += (targetElbow - elbow.current.rotation.x) * k

    const fingerGap = 0.045 + grip
    if (fingerL.current) fingerL.current.position.x = -fingerGap
    if (fingerR.current) fingerR.current.position.x = fingerGap
    if (glowMat.current) glowMat.current.opacity = 0.04 + prox * 0.16
  })

  const handleSelect = (e: ThreeEvent<MouseEvent>): void => {
    e.stopPropagation()
    const st = useCurioStore.getState()
    if (Math.round(scrollState.float) === SECTION_MAP.arm.stop) {
      if (waveT.current >= 1) waveT.current = 0
    } else {
      st.goToSection(SECTION_MAP.arm.stop)
    }
  }

  const metal = { roughness: 0.38, metalness: 0.8 } as const

  return (
    <group
      onPointerDown={(e) => e.stopPropagation()}
      onClick={handleSelect}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = ''
      }}
    >
      {/* Pedestal + turret (skipped when nested in a showcase with its own) */}
      {!bare && (
        <mesh position={[0, 0.09, 0]}>
          <cylinderGeometry args={[0.32, 0.38, 0.18, 24]} />
          <meshStandardMaterial color="#141417" roughness={0.6} metalness={0.4} />
        </mesh>
      )}
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.22, 0.26, 0.22, 24]} />
        <meshStandardMaterial color="#1c1c22" {...metal} />
      </mesh>

      <group ref={yaw} position={[0, SHOULDER_Y - 0.14, 0]}>
        {/* Shoulder */}
        <mesh>
          <sphereGeometry args={[0.15, 20, 20]} />
          <meshStandardMaterial color="#232329" {...metal} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.15, 0.022, 8, 32]} />
          <meshBasicMaterial color="#0071e3" toneMapped={false} />
        </mesh>

        <group ref={shoulder} position={[0, 0.02, 0]}>
          <mesh position={[0, L1 / 2, 0]}>
            <boxGeometry args={[0.15, L1, 0.15]} />
            <meshStandardMaterial color="#232329" {...metal} />
          </mesh>

          {/* Elbow */}
          <group ref={elbow} position={[0, L1, 0]}>
            <mesh>
              <sphereGeometry args={[0.12, 20, 20]} />
              <meshStandardMaterial color="#232329" {...metal} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.12, 0.018, 8, 32]} />
              <meshBasicMaterial color="#0071e3" toneMapped={false} />
            </mesh>
            <mesh position={[0, L2 / 2, 0]}>
              <boxGeometry args={[0.12, L2, 0.12]} />
              <meshStandardMaterial color="#2a2a32" {...metal} />
            </mesh>
            {/* Wrist + gripper */}
            <mesh position={[0, L2 + 0.04, 0]}>
              <boxGeometry args={[0.14, 0.1, 0.14]} />
              <meshStandardMaterial color="#1c1c22" {...metal} />
            </mesh>
            <mesh ref={fingerL} position={[-0.09, L2 + 0.16, 0]}>
              <boxGeometry args={[0.045, 0.2, 0.06]} />
              <meshStandardMaterial color="#8e8e93" roughness={0.3} metalness={0.9} />
            </mesh>
            <mesh ref={fingerR} position={[0.09, L2 + 0.16, 0]}>
              <boxGeometry args={[0.045, 0.2, 0.06]} />
              <meshStandardMaterial color="#8e8e93" roughness={0.3} metalness={0.9} />
            </mesh>
          </group>
        </group>
      </group>

      {/* Bay glow (showcase provides its own when nested) */}
      {!bare && (
        <mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.85, 40]} />
          <meshBasicMaterial ref={glowMat} color="#0071e3" transparent opacity={0.04} depthWrite={false} toneMapped={false} />
        </mesh>
      )}
    </group>
  )
}

/**
 * Arm bay: real GLB showcase when `assetUrl` is set (slow turntable
 * flourish + bay glow + click-to-travel), procedural interactive arm
 * as the fallback. A broken/missing GLB never empties the bay.
 */
export function ArmShowcase({ assetUrl = null }: { assetUrl?: string | null }) {
  const reducedMotion = usePrefersReducedMotion()
  const spinner = useRef<THREE.Group>(null!)
  const glowMat = useRef<THREE.MeshBasicMaterial>(null!)

  useFrame((_state, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    if (!reducedMotion && spinner.current) spinner.current.rotation.y += dt * 0.35
    const prox = slotProximity(scrollState.float, PROJECT_SLOT.arm)
    if (glowMat.current) glowMat.current.opacity = 0.04 + prox * 0.16
  })

  return (
    <group
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation()
        useCurioStore.getState().goToSection(SECTION_MAP.arm.stop)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = ''
      }}
    >
      {/* Pedestal shared by both paths */}
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.34, 0.4, 0.18, 24]} />
        <meshStandardMaterial color="#141417" roughness={0.6} metalness={0.4} />
      </mesh>
      <group ref={spinner} position={[0, 0.18, 0]}>
        <ArtifactModel url={assetUrl} fallback={<RobotArm bare />} fitHeight={1.6} />
      </group>
      <mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.95, 40]} />
        <meshBasicMaterial ref={glowMat} color="#0071e3" transparent opacity={0.04} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}
