export type ZabumbaStroke = 'top' | 'bottom'

export type RhythmSlot = {
  id: string
  stroke: ZabumbaStroke
  danceLabel: string
}

export type Rhythm = {
  id: string
  name: string
  cycle: RhythmSlot[]
}

export const XOTE_RHYTHM: Rhythm = {
  id: 'xote',
  name: 'Xote',
  cycle: [
    { id: 'z1', stroke: 'top', danceLabel: '1' },
    { id: 'z2', stroke: 'top', danceLabel: '2' },
    { id: 'z3', stroke: 'top', danceLabel: '3' },
    { id: 'camarao', stroke: 'bottom', danceLabel: 'pausa' },
  ],
}

export function getNextSlot(rhythm: Rhythm, lastSlotId: string | null) {
  if (rhythm.cycle.length === 0) {
    throw new Error('O ritmo precisa ter pelo menos um slot')
  }

  const lastIndex = rhythm.cycle.findIndex(({ id }) => id === lastSlotId)
  return rhythm.cycle[(lastIndex + 1) % rhythm.cycle.length]
}

export function getSlotForStroke(
  rhythm: Rhythm,
  lastSlotId: string | null,
  stroke: ZabumbaStroke,
) {
  const expected = getNextSlot(rhythm, lastSlotId)

  if (expected.stroke === stroke) {
    return { slot: expected, unusual: false }
  }

  const expectedIndex = rhythm.cycle.indexOf(expected)
  const slot = Array.from({ length: rhythm.cycle.length }, (_, offset) =>
    rhythm.cycle[(expectedIndex + offset) % rhythm.cycle.length],
  ).find((candidate) => candidate.stroke === stroke)

  return { slot: slot ?? expected, unusual: true }
}
