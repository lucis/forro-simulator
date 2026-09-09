export type TrackCatalogEntry = {
  id: string
  title: string
  artist: string
  rhythmId: string
  audioUrl: string
  timelineUrl: string
  coverUrl?: string
}

export type TrackCatalog = { tracks: TrackCatalogEntry[] }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isLocalPath(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('/')
}

export function parseTrackCatalog(value: unknown): TrackCatalog {
  if (!isRecord(value) || !Array.isArray(value.tracks)) {
    throw new Error('Catálogo inválido')
  }

  const valid = value.tracks.every((track) => {
    if (!isRecord(track)) return false
    return (
      typeof track.id === 'string' && track.id.length > 0 &&
      typeof track.title === 'string' && track.title.length > 0 &&
      typeof track.artist === 'string' && track.artist.length > 0 &&
      typeof track.rhythmId === 'string' && track.rhythmId.length > 0 &&
      isLocalPath(track.audioUrl) &&
      isLocalPath(track.timelineUrl) &&
      (track.coverUrl === undefined || isLocalPath(track.coverUrl))
    )
  })

  if (!valid) throw new Error('Catálogo inválido')
  return value as TrackCatalog
}
