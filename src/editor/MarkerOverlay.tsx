import type { PointerEvent } from 'react'
import {
  timeToViewportPercent,
  viewportRatioToTime,
  type TimelineViewport,
} from '../audio/timelineViewport'
import { XOTE_RHYTHM } from '../domain/rhythm'
import type { RhythmMarker, SectionStart } from '../domain/timeline'

type MarkerOverlayProps = {
  currentTime: number
  viewport: TimelineViewport
  markers: RhythmMarker[]
  sections: SectionStart[]
  selectedId: string | null
  unusualIds: Set<string>
  onSelect(id: string): void
  onMove(id: string, time: number): void
}

function formatRulerTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`
}

export function MarkerOverlay({
  currentTime,
  viewport,
  markers,
  sections,
  selectedId,
  unusualIds,
  onSelect,
  onMove,
}: MarkerOverlayProps) {
  const moveMarker = (event: PointerEvent<HTMLButtonElement>, id: string) => {
    if (event.buttons !== 1) return
    const bounds = event.currentTarget.parentElement?.getBoundingClientRect()
    if (!bounds || viewport.end <= viewport.start) return
    const ratio = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width))
    onMove(id, viewportRatioToTime(ratio, viewport))
  }

  const visibleMarkers = markers.filter(
    ({ t }) => t >= viewport.start && t <= viewport.end,
  )
  const visibleSections = sections.filter(
    ({ t }) => t >= viewport.start && t <= viewport.end,
  )
  const ticks = Array.from({ length: 5 }, (_, index) => {
    const ratio = index / 4
    return viewport.start + ratio * (viewport.end - viewport.start)
  })
  const playheadPercent = timeToViewportPercent(currentTime, viewport)

  return (
    <div className="timeline-lanes">
      <div className="time-ruler" aria-hidden="true">
        {ticks.map((time, index) => (
          <span key={index} style={{ left: `${index * 25}%` }}>
            {formatRulerTime(time)}
          </span>
        ))}
      </div>
      <div className="section-lane" aria-label="Seções da música">
        {visibleSections.map((section) => (
          <span
            className={`section-marker section-marker--${section.section}`}
            key={section.id}
            style={{ left: `${timeToViewportPercent(section.t, viewport)}%` }}
            title={`${section.t.toFixed(2)}s — ${section.section}`}
          >
            {section.section}
          </span>
        ))}
      </div>
      <div className="marker-lane" aria-label="Marcações da zabumba">
        {visibleMarkers.map((marker) => {
          const slot = XOTE_RHYTHM.cycle.find(({ id }) => id === marker.slotId)
          return (
            <button
              aria-label={`${slot?.stroke === 'bottom' ? 'Camarão' : 'Topo'} em ${marker.t.toFixed(2)} segundos`}
              className={[
                'rhythm-marker',
                `rhythm-marker--${slot?.stroke ?? 'top'}`,
                `rhythm-marker--${marker.source}`,
                selectedId === marker.id ? 'is-selected' : '',
                unusualIds.has(marker.id) ? 'is-unusual' : '',
              ].join(' ')}
              key={marker.id}
              onClick={() => onSelect(marker.id)}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId)
                onSelect(marker.id)
              }}
              onPointerMove={(event) => moveMarker(event, marker.id)}
              style={{ left: `${timeToViewportPercent(marker.t, viewport)}%` }}
              title={`${slot?.danceLabel ?? marker.slotId} · ${marker.t.toFixed(2)}s · ${marker.source}`}
            >
              {slot?.stroke === 'bottom' ? 'C' : 'Z'}
            </button>
          )
        })}
      </div>
      {playheadPercent >= 0 && playheadPercent <= 100 ? (
        <span
          className="timeline-playhead"
          aria-hidden="true"
          style={{ left: `${playheadPercent}%` }}
        />
      ) : null}
    </div>
  )
}
