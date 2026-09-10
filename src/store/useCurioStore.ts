import { create } from 'zustand'
import type { SectionId } from '../data/sections.ts'
import { scrollToSection } from '../lib/scroll.ts'

/** Fixed-length 3D vector tuple. */
export type Vec3 = [number, number, number]

export interface CameraPose {
  position: Vec3
  lookAt: Vec3
}

interface CurioState {
  /** Discrete journey stop — drives DOM. Continuous motion reads scrollState. */
  activeSection: SectionId
  /** Initial load sequence completed. */
  ready: boolean
  /** Compact viewport flag (drives camera distance + DOM density). */
  compact: boolean

  setActiveSection: (id: SectionId) => void
  goToSection: (stop: number) => void
  markReady: () => void
  setCompact: (v: boolean) => void
}

export const useCurioStore = create<CurioState>()((set, get) => ({
  activeSection: 'intro',
  ready: false,
  compact: false,

  setActiveSection: (id: SectionId) => {
    if (get().activeSection === id) return
    set({ activeSection: id })
  },

  goToSection: (stop: number) => {
    if (!get().ready) return
    scrollToSection(stop)
  },

  markReady: () => {
    if (get().ready) return
    set({ ready: true })
  },

  setCompact: (v: boolean) => {
    if (get().compact === v) return
    set({ compact: v })
  },
}))
