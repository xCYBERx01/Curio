import { useRef } from 'react'
import { Grid } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCurioStore } from '../../store/useCurioStore.ts'
import { usePrefersReducedMotion } from '../../hooks/useCurio.ts'

/**
 * Living spatial environment: breathing key light, a slow radar sweep
 * arm, range tick ring, technical floor grid, origin marker. No
 * particles, no bloom, no decoration — every moving element reads as
 * instrumentation. Shadow maps stay OFF (nodes carry fake contact discs).
 */
export function EnvironmentSetup() {
  const compact = useCurioStore((s) => s.compact)
  const reducedMotion = usePrefersReducedMotion()
  const sweep = useRef<THREE.Group>(null!)
  const ambient = useRef<THREE.AmbientLight>(null!)

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const t = state.clock.elapsedTime
    if (!reducedMotion) {
      sweep.current.rotation.y += dt * 0.12
      const target = 0.5 + Math.sin(t * 0.6) * 0.05
      ambient.current.intensity += (target - ambient.current.intensity) * Math.min(1, dt * 2)
    }
  })

  return (
    <group>
      {/* Base + key + rim: depth first, decoration never. */}
      <ambientLight ref={ambient} intensity={0.5} color="#dfe2ea" />
      <directionalLight position={[4.5, 7, 3.5]} intensity={1.35} color="#f4f1e8" />
      <directionalLight position={[-6, 3.5, -4.5]} intensity={0.35} color="#b9c4d6" />

      {/* Floor: near-black disc so the grid has something to sit on. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[11, 64]} />
        <meshStandardMaterial color="#0c0c0e" roughness={0.96} metalness={0} />
      </mesh>

      {/* Technical grid — the only "marking" layer. Simplified on compact. */}
      <Grid
        position={[0, 0, 0]}
        args={[22, 22]}
        cellSize={compact ? 1.2 : 0.6}
        cellThickness={0.6}
        cellColor="#1b1b21"
        sectionSize={3}
        sectionThickness={1}
        sectionColor="#2b2b34"
        fadeDistance={19}
        fadeStrength={2.2}
        followCamera={false}
        infiniteGrid
      />

      {/* Origin marker: two hairline strips crossing at world origin. */}
      <group position={[0, 0.005, 0]}>
        <mesh position={[0, 0, -0.9]}>
          <planeGeometry args={[0.02, 2.4]} />
          <meshBasicMaterial color="#3a3a44" toneMapped={false} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
          <planeGeometry args={[2.4, 0.02]} />
          <meshBasicMaterial color="#3a3a44" toneMapped={false} />
        </mesh>
      </group>

      {/* Range tick ring: quiet circular fence at the scene edge. */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[9.6, 0.008, 6, 128]} />
        <meshBasicMaterial color="#232329" toneMapped={false} />
      </mesh>

      {/* Radar sweep: one slow arm rotating about the origin. */}
      <group ref={sweep} position={[0, 0.012, 0]}>
        <mesh position={[4.8, 0, 0]}>
          <boxGeometry args={[9.6, 0.004, 0.035]} />
          <meshBasicMaterial color="#8f8f9c" transparent opacity={0.16} toneMapped={false} />
        </mesh>
        <mesh position={[9.6, 0, 0]}>
          <sphereGeometry args={[0.045, 10, 10]} />
          <meshBasicMaterial color="#8f8f9c" transparent opacity={0.5} toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}
