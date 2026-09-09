import { useEffect, useRef, useState } from 'react'
import logoUrl from '../assets/logo.png'
import { AudioPlayer } from '../audio/AudioPlayer'
import type { TimelineViewport } from '../audio/timelineViewport'
import type { TrackTimeline } from '../domain/timeline'
import { createCatalogEntry, type CatalogDraftMetadata } from '../editor/catalogExport'
import { TimelineEditor } from '../editor/TimelineEditor'

const initialMetadata: CatalogDraftMetadata = { trackId: '', title: '', artist: '', rhythmId: 'xote' }

function downloadJson(name: string, value: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}

export function AnnotatorPage() {
  const [metadata, setMetadata] = useState(initialMetadata)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const audioUrlRef = useRef<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [viewport, setViewport] = useState<TimelineViewport>({ start: 0, end: 0 })
  const [timeline, setTimeline] = useState<TrackTimeline>({ trackId: '', rhythmId: 'xote', events: [] })
  const [notice, setNotice] = useState('Escolha um MP3 e informe os dados da música.')

  useEffect(() => () => {
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current)
  }, [])

  const updateMetadata = (field: keyof CatalogDraftMetadata, value: string) => {
    setMetadata((current) => ({ ...current, [field]: value }))
    if (field === 'trackId') setTimeline((current) => ({ ...current, trackId: value }))
    if (field === 'rhythmId') setTimeline((current) => ({ ...current, rhythmId: value }))
  }

  const chooseAudio = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('audio/')) {
      setNotice('Selecione um arquivo de áudio válido.')
      return
    }
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current)
    const nextUrl = URL.createObjectURL(file)
    audioUrlRef.current = nextUrl
    setAudioUrl(nextUrl)
    setNotice(`${file.name} carregado apenas neste navegador.`)
  }

  const validMetadata = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.trackId) && metadata.title.trim() && metadata.artist.trim()
  const ready = Boolean(audioUrl && validMetadata)

  return <main className="app-shell annotator-shell">
    <header className="app-header"><img src={logoUrl} alt="" className="brand-logo" /><div><p className="eyebrow">Ferramenta de catálogo</p><h1>Tools Annotator</h1></div><span className="build-label">V0 · autoria</span></header>
    <section className="draft-card" aria-labelledby="draft-title">
      <div><p className="kicker">Nova música</p><h2 id="draft-title">Prepare a faixa</h2></div>
      <div className="draft-form">
        <label>Arquivo MP3<input type="file" accept="audio/*,.mp3" onChange={(event) => chooseAudio(event.target.files?.[0])} /></label>
        <label>ID da música<input value={metadata.trackId} placeholder="ex.: meu-xote" onChange={(event) => updateMetadata('trackId', event.target.value)} /></label>
        <label>Título<input value={metadata.title} onChange={(event) => updateMetadata('title', event.target.value)} /></label>
        <label>Artista<input value={metadata.artist} onChange={(event) => updateMetadata('artist', event.target.value)} /></label>
        <label>Ritmo<select value={metadata.rhythmId} onChange={(event) => updateMetadata('rhythmId', event.target.value)}><option value="xote">Xote</option></select></label>
      </div>
      {!validMetadata && metadata.trackId ? <p className="field-hint">Use um ID como <code>meu-xote</code>, sem espaços ou maiúsculas.</p> : null}
    </section>
    {ready && audioUrl ? <section className="track-card" aria-labelledby="track-title">
      <div className="track-meta"><div className="album-art" aria-hidden="true"><span>{metadata.title.slice(0, 2).toUpperCase()}</span></div><div><p className="kicker">Faixa em edição</p><h2 id="track-title">{metadata.title}</h2><p className="track-detail">{metadata.artist} · Xote · arquivo local</p></div><button className="button catalog-export" onClick={() => downloadJson(`${metadata.trackId}-catalog-entry.json`, createCatalogEntry(metadata))}>Exportar entrada do catálogo</button></div>
      <TimelineEditor currentTime={currentTime} duration={duration} viewport={viewport.end > viewport.start ? viewport : { start: 0, end: duration }} audioPlayer={<AudioPlayer src={audioUrl} currentTime={currentTime} onCurrentTimeChange={setCurrentTime} onDurationChange={setDuration} onViewportChange={setViewport} />} timeline={timeline} onTimelineChange={setTimeline} onNotice={setNotice} />
    </section> : <section className="annotator-empty"><img src={logoUrl} alt="" /><p>O editor aparece quando o MP3 e os metadados estiverem prontos.</p></section>}
    <footer className="app-footer"><p role="status">{notice}</p><span>Somente processamento local</span></footer>
  </main>
}
