import type { DancerPose } from '../domain/dance'

type DancerProps = { pose: DancerPose; role: 'leader' | 'follower' }

export function Dancer({ pose, role }: DancerProps) {
  const leader = role === 'leader'
  const cloth = leader ? '#3d1554' : '#bd59c8'
  const accent = leader ? '#f1b08f' : '#7d2b91'
  const skin = leader ? '#c86f3f' : '#e68a50'
  const baseZ = leader ? 0.42 : -0.42
  const relativeLeftZ = pose.leftFoot.z - pose.bodyOffset.z
  const relativeRightZ = pose.rightFoot.z - pose.bodyOffset.z

  return <group position={[pose.bodyOffset.x, 0, baseZ + pose.bodyOffset.z]} rotation={[0, pose.rotation, 0]}>
    <group position={[0, pose.bounce, 0]}>
      <mesh position={[0, 1.45, 0]} castShadow><capsuleGeometry args={[0.26, 0.55, 8, 16]} /><meshStandardMaterial color={cloth} roughness={0.8} /></mesh>
      <mesh position={[0, 2.05, 0]} castShadow><sphereGeometry args={[0.2, 20, 20]} /><meshStandardMaterial color={skin} roughness={0.75} /></mesh>
      {leader ? <group position={[0, 2.22, 0]}><mesh><cylinderGeometry args={[0.28, 0.24, 0.18, 20]} /><meshStandardMaterial color="#f1c5a8" /></mesh><mesh position={[0, -0.1, 0]}><cylinderGeometry args={[0.43, 0.43, 0.045, 24]} /><meshStandardMaterial color="#e8ac8d" /></mesh></group> : <mesh position={[0, 2.17, 0.04]}><sphereGeometry args={[0.22, 16, 16]} /><meshStandardMaterial color="#281039" /></mesh>}
      <mesh position={[-0.28, 1.56, -0.12]} rotation={[0.35, 0, -0.65]} castShadow><capsuleGeometry args={[0.07, 0.48, 6, 12]} /><meshStandardMaterial color={skin} /></mesh>
      <mesh position={[0.28, 1.56, -0.12]} rotation={[0.35, 0, 0.65]} castShadow><capsuleGeometry args={[0.07, 0.48, 6, 12]} /><meshStandardMaterial color={skin} /></mesh>
      <mesh position={[0, 1.18, 0]}><torusGeometry args={[0.25, 0.035, 8, 28]} /><meshStandardMaterial color={accent} /></mesh>
    </group>
    <mesh position={[pose.leftFoot.x, 0.66, relativeLeftZ]} castShadow><capsuleGeometry args={[0.085, 0.78, 6, 12]} /><meshStandardMaterial color={leader ? '#4b2761' : '#dc83d8'} /></mesh>
    <mesh position={[pose.rightFoot.x, 0.66, relativeRightZ]} castShadow><capsuleGeometry args={[0.085, 0.78, 6, 12]} /><meshStandardMaterial color={leader ? '#4b2761' : '#dc83d8'} /></mesh>
    <mesh position={[pose.leftFoot.x, 0.17, relativeLeftZ + 0.07]} castShadow><boxGeometry args={[0.2, 0.12, 0.38]} /><meshStandardMaterial color="#211028" /></mesh>
    <mesh position={[pose.rightFoot.x, 0.17, relativeRightZ + 0.07]} castShadow><boxGeometry args={[0.2, 0.12, 0.38]} /><meshStandardMaterial color="#211028" /></mesh>
  </group>
}
