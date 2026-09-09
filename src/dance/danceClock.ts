import { getSectionAtTime, sortTimelineEvents } from '../audio/timelineQueries'
import type { Rhythm } from '../domain/rhythm'
import type { RhythmMarker, SectionKind, TrackTimeline } from '../domain/timeline'

export type DanceClockState = {
  active: boolean
  currentMarker: RhythmMarker | null
  nextMarker: RhythmMarker | null
  slotId: string | null
  slotProgress: number
  cycleIndex: number
  cycleProgress: number
  danceLabel: string | null
  section: SectionKind | null
}

const inactive = (section: SectionKind | null): DanceClockState => ({ active: false, currentMarker: null, nextMarker: null, slotId: null, slotProgress: 0, cycleIndex: 0, cycleProgress: 0, danceLabel: null, section })

export function getDanceClockState({ time, timeline, rhythm }: { time: number; timeline: TrackTimeline; rhythm: Rhythm }): DanceClockState {
  const section = getSectionAtTime(timeline, time)
  if (section && section !== 'rhythm') return inactive(section)
  const markers = sortTimelineEvents(timeline.events).filter((event): event is RhythmMarker => event.type === 'rhythm-marker')
  const index = markers.findIndex((marker, markerIndex) => marker.t <= time && (markers[markerIndex + 1]?.t ?? -1) > time)
  if (index < 0) return inactive(section)
  const currentMarker = markers[index]
  const nextMarker = markers[index + 1]
  if (!nextMarker || nextMarker.t <= currentMarker.t) return inactive(section)
  const slotIndex = rhythm.cycle.findIndex(({ id }) => id === currentMarker.slotId)
  if (slotIndex < 0) return inactive(section)
  const slotProgress = Math.min(1, Math.max(0, (time - currentMarker.t) / (nextMarker.t - currentMarker.t)))
  const firstSlotIndex = Math.max(0, rhythm.cycle.findIndex(({ id }) => id === markers[0].slotId))
  return {
    active: true,
    currentMarker,
    nextMarker,
    slotId: currentMarker.slotId,
    slotProgress,
    cycleIndex: Math.floor((firstSlotIndex + index) / rhythm.cycle.length),
    cycleProgress: (slotIndex + slotProgress) / rhythm.cycle.length,
    danceLabel: rhythm.cycle[slotIndex].danceLabel,
    section,
  }
}
