import type { CouplePose, DancePattern, Weight } from '../../domain/dance'

// Real xote: the couple stays in a fixed embrace and the torso does not travel.
// Only feet step sideways, and the two partners' legs move as mirrored pairs —
// the leader's left leg with the follower's right leg, then the leader's right
// leg with the follower's left leg — three steps to one side plus a hold
// ("camarão" pause), then the same three-plus-hold to the other side.
function dancer(activeFoot: 'left' | 'right' | 'none', reach: number, bounce: number, weight: Weight, facing: number) {
  return {
    leftFoot: { x: -0.14 - (activeFoot === 'left' ? reach : 0), z: 0 },
    rightFoot: { x: 0.14 + (activeFoot === 'right' ? reach : 0), z: 0 },
    weight,
    rotation: facing,
    bodyOffset: { x: 0, z: 0 },
    bounce,
  }
}

function pose(activeFoot: 'left' | 'right' | 'none', reach: number, bounce: number, weight: Weight): CouplePose {
  return {
    leader: dancer(activeFoot, reach, bounce, weight, 0),
    follower: dancer(
      activeFoot === 'left' ? 'right' : activeFoot === 'right' ? 'left' : 'none',
      reach,
      bounce,
      weight === 'left' ? 'right' : weight === 'right' ? 'left' : 'center',
      Math.PI,
    ),
  }
}

const STEP_REACH = 0.16
const BOUNCE = 0.09
const neutral = pose('none', 0, 0, 'center')

export const DOIS_PRA_LA_DOIS_PRA_CA: DancePattern = {
  id: 'dois-pra-la-dois-pra-ca',
  name: 'Dois pra lá, dois pra cá',
  durationInCycles: 2,
  keyframes: [
    { cycleProgress: 0, pose: neutral },
    { cycleProgress: 0.125, pose: pose('left', STEP_REACH, -BOUNCE, 'left') },
    { cycleProgress: 0.25, pose: pose('left', STEP_REACH * 0.55, -BOUNCE * 0.7, 'left') },
    { cycleProgress: 0.375, pose: pose('left', 0, -BOUNCE * 0.25, 'left') },
    { cycleProgress: 0.5, pose: neutral },
    { cycleProgress: 0.625, pose: pose('right', STEP_REACH, -BOUNCE, 'right') },
    { cycleProgress: 0.75, pose: pose('right', STEP_REACH * 0.55, -BOUNCE * 0.7, 'right') },
    { cycleProgress: 0.875, pose: pose('right', 0, -BOUNCE * 0.25, 'right') },
    { cycleProgress: 1, pose: neutral },
  ],
}
