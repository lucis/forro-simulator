import type { TrackCatalogEntry } from '../catalog/catalog'

export type CatalogDraftMetadata = {
  trackId: string
  title: string
  artist: string
  rhythmId: string
}

export function createCatalogEntry(metadata: CatalogDraftMetadata): TrackCatalogEntry {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.trackId)) {
    throw new Error('ID inválido')
  }
  const root = `/tracks/${metadata.trackId}`
  return {
    id: metadata.trackId,
    title: metadata.title.trim(),
    artist: metadata.artist.trim(),
    rhythmId: metadata.rhythmId,
    audioUrl: `${root}/audio.mp3`,
    timelineUrl: `${root}/timeline.json`,
  }
}
