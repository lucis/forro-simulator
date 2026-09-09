import type { CouplePose, DancePattern, Weight } from '../../domain/dance'

function dancer(z: number, moving: 'left' | 'right' | 'none', weight: Weight, facing: number) {
  return {
    leftFoot: { x: -0.14, z: z + (moving === 'left' ? 0.22 : 0) },
    rightFoot: { x: 0.14, z: z + (moving === 'right' ? 0.22 : 0) },
    weight,
    rotation: facing,
    bodyOffset: { x: 0, z },
  }
}

function pose(z: number, moving: 'left' | 'right' | 'none', weight: Weight): CouplePose {
  return {
    leader: dancer(z, moving, weight, 0),
    follower: dancer(-z, moving === 'left' ? 'right' : moving === 'right' ? 'left' : 'none', weight === 'left' ? 'right' : weight === 'right' ? 'left' : 'center', Math.PI),
  }
}

const neutral = pose(0, 'none', 'center')

export const BASIC_XOTE: DancePattern = {
  id: 'basic-xote',
  name: 'Básico do xote',
  durationInCycles: 2,
  keyframes: [
    { cycleProgress: 0, pose: neutral },
    { cycleProgress: 0.125, pose: pose(0.08, 'left', 'right') },
    { cycleProgress: 0.25, pose: pose(0.16, 'right', 'left') },
    { cycleProgress: 0.375, pose: pose(0.22, 'left', 'right') },
    { cycleProgress: 0.5, pose: pose(0.22, 'none', 'center') },
    { cycleProgress: 0.625, pose: pose(0.14, 'right', 'left') },
    { cycleProgress: 0.75, pose: pose(0.06, 'left', 'right') },
    { cycleProgress: 0.875, pose: pose(0, 'right', 'left') },
    { cycleProgress: 1, pose: neutral },
  ],
}
