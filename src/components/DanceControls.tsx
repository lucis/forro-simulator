import type { CameraPreset } from '../dance/DanceScene'

type Props = {
  camera: CameraPreset
  onCameraChange(camera: CameraPreset): void
  showLeader: boolean
  showFollower: boolean
  onLeaderChange(value: boolean): void
  onFollowerChange(value: boolean): void
}

export function DanceControls({ camera, onCameraChange, showLeader, showFollower, onLeaderChange, onFollowerChange }: Props) {
  return <div className="dance-controls" aria-label="Controles do palco">
    <div className="camera-presets" aria-label="Câmera">
      {([['front', 'Frente'], ['side', 'Lateral'], ['top', 'Topo']] as const).map(([value, label]) => <button aria-label={`Câmera ${label.toLowerCase()}`} aria-pressed={camera === value} key={value} onClick={() => onCameraChange(value)}>{label}</button>)}
    </div>
    <button onClick={() => onLeaderChange(!showLeader)}>{showLeader ? 'Ocultar cavalheiro' : 'Mostrar cavalheiro'}</button>
    <button onClick={() => onFollowerChange(!showFollower)}>{showFollower ? 'Ocultar dama' : 'Mostrar dama'}</button>
  </div>
}
