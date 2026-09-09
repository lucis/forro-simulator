import { expect, test } from 'vitest'
import { FRENTE_E_TRAS } from './frenteETras'

test('frente e trás cobre dois ciclos e fecha sem salto', () => {
  expect(FRENTE_E_TRAS.durationInCycles).toBe(2)
  expect(FRENTE_E_TRAS.keyframes[0].cycleProgress).toBe(0)
  expect(FRENTE_E_TRAS.keyframes.at(-1)?.cycleProgress).toBe(1)
  expect(FRENTE_E_TRAS.keyframes.at(-1)?.pose).toEqual(FRENTE_E_TRAS.keyframes[0].pose)
  expect(FRENTE_E_TRAS.keyframes.every((frame, index, all) => index === 0 || frame.cycleProgress > all[index - 1].cycleProgress)).toBe(true)
})
