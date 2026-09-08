import type {
  MarkerSource,
  SectionKind,
  SectionStart,
  TimelineEvent,
  TrackTimeline,
} from '../domain/timeline'

const markerSources: MarkerSource[] = ['manual', 'predicted', 'corrected']
const sectionKinds: SectionKind[] = [
  'accordion-only',
  'rhythm',
  'break',
  'outro',
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function hasBaseEvent(value: Record<string, unknown>) {
  return (
    typeof value.id === 'string' &&
    typeof value.t === 'number' &&
    Number.isFinite(value.t) &&
    value.t >= 0
  )
}

function isTimelineEvent(value: unknown): value is TimelineEvent {
  if (!isRecord(value) || !hasBaseEvent(value)) return false

  if (value.type === 'rhythm-marker') {
    return (
      typeof value.slotId === 'string' &&
      markerSources.includes(value.source as MarkerSource)
    )
  }

  if (value.type === 'section-start') {
    return sectionKinds.includes(value.section as SectionKind)
  }

  return false
}

export function sortTimelineEvents(events: TimelineEvent[]) {
  return [...events].sort((a, b) => a.t - b.t || a.id.localeCompare(b.id))
}

export function getSectionAtTime(
  timeline: TrackTimeline,
  time: number,
): SectionKind | null {
  const sections = timeline.events
    .filter(
      (event): event is SectionStart =>
        event.type === 'section-start' && event.t <= time,
    )
    .sort((a, b) => b.t - a.t)

  return sections[0]?.section ?? null
}

export function parseTrackTimeline(value: unknown): TrackTimeline {
  if (
    !isRecord(value) ||
    typeof value.trackId !== 'string' ||
    typeof value.rhythmId !== 'string' ||
    !Array.isArray(value.events) ||
    !value.events.every(isTimelineEvent)
  ) {
    throw new Error('Timeline JSON inválida')
  }

  return {
    trackId: value.trackId,
    rhythmId: value.rhythmId,
    events: sortTimelineEvents(value.events),
  }
}
