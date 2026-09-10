import { Component, Suspense, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import { Html, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import type { CurioNodeSpec } from '../../data/nodes.ts'
import { useCurioStore } from '../../store/useCurioStore.ts'
import { usePrefersReducedMotion } from '../../hooks/useCurio.ts'

export type NodeVisualState = 'idle' | 'hover' | 'active' | 'inactive' | 'disabled'

const ACCENT = new THREE.Color('#ff4d00')
const BASE = new THREE.Color('#17171c')
const DIM = new THREE.Color('#0e0e11')
const IDLE_EMISSIVE = new THREE.Color('#2b2b33')
const HOVER_EMISSIVE = new THREE.Color('#7a7a86')

/* ------------------------------------------------------------------ */
/* Error boundary: a broken GLB must never break the scene.            */
/* ------------------------------------------------------------------ */

interface BoundaryProps {
  fallback: ReactNode
  children: ReactNode
}

interface BoundaryState {
  failed: boolean
}

export class NodeErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false }

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: unknown): void {
    if (import.meta.env.DEV) {
      console.error('[curio] node asset failed — rendering fallback.', error)
    }
  }

  render(): ReactNode {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/* ------------------------------------------------------------------ */
/* GLTF asset layer: cached, preloaded, cloned per instance.            */
/* ------------------------------------------------------------------ */

export function preloadNodeAssets(specs: CurioNodeSpec[]): void {
  for (const s of specs) {
    if (s.assetUrl) useGLTF.preload(s.assetUrl)
  }
}

/** Cloned scene so one cached GLB can back many nodes without sharing state. */
export function AssetModel({ url }: { url: string }) {
  const gltf = useGLTF(url)
  const scene = useMemo(() => gltf.scene.clone(), [gltf])
  return <primitive object={scene} />
}

/* ------------------------------------------------------------------ */
/* Procedural fallback cores — one distinct primitive per node.         */
/* ------------------------------------------------------------------ */

function CoreGeometry({ id }: { id: string }) {
  switch (id) {
    case 'identity':
      return <octahedronGeometry args={[0.42, 0]} />
    case 'croc-os':
      return <boxGeometry args={[0.55, 0.55, 0.55]} />
    case 'voltedge':
      return <cylinderGeometry args={[0.34, 0.34, 0.62, 6]} />
    case 'arm-5dof':
      return <torusGeometry args={[0.3, 0.12, 16, 40]} />
    case 'interests':
      return <tetrahedronGeometry args={[0.52, 0]} />
    case 'contact':
    default:
      return <icosahedronGeometry args={[0.34, 0]} />
  }
}

/* ------------------------------------------------------------------ */
/* CurioNode — the single reusable interactive node abstraction.        */
/* Global selection stays in Zustand; visual/hover state stays local.   */
/* ------------------------------------------------------------------ */

export function CurioNode({ spec }: { spec: CurioNodeSpec }) {
  const active = useCurioStore((s) => s.activeNodeId === spec.id)
  const inactive = useCurioStore((s) => s.activeNodeId !== null && s.activeNodeId !== spec.id)
  const hovered = useCurioStore((s) => s.hoveredNodeId === spec.id)
  const compact = useCurioStore((s) => s.compact)
  const reducedMotion = usePrefersReducedMotion()

  const outer = useRef<THREE.Group>(null!)
  const spinner = useRef<THREE.Group>(null!)
  const coreMat = useRef<THREE.MeshStandardMaterial>(null!)
  const ringMat = useRef<THREE.MeshBasicMaterial>(null!)

  const state: NodeVisualState = spec.disabled
    ? 'disabled'
    : active
      ? 'active'
      : hovered
        ? 'hover'
        : inactive
          ? 'inactive'
          : 'idle'

  // Local offset from the core down to the floor plane (world y = 0).
  const floorY = -spec.position[1]
  const hitRadius = (compact ? 1.05 : 0.85) * spec.scale

  const handlePointerDown = (e: ThreeEvent<PointerEvent>): void => {
    // Critical: never let a node press leak to the background handler.
    e.stopPropagation()
  }

  const handleSelect = (e: ThreeEvent<MouseEvent>): void => {
    e.stopPropagation()
    if (spec.disabled) return
    useCurioStore.getState().selectNode(spec.id)
  }

  const handleOver = (e: ThreeEvent<PointerEvent>): void => {
    e.stopPropagation()
    if (spec.disabled) return
    useCurioStore.getState().setHovered(spec.id)
    document.body.style.cursor = 'pointer'
  }

  const handleOut = (): void => {
    const st = useCurioStore.getState()
    if (st.hoveredNodeId === spec.id) st.setHovered(null)
    document.body.style.cursor = ''
  }

  // Per-node animation: scale, slow rotation, emissive. No object
  // allocation here — all targets are module-level constants.
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const k = 1 - Math.exp(-6 * dt)

    const targetScale = spec.scale * (active ? 1.16 : hovered ? 1.07 : inactive ? 0.94 : 1)
    const s = THREE.MathUtils.damp(outer.current.scale.x, targetScale, 6, dt)
    outer.current.scale.setScalar(s)

    if (!reducedMotion) {
      const speed = active ? 0.5 : 0.16
      spinner.current.rotation.y += dt * speed
      if (spec.id === 'arm-5dof') spinner.current.rotation.x += dt * speed * 0.4
    }

    if (coreMat.current) {
      coreMat.current.color.lerp(inactive ? DIM : BASE, k)
      coreMat.current.emissive.lerp(active ? ACCENT : hovered ? HOVER_EMISSIVE : IDLE_EMISSIVE, k)
      const targetGlow = active ? 1.15 : hovered ? 0.7 : 0.5
      coreMat.current.emissiveIntensity = THREE.MathUtils.damp(
        coreMat.current.emissiveIntensity,
        targetGlow,
        6,
        dt,
      )
    }

    if (ringMat.current) {
      ringMat.current.color.lerp(active ? ACCENT : hovered ? HOVER_EMISSIVE : IDLE_EMISSIVE, k)
      const targetOpacity = active ? 0.95 : hovered ? 0.6 : 0.32
      ringMat.current.opacity = THREE.MathUtils.damp(ringMat.current.opacity, targetOpacity, 6, dt)
    }
  })

  const fallbackCore = (
    <mesh>
      <CoreGeometry id={spec.id} />
      <meshStandardMaterial
        ref={coreMat}
        color="#17171c"
        roughness={0.35}
        metalness={0.8}
        emissive="#2b2b33"
        emissiveIntensity={0.5}
      />
    </mesh>
  )

  return (
    <group position={spec.position}>
      {/* Scaled cluster: hit proxy, core, label. Floor furniture below
          stays unscaled so pucks and rings never lift off the floor. */}
      <group ref={outer} scale={spec.scale}>
        {/* Generous invisible hit proxy — touch friendly, never overlapping
            by construction (see validateNodeSeparation). */}
        <mesh
          onPointerDown={handlePointerDown}
          onClick={handleSelect}
          onPointerOver={handleOver}
          onPointerOut={handleOut}
        >
          <sphereGeometry args={[hitRadius, 12, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
        </mesh>

        {/* Core: GLB when provided, procedural primitive otherwise. */}
        <group ref={spinner}>
          {spec.assetUrl ? (
            <NodeErrorBoundary fallback={fallbackCore}>
              <Suspense fallback={fallbackCore}>
                <AssetModel url={spec.assetUrl} />
              </Suspense>
            </NodeErrorBoundary>
          ) : (
            fallbackCore
          )}
        </group>

        {/* Anchored micro-label. pointerEvents="none" keeps raycast clean. */}
        <Html
          position={[0, 0.95, 0]}
          center
          distanceFactor={8}
          zIndexRange={[15, 0]}
          wrapperClass="curio-node-label"
          pointerEvents="none"
        >
          <div className="curio-node-tag" data-state={state}>
            <span className="n-idx">{spec.index}</span>
            <span>{spec.label}</span>
          </div>
        </Html>
      </group>

      {/* Survey mast: thin drop-line grounding the floating core. */}
      <mesh position={[0, (floorY - 0.35) / 2, 0]}>
        <cylinderGeometry args={[0.008, 0.008, Math.max(0.1, spec.position[1] - 0.35), 6]} />
        <meshBasicMaterial color={active ? '#ff4d00' : '#33333c'} toneMapped={false} />
      </mesh>

      {/* Floor puck + selection ring. */}
      <mesh position={[0, floorY + 0.015, 0]}>
        <cylinderGeometry args={[0.13, 0.16, 0.03, 24]} />
        <meshStandardMaterial color="#141417" roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh position={[0, floorY + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.012, 8, 48]} />
        <meshBasicMaterial
          ref={ringMat}
          color="#2b2b33"
          transparent
          opacity={0.32}
          toneMapped={false}
        />
      </mesh>
      {/* Fake contact disc — no shadow maps needed. */}
      <mesh position={[0, floorY + 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.42} depthWrite={false} />
      </mesh>
    </group>
  )
}
