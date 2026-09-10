import { CameraController } from '../camera/CameraController.tsx'
import { Environment } from '../environment/Environment.tsx'
import { HeroCore } from '../artifacts/HeroCore.tsx'
import { TurntableStage } from '../artifacts/TurntableStage.tsx'

/**
 * Scene — pure 3D composition for the journey: one void, one dais, one
 * hero core, three artifact bays on a scroll-driven turntable.
 * No DOM, no camera math, no selection state. Scroll drives everything.
 */
export function Scene() {
  return (
    <group>
      <Environment />
      <HeroCore />
      <TurntableStage />
      <CameraController />
    </group>
  )
}
