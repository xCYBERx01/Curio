import type { Vec3 } from '../store/useCurioStore.ts'

/**
 * Single source of truth for all spatial layout.
 * Add a new node here — no scene code changes required.
 *
 * Layout: featured arc around identity (front/center), software gallery
 * west, robotics/automation gallery east. Front-center stays clear for
 * the overview camera. Minimum pairwise separation is enforced by
 * `validateNodeSeparation()`.
 */

export type NodeType = 'identity' | 'project' | 'interest' | 'contact'

export type NodeGroup = 'featured' | 'embedded' | 'software' | 'robotics' | 'automation' | 'info'

export interface CurioNodeSpec {
  id: string
  type: NodeType
  group: NodeGroup
  /** Short index printed in technical labels, e.g. "01". */
  index: string
  label: string
  /** Compact label for dense UI (index panel). */
  short: string
  /** False for the six primary nodes shown in the header bar. */
  featured: boolean
  position: Vec3
  /** Uniform scale multiplier for the node group. */
  scale: number
  /** Optional GLB path under /public. Null = procedural fallback geometry. */
  assetUrl: string | null
  disabled?: boolean
}

export const MIN_NODE_SEPARATION = 2.2

export const OVERVIEW_POSITION: Vec3 = [0, 3.2, 9.0]
export const OVERVIEW_LOOK_AT: Vec3 = [0, 0.9, -1.4]

export const NODES: CurioNodeSpec[] = [
  // ---- featured arc ----
  {
    id: 'identity',
    type: 'identity',
    group: 'featured',
    index: '01',
    label: 'Ahmed — Robotics & AI',
    short: 'Ahmed',
    featured: true,
    position: [0, 1.7, 0.6],
    scale: 1.15,
    assetUrl: null,
  },
  {
    id: 'croc-os',
    type: 'project',
    group: 'embedded',
    index: '02',
    label: 'CROC OS',
    short: 'CROC OS',
    featured: true,
    position: [-3.6, 1.1, -1.4],
    scale: 1.0,
    assetUrl: null,
  },
  {
    id: 'voltedge',
    type: 'project',
    group: 'robotics',
    index: '03',
    label: 'VoltEdge Robotics',
    short: 'VoltEdge',
    featured: true,
    position: [3.6, 1.1, -1.4],
    scale: 1.0,
    assetUrl: null,
  },
  {
    id: 'arm-5dof',
    type: 'project',
    group: 'robotics',
    index: '04',
    label: '5-DOF Robotic Arm',
    short: 'Arm 5-DOF',
    featured: true,
    position: [0, 0.9, -3.7],
    scale: 1.0,
    assetUrl: null,
  },
  {
    id: 'interests',
    type: 'interest',
    group: 'info',
    index: '05',
    label: 'Technical Interests',
    short: 'Interests',
    featured: true,
    position: [-3.3, 0.9, 1.9],
    scale: 0.9,
    assetUrl: null,
  },
  {
    id: 'contact',
    type: 'contact',
    group: 'info',
    index: '06',
    label: 'Contact',
    short: 'Contact',
    featured: true,
    position: [3.3, 0.9, 1.9],
    scale: 0.9,
    assetUrl: null,
  },
  // ---- software gallery (west) ----
  {
    id: 'desko',
    type: 'project',
    group: 'software',
    index: '07',
    label: 'Desko',
    short: 'Desko',
    featured: false,
    position: [-5.9, 1.0, -0.9],
    scale: 0.9,
    assetUrl: null,
  },
  {
    id: 'meadow',
    type: 'project',
    group: 'software',
    index: '08',
    label: 'Meadow',
    short: 'Meadow',
    featured: false,
    position: [-8.3, 1.0, -0.9],
    scale: 0.9,
    assetUrl: null,
  },
  {
    id: 'kharcha',
    type: 'project',
    group: 'software',
    index: '09',
    label: 'Kharcha',
    short: 'Kharcha',
    featured: false,
    position: [-5.8, 1.0, 1.4],
    scale: 0.9,
    assetUrl: null,
  },
  {
    id: 'sportcast',
    type: 'project',
    group: 'software',
    index: '10',
    label: 'SportCast',
    short: 'SportCast',
    featured: false,
    position: [-8.2, 1.0, 1.4],
    scale: 0.9,
    assetUrl: null,
  },
  {
    id: 'anicatch',
    type: 'project',
    group: 'software',
    index: '11',
    label: 'AniCatch',
    short: 'AniCatch',
    featured: false,
    position: [-5.8, 1.0, -3.4],
    scale: 0.9,
    assetUrl: null,
  },
  // ---- robotics / automation gallery (east) ----
  {
    id: 'field-shutter',
    type: 'project',
    group: 'automation',
    index: '12',
    label: 'Field Shutter',
    short: 'Field Shut.',
    featured: false,
    position: [5.9, 1.0, -0.9],
    scale: 0.9,
    assetUrl: null,
  },
  {
    id: 'drone',
    type: 'project',
    group: 'robotics',
    index: '13',
    label: 'Drone',
    short: 'Drone',
    featured: false,
    position: [8.3, 1.0, -0.9],
    scale: 0.9,
    assetUrl: null,
  },
  {
    id: 'moon-rover',
    type: 'project',
    group: 'robotics',
    index: '14',
    label: 'Moon Rover',
    short: 'Rover 6WD',
    featured: false,
    position: [5.8, 1.0, 1.4],
    scale: 0.9,
    assetUrl: null,
  },
  {
    id: 'iot-telemetry',
    type: 'project',
    group: 'robotics',
    index: '15',
    label: 'IoT Telemetry',
    short: 'Telemetry',
    featured: false,
    position: [8.3, 1.0, 1.4],
    scale: 0.9,
    assetUrl: null,
  },
  {
    id: 'field-analyzer',
    type: 'project',
    group: 'automation',
    index: '16',
    label: 'Field Analyzer',
    short: 'Field Anlz.',
    featured: false,
    position: [5.8, 1.0, -3.4],
    scale: 0.9,
    assetUrl: null,
  },
  {
    id: 'projectdirec',
    type: 'project',
    group: 'software',
    index: '17',
    label: 'ProjectDirec',
    short: 'ProjDirec',
    featured: false,
    position: [8.3, 1.0, -3.4],
    scale: 0.9,
    assetUrl: null,
  },
]

export const NODE_MAP: Record<string, CurioNodeSpec> = Object.fromEntries(
  NODES.map((n) => [n.id, n]),
)

export const FEATURED_NODES: CurioNodeSpec[] = NODES.filter((n) => n.featured)

/** Group order for the site index panel. */
export const GROUP_ORDER: NodeGroup[] = ['featured', 'embedded', 'robotics', 'software', 'automation', 'info']

export const GROUP_LABELS: Record<NodeGroup, string> = {
  featured: 'Featured',
  embedded: 'Embedded',
  robotics: 'Robotics',
  software: 'Software',
  automation: 'Automation',
  info: 'Info',
}

/** Returns human-readable violations; empty array = layout is valid. */
export function validateNodeSeparation(nodes: CurioNodeSpec[] = NODES): string[] {
  const problems: string[] = []
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const a = nodes[i].position
      const b = nodes[j].position
      const d = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
      if (d < MIN_NODE_SEPARATION) {
        problems.push(
          `Nodes "${nodes[i].id}" and "${nodes[j].id}" are ${d.toFixed(2)} apart (min ${MIN_NODE_SEPARATION}).`,
        )
      }
    }
  }
  return problems
}

if (import.meta.env.DEV) {
  const problems = validateNodeSeparation()
  for (const p of problems) console.warn(`[curio] spatial layout: ${p}`)
}
