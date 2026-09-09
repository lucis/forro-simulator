import type { CouplePose, DancePattern, DancerPose, Vec2 } from '../domain/dance'

const lerp = (from: number, to: number, progress: number) => from + (to - from) * progress
const lerpVec = (from: Vec2, to: Vec2, progress: number): Vec2 => ({ x: lerp(from.x, to.x, progress), z: lerp(from.z, to.z, progress) })
const lerpDancer = (from: DancerPose, to: DancerPose, progress: number): DancerPose => ({
  leftFoot: lerpVec(from.leftFoot, to.leftFoot, progress),
  rightFoot: lerpVec(from.rightFoot, to.rightFoot, progress),
  bodyOffset: lerpVec(from.bodyOffset, to.bodyOffset, progress),
  rotation: lerp(from.rotation, to.rotation, progress),
  weight: from.weight,
})

export function interpolatePattern(pattern: DancePattern, progress: number): CouplePose {
  if (pattern.keyframes.length === 0) throw new Error('Padrão de dança sem keyframes')
  const normalized = ((progress % 1) + 1) % 1
  const nextIndex = pattern.keyframes.findIndex(({ cycleProgress }) => cycleProgress > normalized)
  const to = pattern.keyframes[nextIndex < 0 ? pattern.keyframes.length - 1 : nextIndex]
  const from = pattern.keyframes[Math.max(0, (nextIndex < 0 ? pattern.keyframes.length - 1 : nextIndex) - 1)]
  if (to.cycleProgress === from.cycleProgress) return from.pose
  const local = (normalized - from.cycleProgress) / (to.cycleProgress - from.cycleProgress)
  return { leader: lerpDancer(from.pose.leader, to.pose.leader, local), follower: lerpDancer(from.pose.follower, to.pose.follower, local) }
}
