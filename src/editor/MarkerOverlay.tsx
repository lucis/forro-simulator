import type { PointerEvent } from 'react'
import { XOTE_RHYTHM } from '../domain/rhythm'
import type { RhythmMarker, SectionStart } from '../domain/timeline'

type MarkerOverlayProps = {
  duration: number
  markers: RhythmMarker[]
  sections: SectionStart[]
  selectedId: string | null
  unusualIds: Set<string>
  onSelect(id: string): void
  onMove(id: string, time: number): void
}

function percent(time: number, duration: number) {
  return duration > 0 ? Math.min(100, Math.max(0, (time / duration) * 100)) : 0
}

export function MarkerOverlay({
  duration,
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
    if (!bounds || duration <= 0) return
    const ratio = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width))
    onMove(id, ratio * duration)
  }

  return (
    <div className="timeline-lanes">
      <div className="section-lane" aria-label="Seções da música">
        {sections.map((section) => (
          <span
            className={`section-marker section-marker--${section.section}`}
            key={section.id}
            style={{ left: `${percent(section.t, duration)}%` }}
            title={`${section.t.toFixed(2)}s — ${section.section}`}
          >
            {section.section}
          </span>
        ))}
      </div>
      <div className="marker-lane" aria-label="Marcações da zabumba">
        {markers.map((marker) => {
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
              style={{ left: `${percent(marker.t, duration)}%` }}
              title={`${slot?.danceLabel ?? marker.slotId} · ${marker.t.toFixed(2)}s · ${marker.source}`}
            >
              {slot?.stroke === 'bottom' ? 'C' : 'Z'}
            </button>
          )
        })}
      </div>
    </div>
  )
}
