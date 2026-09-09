import { useEffect, useRef, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
import type { TimelineViewport } from './timelineViewport'

type AudioPlayerProps = {
  src: string
  currentTime: number
  onCurrentTimeChange(time: number): void
  onDurationChange(duration: number): void
  onViewportChange(viewport: TimelineViewport): void
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return '0:00.0'
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds - minutes * 60
  return `${minutes}:${remainder.toFixed(1).padStart(4, '0')}`
}

export function AudioPlayer({
  src,
  currentTime,
  onCurrentTimeChange,
  onDurationChange,
  onViewportChange,
}: AudioPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const waveSurferRef = useRef<WaveSurfer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [zoomLevel, setZoomLevel] = useState(0)

  useEffect(() => {
    if (!containerRef.current) return

    const waveSurfer = WaveSurfer.create({
      container: containerRef.current,
      url: src,
      height: 108,
      waveColor: '#4b5158',
      progressColor: '#ff7849',
      cursorColor: '#ffd0bc',
      cursorWidth: 2,
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      normalize: true,
      minPxPerSec: 0,
      autoScroll: true,
      autoCenter: false,
    })
    waveSurferRef.current = waveSurfer

    const unsubscribers = [
      waveSurfer.on('ready', (nextDuration) => {
        setDuration(nextDuration)
        onDurationChange(nextDuration)
        onViewportChange({ start: 0, end: nextDuration })
      }),
      waveSurfer.on('timeupdate', onCurrentTimeChange),
      waveSurfer.on('scroll', (start, end) => {
        onViewportChange({ start, end })
      }),
      waveSurfer.on('zoom', (minPxPerSec) => {
        const nextDuration = waveSurfer.getDuration()
        if (minPxPerSec <= 0) {
          onViewportChange({ start: 0, end: nextDuration })
          return
        }
        requestAnimationFrame(() => {
          const start = waveSurfer.getScroll() / minPxPerSec
          const end = Math.min(
            nextDuration,
            start + waveSurfer.getWidth() / minPxPerSec,
          )
          onViewportChange({ start, end })
        })
      }),
      waveSurfer.on('play', () => setIsPlaying(true)),
      waveSurfer.on('pause', () => setIsPlaying(false)),
      waveSurfer.on('finish', () => setIsPlaying(false)),
    ]

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe())
      waveSurfer.destroy()
      waveSurferRef.current = null
    }
  }, [onCurrentTimeChange, onDurationChange, onViewportChange, src])

  useEffect(() => {
    const waveSurfer = waveSurferRef.current
    if (
      waveSurfer &&
      Math.abs(waveSurfer.getCurrentTime() - currentTime) > 0.15
    ) {
      waveSurfer.setTime(currentTime)
    }
  }, [currentTime])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      if (
        event.code !== 'Space' ||
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      ) {
        return
      }
      event.preventDefault()
      void waveSurferRef.current?.playPause()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const togglePlayback = () => {
    void waveSurferRef.current?.playPause()
  }

  const changeRate = (rate: number) => {
    setPlaybackRate(rate)
    waveSurferRef.current?.setPlaybackRate(rate)
  }

  const changeZoom = (value: number) => {
    setZoomLevel(value)
    waveSurferRef.current?.zoom(value)
  }

  return (
    <section className="audio-player" aria-label="Player de áudio">
      <div
        className="waveform"
        ref={containerRef}
        aria-label="Forma de onda do áudio"
      />
      <div className="transport">
        <button className="button button--primary" onClick={togglePlayback}>
          {isPlaying ? 'Pausar' : 'Reproduzir'}
        </button>
        <output className="timecode" aria-live="off">
          {formatTime(currentTime)} <span>/ {formatTime(duration)}</span>
        </output>
        <div className="rate-control" aria-label="Velocidade de reprodução">
          {[0.5, 0.75, 1].map((rate) => (
            <button
              aria-pressed={playbackRate === rate}
              className="rate-button"
              key={rate}
              onClick={() => changeRate(rate)}
            >
              {rate}×
            </button>
          ))}
        </div>
        <div className="zoom-control">
          <span>Zoom</span>
          <input
            aria-label="Zoom da timeline"
            type="range"
            min="0"
            max="100"
            step="5"
            value={zoomLevel}
            onChange={(event) => changeZoom(Number(event.target.value))}
          />
          <button
            className="rate-button"
            disabled={zoomLevel === 0}
            onClick={() => changeZoom(0)}
          >
            Ajustar
          </button>
        </div>
      </div>
    </section>
  )
}
