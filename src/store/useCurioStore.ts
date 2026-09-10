import { create } from 'zustand'
import type { CurioNodeSpec } from '../data/nodes.ts'
import { NODE_MAP, OVERVIEW_LOOK_AT, OVERVIEW_POSITION } from '../data/nodes.ts'
import { focusPoseFor } from '../lib/camera.ts'

/** Fixed-length 3D vector tuple. */
export type Vec3 = [number, number, number]

export type CameraMode = 'overview' | 'focus'
export type InteractionMode = 'loading' | 'idle' | 'focused'

export interface CameraPose {
  position: Vec3
  lookAt: Vec3
}

interface CurioState {
  /** Single authoritative selection. Null = overview. */
  activeNodeId: string | null
  hoveredNodeId: string | null
  cameraMode: CameraMode
  cameraTarget: CameraPose
  interactionMode: InteractionMode
  isTransitioning: boolean
  /** Initial load sequence completed. */
  ready: boolean
  /** Compact layout flag (drives camera distance + hit areas). */
  compact: boolean

  selectNode: (id: string) => void
  clearSelection: () => void
  setHovered: (id: string | null) => void
  setTransitioning: (v: boolean) => void
  markReady: () => void
  setCompact: (v: boolean) => void
}

function overviewPose(): CameraPose {
  return { position: [...OVERVIEW_POSITION] as Vec3, lookAt: [...OVERVIEW_LOOK_AT] as Vec3 }
}

export const useCurioStore = create<CurioState>()((set, get) => ({
  activeNodeId: null,
  hoveredNodeId: null,
  cameraMode: 'overview',
  cameraTarget: overviewPose(),
  interactionMode: 'loading',
  isTransitioning: false,
  ready: false,
  compact: false,

  selectNode: (id: string) => {
    const spec: CurioNodeSpec | undefined = NODE_MAP[id]
    if (!spec || spec.disabled) return
    if (!get().ready) return
    if (get().activeNodeId === id) return
    set({
      activeNodeId: id,
      hoveredNodeId: null,
      cameraMode: 'focus',
      cameraTarget: focusPoseFor(spec.position, get().compact),
      interactionMode: 'focused',
      isTransitioning: true,
    })
  },

  clearSelection: () => {
    if (get().activeNodeId === null && get().cameraMode === 'overview') return
    set({
      activeNodeId: null,
      cameraMode: 'overview',
      cameraTarget: overviewPose(),
      interactionMode: get().ready ? 'idle' : 'loading',
      isTransitioning: true,
    })
  },

  setHovered: (id: string | null) => {
    if (get().hoveredNodeId === id) return
    set({ hoveredNodeId: id })
  },

  setTransitioning: (v: boolean) => {
    if (get().isTransitioning === v) return
    set({ isTransitioning: v })
  },

  markReady: () => {
    if (get().ready) return
    set({ ready: true, interactionMode: get().activeNodeId ? 'focused' : 'idle' })
  },

  setCompact: (v: boolean) => {
    if (get().compact === v) return
    // Recompute the current camera target so overview/focus distances
    // stay correct when the viewport class changes mid-session.
    const { activeNodeId } = get()
    const spec = activeNodeId ? NODE_MAP[activeNodeId] : undefined
    set({
      compact: v,
      cameraTarget: spec ? focusPoseFor(spec.position, v) : overviewPose(),
    })
  },
}))
