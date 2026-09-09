import { describe, expect, test } from 'vitest'
import { parseTrackCatalog } from './catalog'

const valid = {
  tracks: [{
    id: 'se-tu-quiser',
    title: 'Se Tu Quiser',
    artist: 'Santana, O Cantador',
    rhythmId: 'xote',
    audioUrl: '/tracks/se-tu-quiser/audio.mp3',
    timelineUrl: '/tracks/se-tu-quiser/timeline.json',
  }],
}

describe('parseTrackCatalog', () => {
  test('aceita uma entrada válida', () => {
    expect(parseTrackCatalog(valid)).toEqual(valid)
  })

  test.each([
    {},
    { tracks: [{}] },
    { tracks: [{ ...valid.tracks[0], id: '' }] },
    { tracks: [{ ...valid.tracks[0], audioUrl: 'https://example.com/a.mp3' }] },
  ])('rejeita catálogo inválido', (value) => {
    expect(() => parseTrackCatalog(value)).toThrow('Catálogo inválido')
  })
})
