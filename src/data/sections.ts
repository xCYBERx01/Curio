import type { CameraPose, Vec3 } from '../store/useCurioStore'

/**
 * Single source of truth for the journey: 7 scroll stops, one continuous
 * spatial world. Camera poses, stage rotation and lighting mood are all
 * pure functions of scroll progress — scroll is the sole driver.
 *
 * Stops: INTRO → AHMED → CROC OS → VOLTEDGE → ARM → INTERESTS → CONTACT.
 * The three project stops share one turntable stage (true carousel):
 * the active artifact rotates to front-center as you scroll.
 */

export type SectionId =
  | 'intro'
  | 'ahmed'
  | 'croc'
  | 'voltedge'
  | 'arm'
  | 'interests'
  | 'contact'

export interface SectionSpec {
  id: SectionId
  /** 0-based scroll stop. */
  stop: number
  /** Navigation label; null = not in nav (intro). */
  nav: string | null
  kicker: string
  title: string
  /** Project record backing this section's copy, if any. */
  projectId?: string
  /** GLB under /public for the bay artifact. Null = procedural build. */
  assetUrl?: string | null
  /** Attribution line for a third-party model (license honesty). */
  credit?: string
}

export const SECTIONS: SectionSpec[] = [
  { id: 'intro', stop: 0, nav: null, kicker: 'CURIO — A SPATIAL PORTFOLIO', title: 'Curiosity, made spatial.' },
  { id: 'ahmed', stop: 1, nav: '01 AHMED', kicker: '01 — IDENTITY', title: 'Ahmed', projectId: 'identity' },
  { id: 'croc', stop: 2, nav: '02 CROC OS', kicker: '02 — EMBEDDED COMPANION', title: 'CROC OS', projectId: 'croc-os' },
  { id: 'voltedge', stop: 3, nav: '03 VOLTEDGE', kicker: '03 — COMPETITION ROBOTICS', title: 'VoltEdge', projectId: 'voltedge', assetUrl: '/models/nrlbot.glb' },
  { id: 'arm', stop: 4, nav: '04 ARM 5-DOF', kicker: '04 — MANIPULATOR', title: '5-DOF Arm', projectId: 'arm-5dof', assetUrl: '/models/robo-arm.glb', credit: 'Bay model: “Robot Arm” by m m · CC-BY via Poly Pizza' },
  { id: 'interests', stop: 5, nav: '05 INTERESTS', kicker: '05 — TECHNICAL INTERESTS', title: 'Interests', projectId: 'interests' },
  { id: 'contact', stop: 6, nav: '06 CONTACT', kicker: '06 — CONTACT', title: 'Contact', projectId: 'contact' },
]

export const STOP_COUNT = SECTIONS.length

export const SECTION_MAP: Record<SectionId, SectionSpec> = Object.fromEntries(
  SECTIONS.map((s) => [s.id, s]),
) as Record<SectionId, SectionSpec>

export const NAV_SECTIONS: SectionSpec[] = SECTIONS.filter((s) => s.nav !== null)

/** Remaining verified projects — live in the archive (index + contact), not the stage. */
export const ARCHIVE_IDS = [
  'desko',
  'meadow',
  'kharcha',
  'sportcast',
  'anicatch',
  'field-shutter',
  'drone',
  'moon-rover',
  'iot-telemetry',
  'field-analyzer',
  'projectdirec',
] as const

/* ---------------- camera poses (fov stays constant) ---------------- */

const POSES: Record<SectionId, CameraPose> = {
  intro: { position: [0, 3.6, 12.0], lookAt: [0, 1.9, -1.5] },
  ahmed: { position: [0, 2.3, 8.4], lookAt: [0, 1.3, -1.0] },
  croc: { position: [0.5, 1.9, 6.6], lookAt: [0, 1.1, 1.8] },
  voltedge: { position: [-1.7, 1.9, 6.2], lookAt: [-0.4, 1.1, 2.2] },
  arm: { position: [1.7, 1.9, 6.2], lookAt: [0.4, 1.2, 2.2] },
  interests: { position: [-6.8, 2.6, 5.2], lookAt: [0, 1.5, -0.5] },
  contact: { position: [0, 5.4, 12.8], lookAt: [0, 0.6, -2.0] },
}

export const POSE_ORDER: SectionId[] = SECTIONS.map((s) => s.id)

export function poseFor(id: SectionId): CameraPose {
  const p = POSES[id]
  return { position: [...p.position] as Vec3, lookAt: [...p.lookAt] as Vec3 }
}

/* ---------------- lighting moods ---------------- */

export interface Mood {
  keyIntensity: number
  keyColor: string
  rimIntensity: number
  ambientIntensity: number
}

export const MOODS: Record<SectionId, Mood> = {
  intro: { keyIntensity: 1.0, keyColor: '#ffffff', rimIntensity: 0.45, ambientIntensity: 0.85 },
  ahmed: { keyIntensity: 1.2, keyColor: '#fffaf2', rimIntensity: 0.4, ambientIntensity: 0.9 },
  croc: { keyIntensity: 1.25, keyColor: '#fff2e6', rimIntensity: 0.4, ambientIntensity: 0.85 },
  voltedge: { keyIntensity: 1.2, keyColor: '#ffffff', rimIntensity: 0.5, ambientIntensity: 0.9 },
  arm: { keyIntensity: 1.15, keyColor: '#eef3ff', rimIntensity: 0.5, ambientIntensity: 0.85 },
  interests: { keyIntensity: 1.05, keyColor: '#faf8f2', rimIntensity: 0.45, ambientIntensity: 0.85 },
  contact: { keyIntensity: 0.9, keyColor: '#f2f4fa', rimIntensity: 0.4, ambientIntensity: 0.8 },
}

/* ---------------- carousel ---------------- */

/** Turntable slots: project stop index (2,3,4) → artifact slot (0,1,2). */
export const PROJECT_SLOT: { croc: number; voltedge: number; arm: number } = {
  croc: 0,
  voltedge: 1,
  arm: 2,
}

export const TURNTABLE_RADIUS = 3.4
export const SLOT_COUNT = 3

/** Stage rotation (radians) for a continuous scroll float. Holds outside 2..4. */
export function stageAngleFor(scrollFloat: number): number {
  const t = Math.min(2, Math.max(0, scrollFloat - 2))
  return -(t * ((Math.PI * 2) / SLOT_COUNT))
}

/** 0..1 proximity of a project slot to the current scroll float. */
export function slotProximity(scrollFloat: number, slot: number): number {
  return Math.max(0, 1 - Math.abs(scrollFloat - 2 - slot))
}
