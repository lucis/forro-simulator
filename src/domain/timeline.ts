export type MarkerSource = 'manual' | 'predicted' | 'corrected'

export type RhythmMarker = {
  id: string
  type: 'rhythm-marker'
  t: number
  slotId: string
  source: MarkerSource
}

export type SectionKind = 'accordion-only' | 'rhythm' | 'break' | 'outro'

export type SectionStart = {
  id: string
  type: 'section-start'
  t: number
  section: SectionKind
}

export type TimelineEvent = RhythmMarker | SectionStart

export type TrackTimeline = {
  trackId: string
  rhythmId: string
  events: TimelineEvent[]
}

export const EMPTY_XOTE_TIMELINE: TrackTimeline = {
  trackId: 'se-tu-quiser',
  rhythmId: 'xote',
  events: [],
}
