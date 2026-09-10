import { useRef } from 'react'
import { Grid } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { sampleMood } from '../../lib/camera.ts'
import type { SampledMood } from '../../lib/camera.ts'
import { scrollState } from '../../lib/scroll.ts'
import { useCurioStore } from '../../store/useCurioStore.ts'
import { usePrefersReducedMotion } from '../../hooks/useCurio.ts'

/**
 * Laboratory void: floor, faint technical grid, range ring, one slow
 * radar arm. Lighting mood (key/rim/ambient) is scroll-driven — warm at
 * the workbench, cool at the arm bay, dim at the edges of the journey.
 * No particles, no bloom, no shadows (artifacts carry their own glow).
 */
export function Environment() {
  const compact = useCurioStore((s) => s.compact)
  const reducedMotion = usePrefersReducedMotion()

  const sweep = useRef<THREE.Group>(null!)
  const ambient = useRef<THREE.AmbientLight>(null!)
  const key = useRef<THREE.DirectionalLight>(null!)
  const rim = useRef<THREE.DirectionalLight>(null!)
  const mood = useRef<SampledMood>({
    keyIntensity: 1.1,
    rimIntensity: 0.5,
    ambientIntensity: 0.5,
    keyColor: new THREE.Color('#dfe4f5'),
  })

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const f = reducedMotion ? Math.round(scrollState.float) : scrollState.float
    sampleMood(f, mood.current)
    const m = mood.current
    const k = reducedMotion ? 1 : Math.min(1, dt * 2.5)
    ambient.current.intensity += (m.ambientIntensity - ambient.current.intensity) * k
    key.current.intensity += (m.keyIntensity - key.current.intensity) * k
    key.current.color.lerp(m.keyColor, k)
    rim.current.intensity += (m.rimIntensity - rim.current.intensity) * k
    if (!reducedMotion) sweep.current.rotation.y += dt * 0.1
  })

  return (
    <group>
      <ambientLight ref={ambient} intensity={0.5} color="#dfe2ea" />
      <directionalLight ref={key} position={[4.5, 7, 3.5]} intensity={1.1} color="#dfe4f5" />
      <directionalLight ref={rim} position={[-6, 3.5, -4.5]} intensity={0.5} color="#b9c4d6" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.19, 0]}>
        <circleGeometry args={[14, 64]} />
        <meshStandardMaterial color="#0e0e11" roughness={0.96} metalness={0} />
      </mesh>

      <Grid
        position={[0, -0.18, 0]}
        args={[26, 26]}
        cellSize={compact ? 1.2 : 0.7}
        cellThickness={0.6}
        cellColor="#1e1e25"
        sectionSize={3.5}
        sectionThickness={1}
        sectionColor="#30303b"
        fadeDistance={26}
        fadeStrength={2.4}
        followCamera={false}
        infiniteGrid
      />

      {/* Range ring at the installation edge */}
      <mesh position={[0, -0.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[11.5, 0.01, 6, 128]} />
        <meshBasicMaterial color="#26262d" toneMapped={false} />
      </mesh>

      {/* Radar arm */}
      <group ref={sweep} position={[0, -0.16, 0]}>
        <mesh position={[5.75, 0, 0]}>
          <boxGeometry args={[11.5, 0.004, 0.035]} />
          <meshBasicMaterial color="#8f8f9c" transparent opacity={0.13} toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}
