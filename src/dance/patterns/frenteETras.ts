import type { CouplePose, DancePattern, Weight } from '../../domain/dance'

// "Frente e trás": the couple's basic step. Torsos stay fixed in the embrace;
// only legs move. The leader typically starts with the left leg stepping into
// the shared space between partners while the lady's paired right leg steps
// clear of it at the same instant — the two legs are complementary (opposite
// direction, same beat), not a mirror copy moving the same way. Count 1 steps
// the leg out; count 2 eases it halfway back; count 3 returns it fully to its
// starting place (no second full step); the "camarão" pause holds. The second
// half of the pattern repeats this with the other leg pair, rocking the couple
// back the other way. `bounce` is a small shared vertical dip of the torso —
// both partners settle into the beat together and rise again through the
// pause — so the step reads as a weight transfer instead of feet sliding
// under a frozen, static body.
function dancer(activeFoot: 'left' | 'right' | 'none', reach: number, bounce: number, weight: Weight, facing: number) {
  return {
    leftFoot: { x: -0.14, z: activeFoot === 'left' ? reach : 0 },
    rightFoot: { x: 0.14, z: activeFoot === 'right' ? reach : 0 },
    weight,
    rotation: facing,
    bodyOffset: { x: 0, z: 0 },
    bounce,
  }
}

// `reach` is the leader's own stepping leg; the follower's paired leg gets the
// opposite sign so it moves clear of the leader's leg instead of copying it.
// `bounce` is shared as-is: partners dip and rise on the same beat.
function pose(activeFoot: 'left' | 'right' | 'none', reach: number, bounce: number, weight: Weight): CouplePose {
  return {
    leader: dancer(activeFoot, reach, bounce, weight, 0),
    follower: dancer(
      activeFoot === 'left' ? 'right' : activeFoot === 'right' ? 'left' : 'none',
      -reach,
      bounce,
      weight === 'left' ? 'right' : weight === 'right' ? 'left' : 'center',
      Math.PI,
    ),
  }
}

const STEP_REACH = 0.16
const BOUNCE = 0.09
const neutral = pose('none', 0, 0, 'center')

export const FRENTE_E_TRAS: DancePattern = {
  id: 'frente-e-tras',
  name: 'Frente e trás',
  durationInCycles: 2,
  keyframes: [
    { cycleProgress: 0, pose: neutral },
    { cycleProgress: 0.125, pose: pose('left', -STEP_REACH, -BOUNCE, 'left') },
    { cycleProgress: 0.25, pose: pose('left', -STEP_REACH * 0.55, -BOUNCE * 0.7, 'left') },
    { cycleProgress: 0.375, pose: pose('left', 0, -BOUNCE * 0.25, 'left') },
    { cycleProgress: 0.5, pose: neutral },
    { cycleProgress: 0.625, pose: pose('right', STEP_REACH, -BOUNCE, 'right') },
    { cycleProgress: 0.75, pose: pose('right', STEP_REACH * 0.55, -BOUNCE * 0.7, 'right') },
    { cycleProgress: 0.875, pose: pose('right', 0, -BOUNCE * 0.25, 'right') },
    { cycleProgress: 1, pose: neutral },
  ],
}
