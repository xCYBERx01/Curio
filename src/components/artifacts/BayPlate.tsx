import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { slotProximity } from '../../data/sections'
import { scrollState } from '../../lib/scroll'

function roundRectPath(
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
 * BayPlate: a floating specimen card beside each bay — giant index
 * numeral, title, discipline. Painted once to a CanvasTexture (no font
 * downloads, no network, fully art-directable), faded by bay proximity
 * so only the live bay reads at full ink. FrontSide-only: never mirrors.
 */
export function BayPlate({
  slot,
  index,
  title,
  sub,
}: {
  slot: number
  index: string
  title: string
  sub: string
}) {
  const mat = useRef<THREE.MeshBasicMaterial>(null!)

  const texture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512
    c.height = 288
    const ctx = c.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, 512, 288)
      ctx.fillStyle = 'rgba(12,12,16,0.88)'
      roundRectPath(ctx, 4, 4, 504, 280, 30)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.16)'
      ctx.lineWidth = 2
      roundRectPath(ctx, 4, 4, 504, 280, 30)
      ctx.stroke()
      ctx.fillStyle = '#e23a1e'
      ctx.font = '600 26px ui-monospace, SFMono-Regular, Menlo, monospace'
      ctx.fillText(index, 38, 62)
      ctx.fillStyle = '#ece7df'
      const word = title.toUpperCase()
      let size = 112
      const family = "-apple-system, 'SF Pro Display', Inter, sans-serif"
      do {
        ctx.font = `700 ${size}px ${family}`
        size -= 6
      } while (ctx.measureText(word).width > 436 && size > 36)
      ctx.fillText(word, 32, 178)
      ctx.fillStyle = '#a39e93'
      ctx.font = '500 25px ui-monospace, SFMono-Regular, Menlo, monospace'
      ctx.fillText(sub.toUpperCase().slice(0, 30), 38, 232)
    }
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
    return tex
  }, [index, title, sub])

  useEffect(() => {
    const tex = texture
    return () => tex.dispose()
  }, [texture])

  useFrame(() => {
    if (!mat.current) return
    const prox = slotProximity(scrollState.float, slot)
    const target = 0.12 + prox * 0.88
    mat.current.opacity += (target - mat.current.opacity) * 0.08
  })

  return (
    <mesh position={[-2.35, 1.32, 0.3]}>
      <planeGeometry args={[1.62, 0.91]} />
      <meshBasicMaterial ref={mat} map={texture} transparent toneMapped={false} />
    </mesh>
  )
}
