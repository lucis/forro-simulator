import type { Rhythm } from '../domain/rhythm'
import type { RhythmMarker } from '../domain/timeline'

function average(values: number[]) {
  return values.reduce((total, value) => total + value, 0) / values.length
}

function sortMarkers(markers: RhythmMarker[]) {
  return [...markers].sort((a, b) => a.t - b.t || a.id.localeCompare(b.id))
}

function findCompleteCycles(rhythm: Rhythm, markers: RhythmMarker[]) {
  const sorted = sortMarkers(markers)
  const cycleLength = rhythm.cycle.length
  const cycles: RhythmMarker[][] = []

  for (let index = 0; index <= sorted.length - cycleLength; index += 1) {
    const candidate = sorted.slice(index, index + cycleLength)
    const complete = candidate.every(
      (marker, slotIndex) => marker.slotId === rhythm.cycle[slotIndex].id,
    )
    if (complete) cycles.push(candidate)
  }

  return cycles
}

function predictedId(slotId: string, time: number) {
  return `predicted-${slotId}-${Math.round(time * 1_000_000)}`
}

export function predictTimeline({
  rhythm,
  manualMarkers,
  fromTime,
  untilTime,
}: {
  rhythm: Rhythm
  manualMarkers: RhythmMarker[]
  fromTime: number
  untilTime: number
}): RhythmMarker[] {
  const cycles = findCompleteCycles(rhythm, manualMarkers)
  if (cycles.length < 2) return []

  const cycleStarts = cycles.map((cycle) => cycle[0].t)
  const cycleDurations = cycleStarts
    .slice(1)
    .map((start, index) => start - cycleStarts[index])
    .filter((duration) => duration > 0)
  if (cycleDurations.length === 0) return []

  const cycleDuration = average(cycleDurations)
  const offsets = rhythm.cycle.map((_, slotIndex) =>
    average(cycles.map((cycle) => cycle[slotIndex].t - cycle[0].t)),
  )
  const lastCycleStart = cycleStarts.at(-1) ?? 0
  const output: RhythmMarker[] = []

  for (
    let cycleStart = lastCycleStart + cycleDuration;
    cycleStart <= untilTime;
    cycleStart += cycleDuration
  ) {
    rhythm.cycle.forEach((slot, slotIndex) => {
      const t = cycleStart + offsets[slotIndex]
      if (t >= fromTime && t <= untilTime) {
        output.push({
          id: predictedId(slot.id, t),
          type: 'rhythm-marker',
          t,
          slotId: slot.id,
          source: 'predicted',
        })
      }
    })
  }

  return sortMarkers(output)
}

function forwardDistance(rhythm: Rhythm, from: string, to: string) {
  const fromIndex = rhythm.cycle.findIndex(({ id }) => id === from)
  const toIndex = rhythm.cycle.findIndex(({ id }) => id === to)
  if (fromIndex < 0 || toIndex < 0) return 1
  const distance = (toIndex - fromIndex + rhythm.cycle.length) % rhythm.cycle.length
  return distance || rhythm.cycle.length
}

function slotAfter(rhythm: Rhythm, slotId: string, steps: number) {
  const index = rhythm.cycle.findIndex(({ id }) => id === slotId)
  return rhythm.cycle[(Math.max(index, 0) + steps) % rhythm.cycle.length]
}

function stepsAcross(
  rhythm: Rhythm,
  markers: RhythmMarker[],
  fromIndex: number,
  toIndex: number,
) {
  let steps = 0
  for (let index = fromIndex; index < toIndex; index += 1) {
    steps += forwardDistance(
      rhythm,
      markers[index].slotId,
      markers[index + 1].slotId,
    )
  }
  return steps
}

function estimateStepDuration(
  rhythm: Rhythm,
  markers: RhythmMarker[],
  throughIndex: number,
) {
  const start = Math.max(0, throughIndex - rhythm.cycle.length * 2)
  const durations: number[] = []

  for (let index = start; index < throughIndex; index += 1) {
    const delta = markers[index + 1].t - markers[index].t
    const steps = forwardDistance(
      rhythm,
      markers[index].slotId,
      markers[index + 1].slotId,
    )
    if (delta > 0) durations.push(delta / steps)
  }

  return durations.length > 0 ? average(durations) : 0.5
}

export function reflowTimelineFromAnchor({
  rhythm,
  events,
  anchorId,
  untilTime,
}: {
  rhythm: Rhythm
  events: RhythmMarker[]
  anchorId: string
  untilTime: number
}): RhythmMarker[] {
  const sorted = sortMarkers(events)
  const anchorIndex = sorted.findIndex(({ id }) => id === anchorId)
  if (anchorIndex < 0) return sorted

  const result = sorted.slice(0, anchorIndex + 1)
  let currentAnchor = sorted[anchorIndex]
  let currentIndex = anchorIndex
  const laterAnchors = sorted
    .map((marker, index) => ({ marker, index }))
    .filter(
      ({ marker, index }) => index > anchorIndex && marker.source !== 'predicted',
    )

  laterAnchors.forEach(({ marker: nextAnchor, index: nextIndex }) => {
    const steps = stepsAcross(rhythm, sorted, currentIndex, nextIndex)
    const duration = nextAnchor.t - currentAnchor.t

    for (let step = 1; step < steps; step += 1) {
      const slot = slotAfter(rhythm, currentAnchor.slotId, step)
      const t = currentAnchor.t + duration * (step / steps)
      result.push({
        id: predictedId(slot.id, t),
        type: 'rhythm-marker',
        t,
        slotId: slot.id,
        source: 'predicted',
      })
    }

    result.push(nextAnchor)
    currentAnchor = nextAnchor
    currentIndex = nextIndex
  })

  const stepDuration = estimateStepDuration(rhythm, sorted, currentIndex)
  for (let step = 1; ; step += 1) {
    const t = currentAnchor.t + step * stepDuration
    if (t > untilTime) break
    const slot = slotAfter(rhythm, currentAnchor.slotId, step)
    result.push({
      id: predictedId(slot.id, t),
      type: 'rhythm-marker',
      t,
      slotId: slot.id,
      source: 'predicted',
    })
  }

  return sortMarkers(result)
}
