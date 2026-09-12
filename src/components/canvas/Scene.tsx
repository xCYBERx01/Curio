import { CameraController } from '../camera/CameraController'
import { Atmosphere } from '../environment/Atmosphere'
import { Environment } from '../environment/Environment'
import { HeroCore } from '../artifacts/HeroCore'
import { TurntableStage } from '../artifacts/TurntableStage'

/**
 * Scene — pure 3D composition for the journey: one void, one dais, one
 * hero core, three artifact bays on a scroll-driven turntable.
 * No DOM, no camera math, no selection state. Scroll drives everything.
 */
export function Scene() {
  return (
    <group>
      <Environment />
      <Atmosphere />
      <HeroCore />
      <TurntableStage />
      <CameraController />
    </group>
  )
}
