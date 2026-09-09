import { expect, test } from 'vitest'
import { createCatalogEntry } from './catalogExport'

test('gera entrada com destinos estáticos a partir dos metadados', () => {
  expect(createCatalogEntry({ trackId: 'meu-xote', title: ' Meu Xote ', artist: ' Artista ', rhythmId: 'xote' })).toEqual({
    id: 'meu-xote',
    title: 'Meu Xote',
    artist: 'Artista',
    rhythmId: 'xote',
    audioUrl: '/tracks/meu-xote/audio.mp3',
    timelineUrl: '/tracks/meu-xote/timeline.json',
  })
})

test('rejeita track id que não seja slug', () => {
  expect(() => createCatalogEntry({ trackId: 'Meu Xote', title: 'X', artist: 'Y', rhythmId: 'xote' })).toThrow('ID inválido')
})
