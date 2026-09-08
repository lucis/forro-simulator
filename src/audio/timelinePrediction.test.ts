import { describe, expect, test } from 'vitest'
import { XOTE_RHYTHM } from '../domain/rhythm'
import type { RhythmMarker } from '../domain/timeline'
import { predictTimeline, reflowTimelineFromAnchor } from './timelinePrediction'

const manual = (t: number, slotId: string): RhythmMarker => ({
  id: `manual-${slotId}-${t}`,
  type: 'rhythm-marker',
  t,
  slotId,
  source: 'manual',
})

describe('predictTimeline', () => {
  test('repete a sequência com o tempo médio de dois ciclos', () => {
    const manualMarkers = [
      manual(0, 'z1'),
      manual(0.38, 'z2'),
      manual(0.74, 'z3'),
      manual(1.12, 'camarao'),
      manual(1.51, 'z1'),
      manual(1.89, 'z2'),
      manual(2.25, 'z3'),
      manual(2.63, 'camarao'),
    ]

    const result = predictTimeline({
      rhythm: XOTE_RHYTHM,
      manualMarkers,
      fromTime: 2.64,
      untilTime: 4.2,
    })

    expect(result.map(({ slotId }) => slotId)).toEqual([
      'z1',
      'z2',
      'z3',
      'camarao',
    ])
    expect(result.map(({ t }) => t)).toEqual([
      expect.closeTo(3.02, 5),
      expect.closeTo(3.4, 5),
      expect.closeTo(3.76, 5),
      expect.closeTo(4.14, 5),
    ])
    expect(result.every(({ source }) => source === 'predicted')).toBe(true)
    expect(result.every((marker, index) => index === 0 || marker.t > result[index - 1].t)).toBe(true)
    expect(result.every(({ t }) => t <= 4.2)).toBe(true)
  })

  test('exige pelo menos dois ciclos completos', () => {
    const result = predictTimeline({
      rhythm: XOTE_RHYTHM,
      manualMarkers: [
        manual(0, 'z1'),
        manual(0.4, 'z2'),
        manual(0.8, 'z3'),
        manual(1.2, 'camarao'),
      ],
      fromTime: 0,
      untilTime: 10,
    })

    expect(result).toEqual([])
  })

  test('faz a média de offsets manuais irregulares', () => {
    const result = predictTimeline({
      rhythm: XOTE_RHYTHM,
      manualMarkers: [
        manual(0, 'z1'),
        manual(0.3, 'z2'),
        manual(0.8, 'z3'),
        manual(1.15, 'camarao'),
        manual(1.6, 'z1'),
        manual(2.0, 'z2'),
        manual(2.35, 'z3'),
        manual(2.85, 'camarao'),
      ],
      fromTime: 3,
      untilTime: 4,
    })

    expect(result.map(({ t }) => t)).toEqual([
      expect.closeTo(3.2, 5),
      expect.closeTo(3.55, 5),
      expect.closeTo(3.975, 5),
    ])
  })
})

describe('reflowTimelineFromAnchor', () => {
  test('interpola marcadores previstos entre duas âncoras explícitas', () => {
    const events: RhythmMarker[] = [
      manual(0, 'z1'),
      { ...manual(1, 'z2'), id: 'p1', source: 'predicted' },
      { ...manual(2, 'z3'), id: 'p2', source: 'predicted' },
      { ...manual(3, 'camarao'), id: 'p3', source: 'predicted' },
      { ...manual(4.4, 'z1'), id: 'anchor-b', source: 'corrected' },
    ]

    const result = reflowTimelineFromAnchor({
      rhythm: XOTE_RHYTHM,
      events,
      anchorId: events[0].id,
      untilTime: 4.4,
    })

    expect(result.map(({ t }) => t)).toEqual([
      0,
      expect.closeTo(1.1, 5),
      expect.closeTo(2.2, 5),
      expect.closeTo(3.3, 5),
      4.4,
    ])
    expect(result.at(-1)).toMatchObject({ id: 'anchor-b', source: 'corrected' })
  })
})
