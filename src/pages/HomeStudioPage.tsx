import { useEffect, useMemo, useState } from 'react'
import logoUrl from '../assets/logo.png'
import { AudioPlayer } from '../audio/AudioPlayer'
import type { TimelineViewport } from '../audio/timelineViewport'
import type { TrackCatalog, TrackCatalogEntry } from '../catalog/catalog'
import { loadCatalog, loadCatalogTrack } from '../catalog/catalogRepository'
import type { TrackTimeline } from '../domain/timeline'

type Props = {
  catalogLoader?: () => Promise<TrackCatalog>
  timelineLoader?: (entry: TrackCatalogEntry) => Promise<TrackTimeline>
}

const rhythmName = (id: string) => id === 'xote' ? 'Xote' : id === 'baiao' ? 'Baião' : id

export function HomeStudioPage({ catalogLoader = loadCatalog, timelineLoader = loadCatalogTrack }: Props) {
  const [catalog, setCatalog] = useState<TrackCatalog | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')
  const [timeline, setTimeline] = useState<TrackTimeline | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [viewport, setViewport] = useState<TimelineViewport>({ start: 0, end: 0 })

  const chooseTrack = (id: string) => {
    setTimeline(null)
    setError(null)
    setCurrentTime(0)
    setDuration(0)
    setSelectedId(id)
  }

  useEffect(() => {
    let active = true
    catalogLoader().then((next) => {
      if (!active) return
      setCatalog(next)
      setSelectedId(next.tracks[0]?.id ?? null)
    }).catch(() => active && setError('Não foi possível carregar o catálogo'))
    return () => { active = false }
  }, [catalogLoader])

  const selected = catalog?.tracks.find(({ id }) => id === selectedId) ?? null
  useEffect(() => {
    if (!selected) return
    let active = true
    timelineLoader(selected).then((next) => active && setTimeline(next)).catch(() => active && setError('Não foi possível carregar esta música'))
    return () => { active = false }
  }, [selected, timelineLoader])

  const rhythms = useMemo(() => [...new Set(catalog?.tracks.map(({ rhythmId }) => rhythmId) ?? [])], [catalog])
  const visibleTracks = catalog?.tracks.filter(({ rhythmId }) => filter === 'all' || rhythmId === filter) ?? []
  const chooseFilter = (rhythmId: string) => {
    setFilter(rhythmId)
    const first = catalog?.tracks.find((track) => rhythmId === 'all' || track.rhythmId === rhythmId)
    if (first) chooseTrack(first.id)
  }

  return (
    <main className="studio-shell">
      <header className="studio-header">
        <img src={logoUrl} alt="" className="studio-logo" />
        <div><p className="eyebrow">Música que faz dançar</p><h1>Simulador de Forró</h1></div>
        <span className="studio-badge">V0</span>
      </header>
      <section className="catalog-panel" aria-labelledby="catalog-title">
        <p className="kicker">Catálogo</p><h2 id="catalog-title">Escolha o ritmo</h2>
        <div className="rhythm-rail" aria-label="Ritmos">
          <button aria-pressed={filter === 'all'} onClick={() => chooseFilter('all')}>Todos</button>
          {rhythms.map((id) => <button aria-pressed={filter === id} key={id} onClick={() => chooseFilter(id)}>{rhythmName(id)}</button>)}
        </div>
        <div className="track-rail" aria-label="Músicas">
          {visibleTracks.map((track) => <button aria-pressed={selectedId === track.id} className="track-option" key={track.id} onClick={() => chooseTrack(track.id)}><span>{track.title}</span><small>{track.artist}</small></button>)}
        </div>
      </section>
      {!catalog && !error ? <p className="loading-state">Carregando catálogo…</p> : null}
      {error ? <p className="error-state" role="alert">{error}</p> : null}
      {selected ? (
        <section className="studio-player" aria-labelledby="selected-track-title">
          <div className="selected-track-copy"><p className="kicker">Agora dançando</p><h2 id="selected-track-title">{selected.title}</h2><p>{selected.artist} · {rhythmName(selected.rhythmId)}</p></div>
          <div className="dance-stage-placeholder" aria-label="Palco de dança"><img src={logoUrl} alt="Casal dançando forró" /><div><span>Palco em preparação</span><strong>1 · 2 · 3 · pausa</strong></div></div>
          {timeline ? <AudioPlayer key={selected.id} src={selected.audioUrl} currentTime={currentTime} onCurrentTimeChange={setCurrentTime} onDurationChange={setDuration} onViewportChange={setViewport} /> : null}
          <span className="visually-hidden">{duration} {viewport.start}</span>
        </section>
      ) : null}
    </main>
  )
}
