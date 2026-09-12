import { useRef } from 'react'
import { Grid } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { sampleMood } from '../../lib/camera'
import type { SampledMood } from '../../lib/camera'
import { scrollState } from '../../lib/scroll'
import { useCurioStore } from '../../store/useCurioStore'
import { usePrefersReducedMotion } from '../../hooks/useCurio'

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
    keyIntensity: 1.0,
    rimIntensity: 0.45,
    ambientIntensity: 0.85,
    keyColor: new THREE.Color('#ffffff'),
  })

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const f = reducedMotion ? Math.round(scrollState.float) : scrollState.float
    sampleMood(f, mood.current)
    const m = mood.current
    const k = reducedMotion ? 1 : Math.min(1, dt * 2.5)
    if (!ambient.current || !key.current || !rim.current) return
    ambient.current.intensity += (m.ambientIntensity - ambient.current.intensity) * k
    key.current.intensity += (m.keyIntensity - key.current.intensity) * k
    key.current.color.lerp(m.keyColor, k)
    rim.current.intensity += (m.rimIntensity - rim.current.intensity) * k
    if (!reducedMotion && sweep.current) sweep.current.rotation.y += dt * 0.1
  })

  return (
    <group>
      <ambientLight ref={ambient} intensity={0.85} color="#ffffff" />
      <directionalLight ref={key} position={[4.5, 7, 3.5]} intensity={1.0} color="#ffffff" />
      <directionalLight ref={rim} position={[-6, 3.5, -4.5]} intensity={0.45} color="#d6dcf0" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.19, 0]}>
        <circleGeometry args={[14, 64]} />
        <meshStandardMaterial color="#101014" roughness={0.96} metalness={0} />
      </mesh>

      <Grid
        position={[0, -0.18, 0]}
        args={[26, 26]}
        cellSize={compact ? 1.2 : 0.7}
        cellThickness={0.6}
        cellColor="#232329"
        sectionSize={3.5}
        sectionThickness={1}
        sectionColor="#34343e"
        fadeDistance={26}
        fadeStrength={2.4}
        followCamera={false}
        infiniteGrid
      />

      {/* Vermilion moon + halo: the nocturne backdrop. fog:false keeps
          it burning through the haze. Static — the journey moves, it waits. */}
      <mesh position={[7, 8.5, -25]}>
        <circleGeometry args={[6.5, 48]} />
        <meshBasicMaterial color="#4a130d" transparent opacity={0.5} fog={false} toneMapped={false} />
      </mesh>
      <mesh position={[7, 8.5, -24.8]}>
        <circleGeometry args={[4.1, 48]} />
        <meshBasicMaterial color="#8e2318" fog={false} toneMapped={false} />
      </mesh>

      {/* Range ring at the installation edge */}
      <mesh position={[0, -0.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[11.5, 0.01, 6, 128]} />
        <meshBasicMaterial color="#2a2a32" toneMapped={false} />
      </mesh>

      {/* Radar arm */}
      <group ref={sweep} position={[0, -0.16, 0]}>
        <mesh position={[5.75, 0, 0]}>
          <boxGeometry args={[11.5, 0.004, 0.035]} />
          <meshBasicMaterial color="#6e6a62" transparent opacity={0.14} toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}
