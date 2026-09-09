import { parseTrackTimeline } from '../audio/timelineQueries'
import type { TrackTimeline } from '../domain/timeline'
import { parseTrackCatalog, type TrackCatalog, type TrackCatalogEntry } from './catalog'

export async function loadCatalog(fetcher: typeof fetch = fetch): Promise<TrackCatalog> {
  const response = await fetcher('/catalog.json')
  if (!response.ok) throw new Error('Não foi possível carregar o catálogo')
  return parseTrackCatalog(await response.json())
}

export async function loadCatalogTrack(
  entry: TrackCatalogEntry,
  fetcher: typeof fetch = fetch,
): Promise<TrackTimeline> {
  const response = await fetcher(entry.timelineUrl)
  if (!response.ok) throw new Error('Não foi possível carregar a timeline')
  const timeline = parseTrackTimeline(await response.json())
  if (timeline.trackId !== entry.id || timeline.rhythmId !== entry.rhythmId) {
    throw new Error('Timeline incompatível com a faixa')
  }
  return timeline
}
