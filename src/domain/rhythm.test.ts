import { expect, test } from 'vitest'
import { XOTE_RHYTHM, getNextSlot, getSlotForStroke } from './rhythm'

test('avança ciclicamente pelos slots do xote', () => {
  expect(getNextSlot(XOTE_RHYTHM, null).id).toBe('z1')
  expect(getNextSlot(XOTE_RHYTHM, 'z3').id).toBe('camarao')
  expect(getNextSlot(XOTE_RHYTHM, 'camarao').id).toBe('z1')
})

test('uma tecla inesperada escolhe o próximo slot do golpe solicitado', () => {
  const result = getSlotForStroke(XOTE_RHYTHM, 'z1', 'bottom')

  expect(result.slot.id).toBe('camarao')
  expect(result.unusual).toBe(true)
})
