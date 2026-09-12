import { useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SECTION_MAP, TURNTABLE_RADIUS, stageAngleFor } from '../../data/sections'
import type { SectionId } from '../../data/sections'
import { scrollState } from '../../lib/scroll'
import { usePrefersReducedMotion } from '../../hooks/useCurio'
import { BayPlate } from './BayPlate'
import { CrocDevice } from './CrocDevice'
import { RoverShowcase } from './RoverArtifact'
import { ArmShowcase } from './RobotArm'

const SLOT_ANGLE = (Math.PI * 2) / 3

/**
 * The carousel: one stone dais, three artifact bays at 120°. Scroll
 * rotates the dais so the active project swings front-center — directly
 * set from scroll progress (no tweens, no lag, no competing drivers).
 * Reduced motion steps between stops.
 */
export function TurntableStage() {
  const wheel = useRef<THREE.Group>(null!)
  const reducedMotion = usePrefersReducedMotion()

  useFrame(() => {
    if (!wheel.current) return
    const f = reducedMotion ? Math.round(scrollState.float) : scrollState.float
    wheel.current.rotation.y = stageAngleFor(f)
  })

  const bays: { id: SectionId; slot: number; content: ReactNode }[] = [
    { id: 'croc', slot: 0, content: <CrocDevice assetUrl={SECTION_MAP.croc.assetUrl ?? null} /> },
    { id: 'voltedge', slot: 1, content: <RoverShowcase assetUrl={SECTION_MAP.voltedge.assetUrl ?? null} /> },
    { id: 'arm', slot: 2, content: <ArmShowcase assetUrl={SECTION_MAP.arm.assetUrl ?? null} /> },
  ]
  const slots = useMemo(
    () =>
      bays.map((b) => {
        const spec = SECTION_MAP[b.id]
        const [index, ...rest] = spec.kicker.split('—')
        return {
          angle: b.slot * SLOT_ANGLE,
          content: (
            <>
              {b.content}
              <BayPlate
                slot={b.slot}
                index={index.trim()}
                title={spec.title}
                sub={rest.join('—').trim()}
              />
            </>
          ),
        }
      }),
    [],
  )

  return (
    <group>
      {/* Dais */}
      <mesh position={[0, -0.06, 0]}>
        <cylinderGeometry args={[5.4, 5.55, 0.24, 72]} />
        <meshStandardMaterial color="#141418" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Rim tick marks: twelve survey ticks. */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[Math.sin(a) * 5.15, 0.065, Math.cos(a) * 5.15]}
            rotation={[0, a, 0]}
          >
            <boxGeometry args={[0.05, 0.012, i % 3 === 0 ? 0.34 : 0.18]} />
            <meshBasicMaterial color={i % 3 === 0 ? '#3a3a44' : '#26262c'} toneMapped={false} />
          </mesh>
        )
      })}

      {/* Rotating wheel */}
      <group ref={wheel}>
        {slots.map((s) => (
          <group
            key={s.angle}
            position={[Math.sin(s.angle) * TURNTABLE_RADIUS, 0.06, Math.cos(s.angle) * TURNTABLE_RADIUS]}
            rotation={[0, s.angle, 0]}
          >
            {s.content}
          </group>
        ))}
        {/* Spoke inlays from hub to each bay */}
        {[0, SLOT_ANGLE, SLOT_ANGLE * 2].map((a) => (
          <mesh key={a} position={[Math.sin(a) * 1.7, 0.065, Math.cos(a) * 1.7]} rotation={[0, a, 0]}>
            <boxGeometry args={[0.03, 0.008, 3.4]} />
            <meshBasicMaterial color="#1e1e24" toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
