import { expect, test } from 'vitest'
import { DOIS_PRA_LA_DOIS_PRA_CA } from './doisPraLaDoisPraCa'

test('dois pra lá dois pra cá cobre dois ciclos e fecha sem salto', () => {
  expect(DOIS_PRA_LA_DOIS_PRA_CA.durationInCycles).toBe(2)
  expect(DOIS_PRA_LA_DOIS_PRA_CA.keyframes[0].cycleProgress).toBe(0)
  expect(DOIS_PRA_LA_DOIS_PRA_CA.keyframes.at(-1)?.cycleProgress).toBe(1)
  expect(DOIS_PRA_LA_DOIS_PRA_CA.keyframes.at(-1)?.pose).toEqual(DOIS_PRA_LA_DOIS_PRA_CA.keyframes[0].pose)
  expect(DOIS_PRA_LA_DOIS_PRA_CA.keyframes.every((frame, index, all) => index === 0 || frame.cycleProgress > all[index - 1].cycleProgress)).toBe(true)
})
