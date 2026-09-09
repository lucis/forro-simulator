export function DanceCount({ label, active }: { label: string; active: boolean }) {
  return <div className={`dance-count ${active ? 'is-active' : ''}`} aria-label="Contagem da dança"><span>Contagem</span><strong>{label}</strong></div>
}
