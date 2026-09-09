import { expect, test } from 'vitest'
import {
  timeToViewportPercent,
  viewportRatioToTime,
} from '../audio/timelineViewport'

const viewport = { start: 20, end: 30 }

test('posiciona um marcador na janela temporal visível', () => {
  expect(timeToViewportPercent(20, viewport)).toBe(0)
  expect(timeToViewportPercent(25, viewport)).toBe(50)
  expect(timeToViewportPercent(30, viewport)).toBe(100)
})

test('converte o arraste usando a janela ampliada, não a duração total', () => {
  expect(viewportRatioToTime(0.5, viewport)).toBe(25)
  expect(viewportRatioToTime(-1, viewport)).toBe(20)
  expect(viewportRatioToTime(2, viewport)).toBe(30)
})
