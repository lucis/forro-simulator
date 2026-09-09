import type { CameraPreset } from '../dance/DanceScene'
import type { DancePattern } from '../domain/dance'

type Props = {
  camera: CameraPreset
  onCameraChange(camera: CameraPreset): void
  showLeader: boolean
  showFollower: boolean
  onLeaderChange(value: boolean): void
  onFollowerChange(value: boolean): void
  patterns: DancePattern[]
  patternId: string
  onPatternChange(id: string): void
}

const CAMERA_PRESETS: { value: CameraPreset; label: string }[] = [
  { value: 'front', label: 'Frente' },
  { value: 'side', label: 'Lateral' },
  { value: 'top', label: 'Topo' },
]

// Simple flat/skewed/rotated square icons — the classic front/side/top face
// convention from isometric view-cube switchers in 3D tools.
function CameraIcon({ preset }: { preset: CameraPreset }) {
  return <svg aria-hidden="true" height="16" viewBox="0 0 20 20" width="16">
    {preset === 'front' ? <rect fill="currentColor" height="12" rx="1.5" width="12" x="4" y="4" /> : null}
    {preset === 'side' ? <polygon fill="currentColor" points="4,7 13,4 16,13 7,16" /> : null}
    {preset === 'top' ? <polygon fill="currentColor" points="10,3 17,10 10,17 3,10" /> : null}
  </svg>
}

export function DanceControls({ camera, onCameraChange, showLeader, showFollower, onLeaderChange, onFollowerChange, patterns, patternId, onPatternChange }: Props) {
  return <div className="dance-controls" aria-label="Controles do palco">
    <label className="visually-hidden" htmlFor="step-pattern-select">Passo de dança</label>
    <select className="step-select" id="step-pattern-select" onChange={(event) => onPatternChange(event.target.value)} value={patternId}>
      {patterns.map((pattern) => <option key={pattern.id} value={pattern.id}>{pattern.name}</option>)}
    </select>
    <div className="camera-presets" aria-label="Câmera">
      {CAMERA_PRESETS.map(({ value, label }) => (
        <button aria-label={`Câmera ${label.toLowerCase()}`} aria-pressed={camera === value} className="icon-toggle" key={value} onClick={() => onCameraChange(value)}>
          <CameraIcon preset={value} />
          <span aria-hidden="true">{label}</span>
        </button>
      ))}
    </div>
    <div className="visibility-toggles" aria-label="Visibilidade dos dançarinos">
      <button aria-label={showLeader ? 'Ocultar cavalheiro' : 'Mostrar cavalheiro'} aria-pressed={showLeader} className="icon-toggle" onClick={() => onLeaderChange(!showLeader)}>
        <span aria-hidden="true">🕺</span>
      </button>
      <button aria-label={showFollower ? 'Ocultar dama' : 'Mostrar dama'} aria-pressed={showFollower} className="icon-toggle" onClick={() => onFollowerChange(!showFollower)}>
        <span aria-hidden="true">💃</span>
      </button>
    </div>
  </div>
}
