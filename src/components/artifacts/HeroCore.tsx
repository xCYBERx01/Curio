import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { usePrefersReducedMotion } from '../../hooks/useCurio'

/**
 * HeroCore — the installation's anchor: a dark reactor octahedron with a
 * glowing inner core, orbited by two gyroscope rings on a survey pole.
 * Identity made physical. Pure idle motion, no interaction.
 */
export function HeroCore() {
  const core = useRef<THREE.Mesh>(null!)
  const ringA = useRef<THREE.Mesh>(null!)
  const ringB = useRef<THREE.Mesh>(null!)
  const orbit = useRef<THREE.Group>(null!)
  const glowMat = useRef<THREE.MeshBasicMaterial>(null!)
  const reducedMotion = usePrefersReducedMotion()

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    if (reducedMotion) return
    if (!core.current || !ringA.current || !ringB.current || !orbit.current) return
    const t = state.clock.elapsedTime
    core.current.rotation.y += dt * 0.22
    // Breathing mass: barely-there swell.
    const breath = 1 + Math.sin(t * 0.8) * 0.022
    core.current.scale.setScalar(breath)
    ringA.current.rotation.y -= dt * 0.3
    ringA.current.rotation.x = 0.5 + Math.sin(t * 0.24) * 0.12
    ringB.current.rotation.y += dt * 0.18
    ringB.current.rotation.z = 0.35 + Math.cos(t * 0.19) * 0.1
    orbit.current.rotation.y += dt * 0.12
    if (glowMat.current) glowMat.current.opacity = 0.75 + Math.sin(t * 1.1) * 0.15
  })

  return (
    // Sits behind the turntable (not inside it) so the pole never crosses
    // close-up bay framings — a backdrop installation, not an obstruction.
    <group position={[0, 0.06, -4.6]}>
      {/* Survey pole */}
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.09, 0.13, 2.6, 12]} />
        <meshStandardMaterial color="#1b1b21" roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.3, 0.38, 0.12, 24]} />
        <meshStandardMaterial color="#141417" roughness={0.6} metalness={0.4} />
      </mesh>

      {/* Reactor */}
      <group position={[0, 3.15, 0]}>
        <mesh ref={core}>
          <octahedronGeometry args={[0.8, 0]} />
          <meshStandardMaterial color="#232329" roughness={0.3} metalness={0.6} emissive="#1a1a20" emissiveIntensity={0.6} />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[0.3, 1]} />
          <meshBasicMaterial ref={glowMat} color="#0071e3" transparent opacity={0.8} toneMapped={false} />
        </mesh>
        <mesh ref={ringA} rotation={[0.5, 0, 0]}>
          <torusGeometry args={[1.25, 0.03, 8, 64]} />
          <meshStandardMaterial color="#8e8e93" roughness={0.35} metalness={0.85} />
        </mesh>
        <mesh ref={ringB} rotation={[0, 0, 0.35]}>
          <torusGeometry args={[1.55, 0.018, 8, 72]} />
          <meshBasicMaterial color="#c7c7cc" toneMapped={false} />
        </mesh>
        {/* Orbit ticks: eight survey satellites circling the reactor. */}
        <group ref={orbit}>
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2
            return (
              <mesh key={i} position={[Math.cos(a) * 1.95, 0, Math.sin(a) * 1.95]}>
                <octahedronGeometry args={[0.05, 0]} />
                <meshBasicMaterial color={i % 2 === 0 ? '#0071e3' : '#8e8e93'} toneMapped={false} />
              </mesh>
            )
          })}
        </group>
      </group>
    </group>
  )
}
