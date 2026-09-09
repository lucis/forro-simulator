import { expect, test } from 'vitest'
import type { DancePattern } from '../domain/dance'
import { interpolatePattern } from './interpolateDance'

const pattern: DancePattern = {
  id: 'test', name: 'Test', durationInCycles: 1,
  keyframes: [
    { cycleProgress: 0, pose: { leader: { leftFoot: { x: 0, z: 0 }, rightFoot: { x: 0, z: 0 }, weight: 'left', rotation: 0, bodyOffset: { x: 0, z: 0 }, bounce: 0 }, follower: { leftFoot: { x: 0, z: 0 }, rightFoot: { x: 0, z: 0 }, weight: 'right', rotation: 0, bodyOffset: { x: 0, z: 0 }, bounce: 0 } } },
    { cycleProgress: 0.5, pose: { leader: { leftFoot: { x: 2, z: 4 }, rightFoot: { x: 0, z: 2 }, weight: 'right', rotation: 1, bodyOffset: { x: 2, z: 2 }, bounce: -0.2 }, follower: { leftFoot: { x: -2, z: -4 }, rightFoot: { x: 0, z: -2 }, weight: 'left', rotation: -1, bodyOffset: { x: -2, z: -2 }, bounce: -0.2 } } },
    { cycleProgress: 1, pose: { leader: { leftFoot: { x: 0, z: 0 }, rightFoot: { x: 0, z: 0 }, weight: 'left', rotation: 0, bodyOffset: { x: 0, z: 0 }, bounce: 0 }, follower: { leftFoot: { x: 0, z: 0 }, rightFoot: { x: 0, z: 0 }, weight: 'right', rotation: 0, bodyOffset: { x: 0, z: 0 }, bounce: 0 } } },
  ],
}

test('interpola campos numéricos e mantém peso discreto', () => {
  const pose = interpolatePattern(pattern, 0.25)
  expect(pose.leader.leftFoot).toEqual({ x: 1, z: 2 })
  expect(pose.leader.rotation).toBe(0.5)
  expect(pose.leader.weight).toBe('left')
})

test('normaliza progresso para manter o loop', () => {
  expect(interpolatePattern(pattern, 1.25)).toEqual(interpolatePattern(pattern, 0.25))
  expect(interpolatePattern(pattern, -0.75)).toEqual(interpolatePattern(pattern, 0.25))
})
