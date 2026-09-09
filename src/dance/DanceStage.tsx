import { Canvas } from '@react-three/fiber'
import type { CouplePose } from '../domain/dance'
import { DanceScene, type CameraPreset } from './DanceScene'

type Props = { pose: CouplePose; showLeader: boolean; showFollower: boolean; camera: CameraPreset }

export function DanceStage(props: Props) {
  return <div className="dance-stage" aria-label="Palco de dança">
    <Canvas shadows dpr={[1, 1.5]} camera={{ position: [3.8, 2.8, 4.8], fov: 38 }}>
      <DanceScene {...props} />
    </Canvas>
  </div>
}
