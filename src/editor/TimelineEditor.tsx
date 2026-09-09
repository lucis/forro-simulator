import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { predictTimeline, reflowTimelineFromAnchor } from '../audio/timelinePrediction'
import { getSectionAtTime, parseTrackTimeline, sortTimelineEvents } from '../audio/timelineQueries'
import type { TimelineViewport } from '../audio/timelineViewport'
import { XOTE_RHYTHM, getNextSlot, getSlotForStroke } from '../domain/rhythm'
import type { RhythmMarker, SectionKind, SectionStart, TrackTimeline } from '../domain/timeline'
import { MarkerOverlay } from './MarkerOverlay'
import { TimelineToolbar } from './TimelineToolbar'

type TimelineEditorProps = {
  currentTime: number
  duration: number
  viewport: TimelineViewport
  audioPlayer: ReactNode
  timeline: TrackTimeline
  onTimelineChange(timeline: TrackTimeline): void
  onNotice(message: string): void
}

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

export function TimelineEditor({ currentTime, duration, viewport, audioPlayer, timeline, onTimelineChange, onNotice }: TimelineEditorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [unusualIds, setUnusualIds] = useState<Set<string>>(() => new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const markers = useMemo(
    () => timeline.events.filter((event): event is RhythmMarker => event.type === 'rhythm-marker'),
    [timeline.events],
  )
  const sections = useMemo(
    () => timeline.events.filter((event): event is SectionStart => event.type === 'section-start'),
    [timeline.events],
  )
  const currentSection = getSectionAtTime(timeline, currentTime)
  const selectedMarker = markers.find(({ id }) => id === selectedId) ?? null
  const explicitMarkers = markers.filter(({ source }) => source !== 'predicted')
  const lastMarkerBeforeCursor = [...markers]
    .filter(({ t }) => t <= currentTime)
    .sort((a, b) => b.t - a.t)[0]
  const nextSlot = getNextSlot(XOTE_RHYTHM, lastMarkerBeforeCursor?.slotId ?? null)

  const changeEvents = (events: TrackTimeline['events']) => {
    onTimelineChange({ ...timeline, events: sortTimelineEvents(events) })
  }

  const addRhythmMarker = (stroke: 'top' | 'bottom') => {
    const { slot, unusual } = getSlotForStroke(
      XOTE_RHYTHM,
      lastMarkerBeforeCursor?.slotId ?? null,
      stroke,
    )
    const marker: RhythmMarker = {
      id: createId('marker'),
      type: 'rhythm-marker',
      t: currentTime,
      slotId: slot.id,
      source: 'manual',
    }
    if (unusual) {
      setUnusualIds((ids) => new Set(ids).add(marker.id))
      onNotice(`Sequência incomum: ${stroke === 'bottom' ? 'C' : 'Z'} registrado como ${slot.id}.`)
    }
    changeEvents([...timeline.events, marker])
    setSelectedId(marker.id)
  }

  const addSection = (section: SectionKind) => {
    const event: SectionStart = {
      id: createId('section'),
      type: 'section-start',
      t: currentTime,
      section,
    }
    changeEvents([...timeline.events, event])
    onNotice(`Seção “${section}” iniciada em ${currentTime.toFixed(2)}s.`)
  }

  const deleteSelected = () => {
    if (!selectedId) return
    changeEvents(timeline.events.filter(({ id }) => id !== selectedId))
    setUnusualIds((ids) => {
      const next = new Set(ids)
      next.delete(selectedId)
      return next
    })
    setSelectedId(null)
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      if (
        event.repeat || event.metaKey || event.ctrlKey ||
        target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
      ) return

      if (event.key.toLowerCase() === 'z') addRhythmMarker('top')
      if (event.key.toLowerCase() === 'c') addRhythmMarker('bottom')
      if (event.key.toLowerCase() === 'a') addSection('accordion-only')
      if (event.key.toLowerCase() === 'r') addSection('rhythm')
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault()
        deleteSelected()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const moveMarker = (id: string, time: number) => {
    changeEvents(timeline.events.map((event) =>
      event.id === id && event.type === 'rhythm-marker'
        ? { ...event, t: time, source: 'corrected' }
        : event,
    ))
  }

  const predict = () => {
    const predictions = predictTimeline({
      rhythm: XOTE_RHYTHM,
      manualMarkers: explicitMarkers,
      fromTime: Math.max(0, ...explicitMarkers.map(({ t }) => t)) + 0.000_001,
      untilTime: duration,
    })
    const preserved = timeline.events.filter(
      (event) => event.type !== 'rhythm-marker' || event.source !== 'predicted',
    )
    changeEvents([...preserved, ...predictions])
    onNotice(`${predictions.length} marcações previstas até o fim da faixa.`)
  }

  const reflow = () => {
    if (!selectedMarker) return
    const nextMarkers = reflowTimelineFromAnchor({
      rhythm: XOTE_RHYTHM,
      events: markers,
      anchorId: selectedMarker.id,
      untilTime: duration,
    })
    changeEvents([...sections, ...nextMarkers])
    onNotice('Timeline recalculada a partir da âncora selecionada.')
  }

  const exportTimeline = () => {
    const blob = new Blob([JSON.stringify(timeline, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${timeline.trackId}-timeline.json`
    link.click()
    URL.revokeObjectURL(url)
    onNotice('Timeline exportada em JSON.')
  }

  const importTimeline = async (file: File | undefined) => {
    if (!file) return
    try {
      const parsed = parseTrackTimeline(JSON.parse(await file.text()))
      onTimelineChange(parsed)
      setSelectedId(null)
      setUnusualIds(new Set())
      onNotice(`${parsed.events.length} eventos importados.`)
    } catch {
      onNotice('Não foi possível importar: o JSON da timeline é inválido.')
    }
  }

  const clearTimeline = () => {
    if (!window.confirm('Remover todas as marcações desta timeline?')) return
    changeEvents([])
    setSelectedId(null)
    setUnusualIds(new Set())
    onNotice('Timeline limpa.')
  }

  return (
    <section className="editor-panel" aria-labelledby="editor-title">
      <div className="panel-heading">
        <div><p className="kicker">Timeline musical</p><h2 id="editor-title">Editor de ritmo</h2></div>
        <div className="editor-readout">
          <span>Próximo</span><strong>{nextSlot.id === 'camarao' ? 'C' : 'Z'}</strong><small>{nextSlot.danceLabel}</small>
        </div>
      </div>
      <TimelineToolbar
        canPredict={explicitMarkers.length >= XOTE_RHYTHM.cycle.length * 2 && duration > 0}
        canReflow={selectedMarker?.source === 'corrected'}
        fileInputRef={fileInputRef}
        onPredict={predict}
        onReflow={reflow}
        onExport={exportTimeline}
        onImport={(event) => void importTimeline(event.target.files?.[0])}
        onClear={clearTimeline}
      />
      <div
        className="timeline-surface"
        role="region"
        aria-label="Timeline alinhada ao áudio"
      >
        <MarkerOverlay
          currentTime={currentTime}
          viewport={viewport}
          markers={markers}
          sections={sections}
          selectedId={selectedId}
          unusualIds={unusualIds}
          onSelect={setSelectedId}
          onMove={moveMarker}
        />
        {audioPlayer}
      </div>
      <div className="timeline-summary">
        <span><b>{markers.length}</b> batidas</span>
        <span><b>{sections.length}</b> seções</span>
        <span>Seção atual: <b>{currentSection ?? 'não definida'}</b></span>
      </div>
    </section>
  )
}
