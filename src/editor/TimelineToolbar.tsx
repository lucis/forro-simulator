import type { ChangeEvent, RefObject } from 'react'

type TimelineToolbarProps = {
  canPredict: boolean
  canReflow: boolean
  fileInputRef: RefObject<HTMLInputElement | null>
  onPredict(): void
  onReflow(): void
  onExport(): void
  onImport(event: ChangeEvent<HTMLInputElement>): void
  onClear(): void
}

export function TimelineToolbar({
  canPredict,
  canReflow,
  fileInputRef,
  onPredict,
  onReflow,
  onExport,
  onImport,
  onClear,
}: TimelineToolbarProps) {
  return (
    <div className="timeline-toolbar" aria-label="Ferramentas da timeline">
      <button className="button" disabled={!canPredict} onClick={onPredict}>
        Prever até o fim
      </button>
      <button className="button" disabled={!canReflow} onClick={onReflow}>
        Reflow a partir daqui
      </button>
      <span className="toolbar-spacer" />
      <button className="button button--quiet" onClick={onExport}>
        Exportar JSON
      </button>
      <button
        className="button button--quiet"
        onClick={() => fileInputRef.current?.click()}
      >
        Importar JSON
      </button>
      <input
        aria-label="Arquivo da timeline"
        ref={fileInputRef}
        className="visually-hidden"
        type="file"
        accept="application/json,.json"
        onChange={onImport}
      />
      <button className="button button--danger" onClick={onClear}>
        Limpar
      </button>
    </div>
  )
}
