import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { NODES } from '../../data/nodes.ts'
import { useCurioStore } from '../../store/useCurioStore.ts'

const HUB_ID = 'identity'
const LINK_BASE = new THREE.Color('#4a4a55')
const LINK_HOT = new THREE.Color('#ff4d00')

interface Spoke {
  id: string
  line: THREE.Line
  material: THREE.LineBasicMaterial
}

/**
 * Constellation web: faint survey lines from the identity hub to every
 * node. Idle they read as structure; on focus the active spoke ignites
 * while the rest recede — spatial context without hiding anything.
 * Sixteen lines, one shared frame loop, zero allocations per frame.
 *
 * (Built imperatively: `<line>` collides with the SVG intrinsic in
 * React 19's JSX types, so `primitive` carries the THREE.Line objects.)
 */
export function NodeLinks() {
  const spokes = useMemo<Spoke[]>(() => {
    const hub = NODES.find((n) => n.id === HUB_ID)
    if (!hub) return []
    const from = new THREE.Vector3(...hub.position)
    return NODES.filter((n) => n.id !== HUB_ID).map((n) => {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        from,
        new THREE.Vector3(...n.position),
      ])
      const material = new THREE.LineBasicMaterial({
        color: LINK_BASE.clone(),
        transparent: true,
        opacity: 0.1,
        toneMapped: false,
      })
      return { id: n.id, line: new THREE.Line(geometry, material), material }
    })
  }, [])

  useEffect(() => {
    const list = spokes
    return () => {
      for (const s of list) {
        s.line.geometry.dispose()
        s.material.dispose()
      }
    }
  }, [spokes])

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const k = 1 - Math.exp(-5 * dt)
    const active = useCurioStore.getState().activeNodeId
    for (const s of spokes) {
      const hot = active !== null && (active === s.id || active === HUB_ID)
      const targetOpacity = active === null ? 0.1 : hot ? 0.65 : 0.035
      s.material.opacity += (targetOpacity - s.material.opacity) * k
      s.material.color.lerp(hot ? LINK_HOT : LINK_BASE, k)
    }
  })

  return (
    <group>
      {spokes.map((s) => (
        <primitive key={s.id} object={s.line} />
      ))}
    </group>
  )
}
