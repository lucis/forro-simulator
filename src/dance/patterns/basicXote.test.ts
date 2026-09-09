import { expect, test } from 'vitest'
import { BASIC_XOTE } from './basicXote'

test('o xote básico cobre dois ciclos e fecha sem salto', () => {
  expect(BASIC_XOTE.durationInCycles).toBe(2)
  expect(BASIC_XOTE.keyframes[0].cycleProgress).toBe(0)
  expect(BASIC_XOTE.keyframes.at(-1)?.cycleProgress).toBe(1)
  expect(BASIC_XOTE.keyframes.at(-1)?.pose).toEqual(BASIC_XOTE.keyframes[0].pose)
  expect(BASIC_XOTE.keyframes.every((frame, index, all) => index === 0 || frame.cycleProgress > all[index - 1].cycleProgress)).toBe(true)
})
