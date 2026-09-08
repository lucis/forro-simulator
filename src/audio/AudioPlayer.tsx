import { useEffect, useRef, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
import xoteUrl from '../assets/Santana, O Cantador - Se Tu Quiser.mp3'

type AudioPlayerProps = {
  currentTime: number
  onCurrentTimeChange(time: number): void
  onDurationChange(duration: number): void
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return '0:00.0'
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds - minutes * 60
  return `${minutes}:${remainder.toFixed(1).padStart(4, '0')}`
}

export function AudioPlayer({
  currentTime,
  onCurrentTimeChange,
  onDurationChange,
}: AudioPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const waveSurferRef = useRef<WaveSurfer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)

  useEffect(() => {
    if (!containerRef.current) return

    const waveSurfer = WaveSurfer.create({
      container: containerRef.current,
      url: xoteUrl,
      height: 108,
      waveColor: '#4b5158',
      progressColor: '#ff7849',
      cursorColor: '#ffd0bc',
      cursorWidth: 2,
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      normalize: true,
    })
    waveSurferRef.current = waveSurfer

    const unsubscribers = [
      waveSurfer.on('ready', (nextDuration) => {
        setDuration(nextDuration)
        onDurationChange(nextDuration)
      }),
      waveSurfer.on('timeupdate', onCurrentTimeChange),
      waveSurfer.on('play', () => setIsPlaying(true)),
      waveSurfer.on('pause', () => setIsPlaying(false)),
      waveSurfer.on('finish', () => setIsPlaying(false)),
    ]

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe())
      waveSurfer.destroy()
      waveSurferRef.current = null
    }
  }, [onCurrentTimeChange, onDurationChange])

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

  return (
    <section className="audio-player" aria-label="Player de áudio">
      <div className="waveform" ref={containerRef} />
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
      </div>
    </section>
  )
}
