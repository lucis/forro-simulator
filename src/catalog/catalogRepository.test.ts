import { expect, test, vi } from 'vitest'
import { loadCatalog, loadCatalogTrack } from './catalogRepository'

test('carrega o catálogo estático', async () => {
  const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ tracks: [] }) })
  await expect(loadCatalog(fetcher as typeof fetch)).resolves.toEqual({ tracks: [] })
  expect(fetcher).toHaveBeenCalledWith('/catalog.json')
})

test('rejeita timeline pertencente a outra faixa', async () => {
  const entry = { id: 'a', title: 'A', artist: 'B', rhythmId: 'xote', audioUrl: '/a.mp3', timelineUrl: '/a.json' }
  const fetcher = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ trackId: 'outra', rhythmId: 'xote', events: [] }),
  })
  await expect(loadCatalogTrack(entry, fetcher as typeof fetch)).rejects.toThrow('Timeline incompatível')
})

test('expõe falha HTTP como erro de catálogo', async () => {
  const fetcher = vi.fn().mockResolvedValue({ ok: false })
  await expect(loadCatalog(fetcher as typeof fetch)).rejects.toThrow('Não foi possível carregar o catálogo')
})
