import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import type { CouplePose } from '../domain/dance'
import { Dancer } from './Dancer'

export type CameraPreset = 'front' | 'side' | 'top'
type Props = { pose: CouplePose; showLeader: boolean; showFollower: boolean; camera: CameraPreset }

export function DanceScene({ pose, showLeader, showFollower, camera }: Props) {
  const three = useThree()
  useEffect(() => {
    const positions: Record<CameraPreset, [number, number, number]> = { front: [3.8, 2.8, 4.8], side: [5.4, 2.6, 0], top: [0.1, 6.6, 0.1] }
    three.camera.position.set(...positions[camera])
    three.camera.lookAt(0, 1.1, 0)
    three.camera.updateProjectionMatrix()
  }, [camera, three.camera])

  return <>
    <color attach="background" args={['#180921']} />
    <fog attach="fog" args={['#180921', 7, 12]} />
    <ambientLight intensity={1.6} />
    <directionalLight castShadow intensity={3.2} color="#ffb36b" position={[3, 6, 4]} />
    <pointLight intensity={18} color="#b34bc4" position={[-3, 2, -2]} distance={8} />
    {showLeader ? <Dancer pose={pose.leader} role="leader" /> : null}
    {showFollower ? <Dancer pose={pose.follower} role="follower" /> : null}
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[4.5, 64]} /><meshStandardMaterial color="#5b2948" roughness={0.92} /></mesh>
    <OrbitControls enablePan={false} enableZoom={false} target={[0, 1.05, 0]} />
  </>
}
