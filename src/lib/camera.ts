import type { CameraPose, Vec3 } from '../store/useCurioStore.ts'
import { OVERVIEW_LOOK_AT, OVERVIEW_POSITION } from '../data/nodes.ts'

/**
 * Deterministic camera poses. The ONLY place camera targets are computed —
 * CameraRig consumes them, nothing else moves the camera.
 */

const FOCUS_DISTANCE = 3.1
const FOCUS_HEIGHT = 1.05
const COMPACT_DISTANCE_BOOST = 1.35

export function overviewPose(): CameraPose {
  return {
    position: [...OVERVIEW_POSITION] as Vec3,
    lookAt: [...OVERVIEW_LOOK_AT] as Vec3,
  }
}

/**
 * Focus pose for a node: pulled back toward the overview side so the node
 * keeps spatial context instead of filling the frame. Pure function of the
 * node position → deterministic, interruptible (rig always lerps from the
 * camera's *current* state toward the latest target).
 */
export function focusPoseFor(nodePos: Vec3, compact = false): CameraPose {
  const dist = FOCUS_DISTANCE + (compact ? COMPACT_DISTANCE_BOOST : 0)

  // Horizontal direction from the node back toward the overview camera.
  const dx = OVERVIEW_POSITION[0] - nodePos[0]
  const dz = OVERVIEW_POSITION[2] - nodePos[2]
  const len = Math.hypot(dx, dz) || 1
  const nx = dx / len
  const nz = dz / len

  const px = nodePos[0] + nx * dist
  const pz = nodePos[2] + nz * dist
  const py = Math.max(0.9, nodePos[1] + FOCUS_HEIGHT * 0.55)

  return {
    position: [px, py, pz],
    lookAt: [nodePos[0], nodePos[1], nodePos[2]],
  }
}

/** True when the camera is close enough to its target to settle. */
export function isPoseSettled(
  currentPos: Vec3,
  currentLook: Vec3,
  target: CameraPose,
  epsilon = 0.025,
): boolean {
  const dp = Math.hypot(
    currentPos[0] - target.position[0],
    currentPos[1] - target.position[1],
    currentPos[2] - target.position[2],
  )
  const dl = Math.hypot(
    currentLook[0] - target.lookAt[0],
    currentLook[1] - target.lookAt[1],
    currentLook[2] - target.lookAt[2],
  )
  return dp < epsilon && dl < epsilon
}
