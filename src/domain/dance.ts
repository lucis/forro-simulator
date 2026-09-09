export type Vec2 = { x: number; z: number }
export type Weight = 'left' | 'right' | 'center'
export type DancerPose = {
  leftFoot: Vec2
  rightFoot: Vec2
  weight: Weight
  rotation: number
  bodyOffset: Vec2
}
export type CouplePose = { leader: DancerPose; follower: DancerPose }
export type DanceKeyframe = { cycleProgress: number; pose: CouplePose }
export type DancePattern = { id: string; name: string; durationInCycles: number; keyframes: DanceKeyframe[] }
