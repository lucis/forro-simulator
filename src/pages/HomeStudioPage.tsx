import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import logoUrl from '../assets/logo.png'
import { AudioPlayer } from '../audio/AudioPlayer'
import type { TimelineViewport } from '../audio/timelineViewport'
import type { TrackCatalog, TrackCatalogEntry } from '../catalog/catalog'
import { loadCatalog, loadCatalogTrack } from '../catalog/catalogRepository'
import { DanceControls } from '../components/DanceControls'
import { DanceCount } from '../components/DanceCount'
import type { CameraPreset } from '../dance/DanceScene'
import { getDanceClockState } from '../dance/danceClock'
import { interpolatePattern } from '../dance/interpolateDance'
import { DEFAULT_XOTE_PATTERN, XOTE_PATTERNS } from '../dance/patterns'
import { XOTE_RHYTHM } from '../domain/rhythm'
import type { TrackTimeline } from '../domain/timeline'

const DanceStage = lazy(() => import('../dance/DanceStage').then((module) => ({ default: module.DanceStage })))

type Props = {
  catalogLoader?: () => Promise<TrackCatalog>
  timelineLoader?: (entry: TrackCatalogEntry) => Promise<TrackTimeline>
}

const rhythmName = (id: string) => id === 'xote' ? 'Xote' : id === 'baiao' ? 'Baião' : id

export function HomeStudioPage({ catalogLoader = loadCatalog, timelineLoader = loadCatalogTrack }: Props) {
  const [catalog, setCatalog] = useState<TrackCatalog | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [started, setStarted] = useState(false)
  const [timeline, setTimeline] = useState<TrackTimeline | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [viewport, setViewport] = useState<TimelineViewport>({ start: 0, end: 0 })
  const [camera, setCamera] = useState<CameraPreset>('front')
  const [showLeader, setShowLeader] = useState(true)
  const [showFollower, setShowFollower] = useState(true)
  const [patternId, setPatternId] = useState(DEFAULT_XOTE_PATTERN.id)
  const pattern = XOTE_PATTERNS.find(({ id }) => id === patternId) ?? DEFAULT_XOTE_PATTERN

  const chooseTrack = (id: string) => {
    setStarted(false)
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
    if (!selected || !started) return
    let active = true
    timelineLoader(selected).then((next) => active && setTimeline(next)).catch(() => active && setError('Não foi possível carregar esta música'))
    return () => { active = false }
  }, [selected, started, timelineLoader])

  const rhythmGroups = useMemo(() => {
    const ids = [...new Set(catalog?.tracks.map(({ rhythmId }) => rhythmId) ?? [])]
    return ids.map((rhythmId) => ({ rhythmId, tracks: catalog?.tracks.filter((track) => track.rhythmId === rhythmId) ?? [] }))
  }, [catalog])
  const rhythm = selected?.rhythmId === 'xote' ? XOTE_RHYTHM : null
  const clock = timeline && rhythm ? getDanceClockState({ time: currentTime, timeline, rhythm }) : null
  const patternProgress = clock ? ((clock.cycleIndex + clock.cycleProgress) / pattern.durationInCycles) % 1 : 0
  const pose = clock?.active ? interpolatePattern(pattern, patternProgress) : pattern.keyframes[0].pose
  const lastMarkerTime = timeline?.events.filter(({ type }) => type === 'rhythm-marker').at(-1)?.t ?? Number.POSITIVE_INFINITY
  const countLabel = clock?.active ? clock.danceLabel ?? '—' : currentTime >= lastMarkerTime ? 'Fim' : clock?.section ? 'Pausa' : 'Prepare-se'

  return (
    <main className="studio-shell">
      <header className="studio-header">
        <img src={logoUrl} alt="" className="studio-logo" />
        <div><p className="eyebrow">Música que faz dançar</p><h1>Simulador de Forró</h1></div>
        <span className="studio-badge">V0</span>
      </header>
      <section className="hero" aria-labelledby="hero-title">
        <h2 id="hero-title">Tem dificuldade em dançar forró no ritmo?</h2>
        <p className="hero-subtitle">Aprenda com o Simulador de Forró.</p>
        <ol className="hero-steps">
          <li><span className="hero-step-number" aria-hidden="true">1</span>Escolha um estilo e uma música</li>
          <li><span className="hero-step-number" aria-hidden="true">2</span>Aperte em simular e ajuste os controles</li>
        </ol>
      </section>
      <section className="catalog-panel" aria-labelledby="catalog-title">
        <p className="kicker">Catálogo</p><h2 id="catalog-title">Selecione o ritmo e música</h2>
        <label className="visually-hidden" htmlFor="track-select">Música</label>
        <select id="track-select" className="track-select" value={selectedId ?? ''} onChange={(event) => chooseTrack(event.target.value)}>
          {rhythmGroups.map(({ rhythmId, tracks }) => (
            <optgroup label={rhythmName(rhythmId)} key={rhythmId}>
              {tracks.map((track) => <option key={track.id} value={track.id}>{`${rhythmName(track.rhythmId)} | ${track.title} - ${track.artist}`}</option>)}
            </optgroup>
          ))}
        </select>
        <button className="button button--primary simulate-button" disabled={!selected} onClick={() => setStarted(true)}>Simular</button>
      </section>
      {!catalog && !error ? <p className="loading-state">Carregando catálogo…</p> : null}
      {error ? <p className="error-state" role="alert">{error}</p> : null}
      {started && selected ? (
        <section className="studio-player" aria-label={`Dançando ${selected.title}`}>
          <div className="stage-wrap">
            <Suspense fallback={<div className="dance-stage stage-loading">Montando o salão…</div>}><DanceStage pose={pose} showLeader={showLeader} showFollower={showFollower} camera={camera} /></Suspense>
            <DanceCount label={countLabel} active={Boolean(clock?.active)} />
          </div>
          <DanceControls camera={camera} onCameraChange={setCamera} showLeader={showLeader} showFollower={showFollower} onLeaderChange={setShowLeader} onFollowerChange={setShowFollower} patterns={XOTE_PATTERNS} patternId={patternId} onPatternChange={setPatternId} />
          {timeline ? <AudioPlayer key={selected.id} src={selected.audioUrl} currentTime={currentTime} onCurrentTimeChange={setCurrentTime} onDurationChange={setDuration} onViewportChange={setViewport} waveformHeight={48} /> : <p className="loading-state">Carregando música…</p>}
          <span className="visually-hidden">{duration} {viewport.start}</span>
        </section>
      ) : null}
    </main>
  )
}
