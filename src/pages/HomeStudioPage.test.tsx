import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import type { TrackCatalog } from '../catalog/catalog'
import { HomeStudioPage } from './HomeStudioPage'

vi.mock('../audio/AudioPlayer', () => ({
  AudioPlayer: ({ src }: { src: string }) => <div data-testid="audio-source">{src}</div>,
}))

const catalog: TrackCatalog = {
  tracks: [
    { id: 'xote-a', title: 'Xote A', artist: 'Artista A', rhythmId: 'xote', audioUrl: '/a.mp3', timelineUrl: '/a.json' },
    { id: 'baiao-b', title: 'Baião B', artist: 'Artista B', rhythmId: 'baiao', audioUrl: '/b.mp3', timelineUrl: '/b.json' },
  ],
}

const timeline = (trackId: string, rhythmId: string) => ({ trackId, rhythmId, events: [] })

test('seleciona a primeira faixa e permite trocar sem navegar', async () => {
  render(
    <HomeStudioPage
      catalogLoader={async () => catalog}
      timelineLoader={async (entry) => timeline(entry.id, entry.rhythmId)}
    />,
  )

  expect(await screen.findByRole('heading', { name: 'Xote A' })).toBeInTheDocument()
  expect(screen.getByTestId('audio-source')).toHaveTextContent('/a.mp3')

  fireEvent.click(screen.getByRole('button', { name: /Baião B/ }))

  expect(await screen.findByRole('heading', { name: 'Baião B' })).toBeInTheDocument()
  expect(screen.getByTestId('audio-source')).toHaveTextContent('/b.mp3')
})

test('filtra músicas por ritmo', async () => {
  render(
    <HomeStudioPage
      catalogLoader={async () => catalog}
      timelineLoader={async (entry) => timeline(entry.id, entry.rhythmId)}
    />,
  )
  await screen.findByRole('heading', { name: 'Xote A' })

  fireEvent.click(screen.getByRole('button', { name: 'Baião' }))

  expect(screen.queryByRole('button', { name: /Xote A/ })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Baião B/ })).toBeInTheDocument()
})
