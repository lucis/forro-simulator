import { describe, expect, test } from 'vitest'
import { getSectionAtTime, parseTrackTimeline } from './timelineQueries'
import type { TrackTimeline } from '../domain/timeline'

const timeline: TrackTimeline = {
  trackId: 'se-tu-quiser',
  rhythmId: 'xote',
  events: [
    { id: 'rhythm', type: 'section-start', t: 13, section: 'rhythm' },
    {
      id: 'accordion',
      type: 'section-start',
      t: 0,
      section: 'accordion-only',
    },
  ],
}

describe('getSectionAtTime', () => {
  test('retorna a última transição anterior ao tempo consultado', () => {
    expect(getSectionAtTime(timeline, 12.99)).toBe('accordion-only')
    expect(getSectionAtTime(timeline, 13)).toBe('rhythm')
  })

  test('retorna null antes da primeira seção', () => {
    expect(getSectionAtTime(timeline, -1)).toBeNull()
  })
})

describe('parseTrackTimeline', () => {
  test('valida e ordena eventos importados', () => {
    const parsed = parseTrackTimeline(timeline)

    expect(parsed.events.map(({ id }) => id)).toEqual(['accordion', 'rhythm'])
  })

  test('rejeita timestamps inválidos', () => {
    expect(() =>
      parseTrackTimeline({
        ...timeline,
        events: [{ ...timeline.events[0], t: '13' }],
      }),
    ).toThrow('Timeline JSON inválida')
  })
})
