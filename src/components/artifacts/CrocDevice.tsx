import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { PROJECT_SLOT, SECTION_MAP, slotProximity } from '../../data/sections'
import { scrollState } from '../../lib/scroll'
import { useCurioStore } from '../../store/useCurioStore'
import { usePrefersReducedMotion } from '../../hooks/useCurio'
import { ArtifactModel } from './ArtifactModel'

const FACE_W = 256
const FACE_H = 128

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/**
 * CROC OS artifact: dark PCB, copper touch pads, and a live OLED running
 * a miniature of the real firmware face engine — blinking pill eyes,
 * wandering pupils, cycling expressions, boot splash. The screen wakes
 * as the camera approaches (scroll-driven brightness + flicker).
 * Clicking the device travels to the CROC OS stop.
 */
export function CrocDevice({ assetUrl = null }: { assetUrl?: string | null }) {
  const reducedMotion = usePrefersReducedMotion()
  const screenMat = useRef<THREE.MeshBasicMaterial>(null!)
  const glowMat = useRef<THREE.MeshBasicMaterial>(null!)
  const wake = useRef(0)

  // Face-engine state (mirrors the ESP32 firmware's timers).
  const face = useRef({
    blinking: false,
    blinkStart: 0,
    nextBlink: 2.5,
    lookX: 0,
    lookY: 0,
    lookTX: 0,
    lookTY: 0,
    nextLook: 1,
    expr: 0,
    nextExpr: 6,
    acc: 0,
  })

  const pointer = useThree((s) => s.pointer)

  const { texture, ctx } = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = FACE_W
    c.height = FACE_H
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.minFilter = THREE.LinearFilter
    tex.magFilter = THREE.LinearFilter
    return { canvas: c, texture: tex, ctx: c.getContext('2d') }
  }, [])

  useEffect(() => {
    if (!ctx && import.meta.env.DEV) console.warn('[curio] OLED 2d context unavailable.')
    return () => texture.dispose()
  }, [texture, ctx])

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const t = state.clock.elapsedTime
    const f = scrollState.float

    // Wake: dim ember → standby → fully awake as the journey approaches.
    const target = f >= 2.35 ? 1 : f >= 1.35 ? 0.45 : 0.08
    wake.current += (target - wake.current) * Math.min(1, dt * 3)
    const w = wake.current
    if (screenMat.current) {
      const flicker = w > 0.05 && w < 0.97 && !reducedMotion ? Math.random() * 0.12 : 0
      screenMat.current.color.setScalar(0.1 + 0.9 * w - flicker)
    }
    const prox = slotProximity(f, PROJECT_SLOT.croc)
    if (glowMat.current) glowMat.current.opacity = 0.05 + prox * 0.22

    // Face engine at ~14fps.
    const fs = face.current
    fs.acc += dt
    if (fs.acc < 0.07) return
    fs.acc = 0

    if (!reducedMotion) {
      if (!fs.blinking && t >= fs.nextBlink) {
        fs.blinking = true
        fs.blinkStart = t
      }
      if (fs.blinking && t - fs.blinkStart > 0.14) {
        fs.blinking = false
        fs.nextBlink = t + 2.2 + Math.random() * 3
      }
      if (t >= fs.nextLook) {
        fs.lookTX = (Math.random() - 0.5) * 18 + pointer.x * 8
        fs.lookTY = (Math.random() - 0.5) * 8 + pointer.y * 5
        fs.nextLook = t + 1.4 + Math.random() * 2.2
      }
      if (t >= fs.nextExpr) {
        fs.expr = (fs.expr + 1) % 3
        fs.nextExpr = t + 7 + Math.random() * 4
      }
    }
    fs.lookX += (fs.lookTX - fs.lookX) * 0.2
    fs.lookY += (fs.lookTY - fs.lookY) * 0.2

    const ctx2d = ctx
    if (!ctx2d) return
    ctx2d.fillStyle = '#000'
    ctx2d.fillRect(0, 0, FACE_W, FACE_H)

    if (w < 0.35) {
      // Boot splash — mirrors the real firmware greeting.
      ctx2d.fillStyle = '#fff'
      ctx2d.font = '16px monospace'
      ctx2d.textAlign = 'center'
      if (Math.floor(t * 2) % 2 === 0) ctx2d.fillText('CROC v0.5.3', FACE_W / 2, FACE_H / 2 + 6)
    } else {
      const eyeY = 30
      const eyeW = 66
      const eyeH = 42
      const lx = 32
      const rx = 158
      ctx2d.fillStyle = '#fff'
      if (fs.blinking) {
        ctx2d.fillRect(lx, eyeY + 18, eyeW, 5)
        ctx2d.fillRect(rx, eyeY + 18, eyeW, 5)
      } else {
        roundedRect(ctx2d, lx, eyeY, eyeW, eyeH, 16)
        ctx2d.fill()
        roundedRect(ctx2d, rx, eyeY, eyeW, eyeH, 16)
        ctx2d.fill()
        // Pupils track the visitor.
        ctx2d.fillStyle = '#000'
        ctx2d.beginPath()
        ctx2d.arc(lx + eyeW / 2 + fs.lookX, eyeY + eyeH / 2 + fs.lookY, 10, 0, Math.PI * 2)
        ctx2d.fill()
        ctx2d.beginPath()
        ctx2d.arc(rx + eyeW / 2 + fs.lookX, eyeY + eyeH / 2 + fs.lookY, 10, 0, Math.PI * 2)
        ctx2d.fill()
      }
      // Mouth: idle / happy / surprised.
      ctx2d.strokeStyle = '#fff'
      ctx2d.lineWidth = 4
      ctx2d.lineCap = 'round'
      ctx2d.beginPath()
      if (fs.expr === 1) {
        ctx2d.moveTo(112, 102)
        ctx2d.lineTo(122, 110)
        ctx2d.lineTo(134, 110)
        ctx2d.lineTo(144, 102)
      } else if (fs.expr === 2) {
        ctx2d.arc(128, 104, 7, 0, Math.PI * 2)
      } else {
        ctx2d.moveTo(114, 106)
        ctx2d.lineTo(142, 106)
      }
      ctx2d.stroke()
    }
    texture.needsUpdate = true
  })

  const handleSelect = (e: ThreeEvent<MouseEvent>): void => {
    e.stopPropagation()
    useCurioStore.getState().goToSection(SECTION_MAP.croc.stop)
  }

  const handleDown = (e: ThreeEvent<PointerEvent>): void => {
    e.stopPropagation()
  }

  const screen = (
    <group position={[0, 1.04, -0.28]} rotation={[-0.24, 0, 0]}>
      {/* Casing */}
      <mesh position={[0, 0, -0.045]}>
        <boxGeometry args={[1.2, 0.66, 0.07]} />
        <meshStandardMaterial color="#0c0c0e" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* Live OLED */}
      <mesh>
        <planeGeometry args={[1.06, 0.53]} />
        <meshBasicMaterial ref={screenMat} map={texture} toneMapped={false} />
      </mesh>
    </group>
  )

  return (
    <group>
      <ArtifactModel
        url={assetUrl}
        fallback={
          <group
            onPointerDown={handleDown}
            onClick={handleSelect}
            onPointerOver={(e) => {
              e.stopPropagation()
              document.body.style.cursor = 'pointer'
            }}
            onPointerOut={() => {
              document.body.style.cursor = ''
            }}
          >
            {/* Bench plinth — machined aluminum */}
            <mesh position={[0, 0.31, 0]}>
              <boxGeometry args={[2.4, 0.5, 1.8]} />
              <meshStandardMaterial color="#dcdce2" roughness={0.35} metalness={0.6} />
            </mesh>
            {/* PCB */}
            <mesh position={[0, 0.6, 0.1]}>
              <boxGeometry args={[1.7, 0.07, 1.15]} />
              <meshStandardMaterial color="#12241a" roughness={0.55} metalness={0.15} />
            </mesh>
            {/* Silkscreen traces */}
            <mesh position={[-0.1, 0.64, 0.35]}>
              <boxGeometry args={[1.2, 0.006, 0.025]} />
              <meshBasicMaterial color="#c9c9d2" toneMapped={false} />
            </mesh>
            <mesh position={[0.3, 0.64, -0.1]}>
              <boxGeometry args={[0.025, 0.006, 0.7]} />
              <meshBasicMaterial color="#c9c9d2" toneMapped={false} />
            </mesh>
            <mesh position={[-0.4, 0.64, -0.25]}>
              <boxGeometry args={[0.5, 0.006, 0.025]} />
              <meshBasicMaterial color="#0071e3" toneMapped={false} />
            </mesh>
            {/* Main chip + pin headers */}
            <mesh position={[-0.25, 0.67, 0.1]}>
              <boxGeometry args={[0.4, 0.07, 0.4]} />
              <meshStandardMaterial color="#0a0a0c" roughness={0.4} metalness={0.3} />
            </mesh>
            {[-0.7, -0.5, -0.3, -0.1].map((x) => (
              <mesh key={x} position={[x, 0.68, 0.52]}>
                <boxGeometry args={[0.06, 0.09, 0.06]} />
                <meshStandardMaterial color="#8a8a92" roughness={0.35} metalness={0.9} />
              </mesh>
            ))}
            {/* Copper touch pads */}
            {[-0.62, 0.62].map((x) => (
              <mesh key={x} position={[x, 0.645, 0.42]}>
                <cylinderGeometry args={[0.09, 0.09, 0.02, 20]} />
                <meshStandardMaterial color="#a86a3f" roughness={0.3} metalness={0.9} />
              </mesh>
            ))}
            {/* OLED stand + live screen */}
            <mesh position={[0, 0.78, -0.3]}>
              <boxGeometry args={[0.2, 0.32, 0.1]} />
              <meshStandardMaterial color="#c7c7cc" roughness={0.4} metalness={0.7} />
            </mesh>
            {screen}
          </group>
        }
      />
      {/* Wakes with the section: faint orange bleed under the bench. */}
      <mesh position={[0, 0.075, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.6, 2.0]} />
        <meshBasicMaterial ref={glowMat} color="#0071e3" transparent opacity={0.05} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}
