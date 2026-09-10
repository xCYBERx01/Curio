import * as THREE from 'three'
import type { CameraPose, Vec3 } from '../store/useCurioStore'
import { MOODS, POSE_ORDER, poseFor } from '../data/sections'
import type { Mood, SectionId } from '../data/sections'

/**
 * Camera + mood sampling. Pure functions of the scroll float — the ONLY
 * place camera targets are computed. The controller damps toward these.
 */

const _posA = new THREE.Vector3()
const _posB = new THREE.Vector3()
const _lookA = new THREE.Vector3()
const _lookB = new THREE.Vector3()

export function smoothstep(t: number): number {
  const x = Math.min(1, Math.max(0, t))
  return x * x * (3 - 2 * x)
}

/**
 * Interpolated pose between adjacent stops, plus a whisper of
 * intra-stop drift so the camera never feels parked while scrolling.
 * Reduced motion quantizes to whole stops (stepped, no glide).
 */
export function sampleCameraPose(
  scrollFloat: number,
  compact: boolean,
  reducedMotion: boolean,
  out: CameraPose,
): void {
  const f = reducedMotion ? Math.round(scrollFloat) : scrollFloat
  const clamped = Math.min(POSE_ORDER.length - 1.001, Math.max(0, f))
  const i = Math.floor(clamped)
  const j = Math.min(POSE_ORDER.length - 1, i + 1)
  const t = smoothstep(clamped - i)

  const a = poseFor(POSE_ORDER[i])
  const b = poseFor(POSE_ORDER[j])
  _posA.set(...a.position)
  _posB.set(...b.position)
  _lookA.set(...a.lookAt)
  _lookB.set(...b.lookAt)

  const pos = _posA.lerp(_posB, t)
  const look = _lookA.lerp(_lookB, t)

  if (compact) {
    // Pull back along the view axis for small viewports.
    const dx = pos.x - look.x
    const dy = pos.y - look.y
    const dz = pos.z - look.z
    pos.set(look.x + dx * 1.3, look.y + dy * 1.3 + 0.6, look.z + dz * 1.3)
  }

  if (!reducedMotion) {
    const frac = clamped - Math.floor(clamped)
    pos.x += (frac - 0.5) * 0.5
    pos.y += Math.sin(frac * Math.PI) * 0.15
  }

  out.position = [pos.x, pos.y, pos.z] as Vec3
  out.lookAt = [look.x, look.y, look.z] as Vec3
}

const _colorA = new THREE.Color()
const _colorB = new THREE.Color()

export interface SampledMood {
  keyIntensity: number
  rimIntensity: number
  ambientIntensity: number
  /** Owned color — sampled into, never aliased. */
  keyColor: THREE.Color
}

const _scratch = new THREE.Color()

function moodFor(id: SectionId): Mood {
  return MOODS[id]
}

/** Blended lighting mood for a scroll float. */
export function sampleMood(scrollFloat: number, out: SampledMood): void {
  const clamped = Math.min(POSE_ORDER.length - 1.001, Math.max(0, scrollFloat))
  const i = Math.floor(clamped)
  const j = Math.min(POSE_ORDER.length - 1, i + 1)
  const t = smoothstep(clamped - i)
  const a = moodFor(POSE_ORDER[i])
  const b = moodFor(POSE_ORDER[j])
  out.keyIntensity = a.keyIntensity + (b.keyIntensity - a.keyIntensity) * t
  out.rimIntensity = a.rimIntensity + (b.rimIntensity - a.rimIntensity) * t
  out.ambientIntensity = a.ambientIntensity + (b.ambientIntensity - a.ambientIntensity) * t
  _colorA.set(a.keyColor)
  _colorB.set(b.keyColor)
  _scratch.copy(_colorA).lerp(_colorB, t)
  out.keyColor.copy(_scratch)
}
