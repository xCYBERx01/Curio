import { useEffect, useRef, useState } from 'react'

/**
 * Magnetic cursor: a trailing accent ring that eases toward the pointer
 * and swells over anything interactive. The native cursor stays visible
 * (safer for usability) — this is atmosphere, not replacement.
 * Mounts only on fine pointers without reduced-motion preference.
 */
export function MagneticCursor() {
  const [enabled] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
    return (
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
  })
  const ring = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enabled) return
    const pos = { x: -100, y: -100 }
    const target = { x: -100, y: -100 }
    let scale = 1
    let targetScale = 1
    let opacity = 0
    let raf = 0
    let alive = true

    const onMove = (e: MouseEvent): void => {
      target.x = e.clientX
      target.y = e.clientY
      opacity = 1
      const el = e.target as HTMLElement | null
      targetScale = el && el.closest('a, button, summary, [data-magnetic]') ? 1.9 : 1
    }
    const onLeave = (): void => {
      opacity = 0
    }

    const loop = (): void => {
      if (!alive) return
      const px = pos.x + (target.x - pos.x) * 0.22
      const py = pos.y + (target.y - pos.y) * 0.22
      pos.x = px
      pos.y = py
      scale += (targetScale - scale) * 0.18
      const ringEl = ring.current
      if (ringEl) {
        ringEl.style.transform = `translate3d(${px}px, ${py}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`
        ringEl.style.opacity = opacity.toFixed(2)
      }
      const dotEl = dot.current
      if (dotEl) {
        dotEl.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`
        dotEl.style.opacity = opacity.toFixed(2)
      }
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
    raf = requestAnimationFrame(loop)
    return () => {
      alive = false
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeave)
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <>
      <div ref={ring} className="curio-cursor" aria-hidden="true" />
      <div ref={dot} className="curio-cursor-dot" aria-hidden="true" />
    </>
  )
}
