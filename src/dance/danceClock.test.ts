import { describe, expect, test } from 'vitest'
import { XOTE_RHYTHM } from '../domain/rhythm'
import type { TimelineEvent, TrackTimeline } from '../domain/timeline'
import { getDanceClockState } from './danceClock'

const marker = (id: string, t: number, slotId: string): TimelineEvent => ({ id, t, slotId, type: 'rhythm-marker', source: 'manual' })
const timeline = (events: TimelineEvent[]): TrackTimeline => ({ trackId: 'test', rhythmId: 'xote', events })
const beatEvents = [marker('a', 1, 'z1'), marker('b', 2, 'z2'), marker('c', 3, 'z3'), marker('d', 4, 'camarao'), marker('e', 5, 'z1')]

describe('getDanceClockState', () => {
  test('fica inativo antes da primeira e depois da última batida', () => {
    expect(getDanceClockState({ time: 0.9, timeline: timeline(beatEvents), rhythm: XOTE_RHYTHM }).active).toBe(false)
    expect(getDanceClockState({ time: 5, timeline: timeline(beatEvents), rhythm: XOTE_RHYTHM }).active).toBe(false)
  })

  test('calcula progresso e contagem dentro do intervalo', () => {
    expect(getDanceClockState({ time: 1.5, timeline: timeline(beatEvents), rhythm: XOTE_RHYTHM })).toMatchObject({
      active: true,
      slotId: 'z1',
      slotProgress: 0.5,
      cycleIndex: 0,
      cycleProgress: 0.125,
      danceLabel: '1',
    })
  })

  test('seções explícitas pausam e retomam a dança', () => {
    const events: TimelineEvent[] = [...beatEvents, { id: 'pause', type: 'section-start', t: 1.2, section: 'accordion-only' }, { id: 'resume', type: 'section-start', t: 2.2, section: 'rhythm' }]
    expect(getDanceClockState({ time: 1.5, timeline: timeline(events), rhythm: XOTE_RHYTHM }).active).toBe(false)
    expect(getDanceClockState({ time: 2.5, timeline: timeline(events), rhythm: XOTE_RHYTHM }).active).toBe(true)
  })
})
