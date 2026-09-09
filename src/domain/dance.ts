export type Vec2 = { x: number; z: number }
export type Weight = 'left' | 'right' | 'center'
export type DancerPose = {
  leftFoot: Vec2
  rightFoot: Vec2
  weight: Weight
  rotation: number
  bodyOffset: Vec2
  // Vertical dip of the torso/head/arms from weight transfer (0 = standing tall,
  // negative = settled into the stepping leg). Feet stay planted; only the upper
  // body rides this bounce, so it reads as natural sway without the couple traveling.
  bounce: number
}
export type CouplePose = { leader: DancerPose; follower: DancerPose }
export type DanceKeyframe = { cycleProgress: number; pose: CouplePose }
export type DancePattern = { id: string; name: string; durationInCycles: number; keyframes: DanceKeyframe[] }
