import { Grid } from '@react-three/drei'
import { useCurioStore } from '../../store/useCurioStore.ts'

/**
 * Minimal spatial environment: restrained lighting for depth/hierarchy,
 * one technical floor grid, one origin marker. No particles, no bloom,
 * no decoration. Shadow maps are intentionally OFF — each node carries a
 * cheap fake contact disc instead (see CurioNode).
 */
export function EnvironmentSetup() {
  const compact = useCurioStore((s) => s.compact)

  return (
    <group>
      {/* Base + key + rim: depth first, decoration never. */}
      <ambientLight intensity={0.5} color="#dfe2ea" />
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
    </group>
  )
}
