import { NODES } from '../../data/nodes.ts'
import { CameraRig } from '../camera/CameraRig.tsx'
import { EnvironmentSetup } from '../environment/EnvironmentSetup.tsx'
import { NodeLinks } from '../environment/NodeLinks.tsx'
import { CurioNode } from '../nodes/CurioNode.tsx'

/**
 * SceneRoot — pure 3D composition. No DOM, no camera math, no selection
 * logic beyond what CurioNode reports to the store. New content = new
 * entries in `src/data/nodes.ts`; this file never changes.
 */
export function SceneRoot() {
  return (
    <group>
      <EnvironmentSetup />
      <NodeLinks />
      {NODES.map((spec, i) => (
        <CurioNode key={spec.id} spec={spec} order={i} />
      ))}
      <CameraRig />
    </group>
  )
}
