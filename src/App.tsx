import { useState } from 'react'
import { AudioPlayer } from './audio/AudioPlayer'
import { parseTrackTimeline } from './audio/timelineQueries'
import type { TimelineViewport } from './audio/timelineViewport'
import initialTimeline from './data/xoteTimeline.json'
import type { TrackTimeline } from './domain/timeline'
import { TimelineEditor } from './editor/TimelineEditor'
import './index.css'

function App() {
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [viewport, setViewport] = useState<TimelineViewport>({ start: 0, end: 0 })
  const [timeline, setTimeline] = useState<TrackTimeline>(() => parseTrackTimeline(initialTimeline))
  const [notice, setNotice] = useState('Marque dois ciclos completos para calibrar a previsão.')

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-mark" aria-hidden="true">FS</div>
        <div><p className="eyebrow">Laboratório de ritmo</p><h1 id="app-title">Forró Simulator</h1></div>
        <span className="build-label">V0 · anotação</span>
      </header>
      <section className="track-card" aria-labelledby="track-title">
        <div className="track-meta">
          <div className="album-art" aria-hidden="true"><span>ST</span></div>
          <div>
            <p className="kicker">Faixa de estudo</p>
            <h2 id="track-title">Santana, O Cantador — Se Tu Quiser</h2>
            <p className="track-detail">Xote · arquivo local · {duration > 0 ? `${Math.floor(duration / 60)}m ${Math.round(duration % 60)}s` : 'carregando'}</p>
          </div>
        </div>
        <TimelineEditor
          currentTime={currentTime}
          duration={duration}
          viewport={viewport.end > viewport.start ? viewport : { start: 0, end: duration }}
          audioPlayer={(
            <AudioPlayer
              src="/tracks/se-tu-quiser/audio.mp3"
              currentTime={currentTime}
              onCurrentTimeChange={setCurrentTime}
              onDurationChange={setDuration}
              onViewportChange={setViewport}
            />
          )}
          timeline={timeline}
          onTimelineChange={setTimeline}
          onNotice={setNotice}
        />
      </section>
      <aside className="guide-panel guide-panel--wide">
        <div><p className="kicker">Atalhos</p><h2>Ouça. Marque. Corrija.</h2></div>
        <div className="shortcut-list">
          <div><kbd>Espaço</kbd><span>tocar / pausar</span></div>
          <div><kbd>Z</kbd><span>topo da zabumba</span></div>
          <div><kbd>C</kbd><span>camarão</span></div>
          <div><kbd>A</kbd><span>início sanfona</span></div>
          <div><kbd>R</kbd><span>início do ritmo</span></div>
          <div><kbd>Del</kbd><span>apagar selecionado</span></div>
        </div>
        <p className="guide-note">Marque <strong>Z · Z · Z · C</strong> duas vezes. A previsão aprende o ciclo local — não um BPM artificial.</p>
      </aside>
      <footer className="app-footer">
        <p role="status">{notice}</p><span>Cloudflare Workers</span>
      </footer>
    </main>
  )
}

export default App
