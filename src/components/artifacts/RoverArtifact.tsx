import { useRef } from 'react'
import type { ReactNode } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { PROJECT_SLOT, slotProximity } from '../../data/sections.ts'
import { scrollState } from '../../lib/scroll.ts'
import { useCurioStore } from '../../store/useCurioStore.ts'
import { usePrefersReducedMotion } from '../../hooks/useCurio.ts'

/**
 * VoltEdge artifact: a believable competition rover — dual-layer chassis,
 * four rolling wheels, sensor mast whose head subtly tracks the visitor,
 * rear aero wing, faint underglow that breathes with section proximity.
 * Clicking travels to the VOLTEDGE stop.
 */
export function RoverArtifact() {
  const reducedMotion = usePrefersReducedMotion()
  const pointer = useThree((s) => s.pointer)
  const wheels = useRef<(THREE.Group | null)[]>([])
  const head = useRef<THREE.Group>(null!)
  const glowMat = useRef<THREE.MeshBasicMaterial>(null!)
  const lensMat = useRef<THREE.MeshBasicMaterial>(null!)

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const t = state.clock.elapsedTime
    const prox = slotProximity(scrollState.float, PROJECT_SLOT.voltedge)

    if (!reducedMotion) {
      const speed = 0.5 + prox * 1.6
      for (const w of wheels.current) {
        if (w) w.rotation.x += dt * speed
      }
      // Sensor head tracks the visitor when this bay is live.
      const targetYaw = prox > 0.35 ? pointer.x * 0.65 : 0
      head.current.rotation.y += (targetYaw - head.current.rotation.y) * Math.min(1, dt * 3)
    }
    if (glowMat.current) glowMat.current.opacity = 0.05 + prox * 0.2
    if (lensMat.current && !reducedMotion) {
      lensMat.current.opacity = 0.65 + Math.sin(t * 2.2) * 0.2 + prox * 0.15
    }
  })

  const handleSelect = (e: ThreeEvent<MouseEvent>): void => {
    e.stopPropagation()
    useCurioStore.getState().goToSection(3)
  }

  const wheelAt = (x: number, z: number, i: number): ReactNode => (
    <group key={`${x}:${z}`} position={[x, 0.28, z]} ref={(g) => { wheels.current[i] = g }}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.28, 0.28, 0.2, 20]} />
        <meshStandardMaterial color="#101013" roughness={0.85} metalness={0.2} />
      </mesh>
      <mesh position={[x > 0 ? 0.11 : -0.11, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.02, 12]} />
        <meshStandardMaterial color="#3a3a44" roughness={0.4} metalness={0.8} />
      </mesh>
    </group>
  )

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
      {/* Dual-layer chassis */}
      <mesh position={[0, 0.52, 0]}>
        <boxGeometry args={[1.5, 0.22, 1.0]} />
        <meshStandardMaterial color="#1c1c22" roughness={0.5} metalness={0.65} />
      </mesh>
      <mesh position={[0, 0.68, 0]}>
        <boxGeometry args={[1.15, 0.08, 0.78]} />
        <meshStandardMaterial color="#232329" roughness={0.45} metalness={0.7} />
      </mesh>
      {/* HEXA hub block */}
      <mesh position={[0, 0.78, -0.1]}>
        <boxGeometry args={[0.4, 0.12, 0.3]} />
        <meshStandardMaterial color="#0e3a2a" roughness={0.5} metalness={0.3} />
      </mesh>
      {wheelAt(-0.68, 0.42, 0)}
      {wheelAt(0.68, 0.42, 1)}
      {wheelAt(-0.68, -0.42, 2)}
      {wheelAt(0.68, -0.42, 3)}

      {/* Sensor mast + tracking head */}
      <mesh position={[0, 1.05, -0.25]}>
        <cylinderGeometry args={[0.045, 0.06, 0.7, 10]} />
        <meshStandardMaterial color="#2a2a32" roughness={0.4} metalness={0.8} />
      </mesh>
      <group ref={head} position={[0, 1.44, -0.25]}>
        <mesh>
          <boxGeometry args={[0.36, 0.2, 0.24]} />
          <meshStandardMaterial color="#1c1c22" roughness={0.45} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0, 0.13]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshBasicMaterial ref={lensMat} color="#ff4d00" transparent opacity={0.7} toneMapped={false} />
        </mesh>
      </group>

      {/* Rear aero wing */}
      <mesh position={[0, 1.0, -0.62]} rotation={[0.35, 0, 0]}>
        <boxGeometry args={[1.3, 0.035, 0.3]} />
        <meshStandardMaterial color="#232329" roughness={0.4} metalness={0.75} />
      </mesh>
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} position={[x, 0.82, -0.58]}>
          <boxGeometry args={[0.04, 0.32, 0.04]} />
          <meshStandardMaterial color="#2a2a32" roughness={0.4} metalness={0.8} />
        </mesh>
      ))}

      {/* Underglow */}
      <mesh position={[0, 0.075, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.7, 1.2]} />
        <meshBasicMaterial ref={glowMat} color="#ff4d00" transparent opacity={0.05} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}
