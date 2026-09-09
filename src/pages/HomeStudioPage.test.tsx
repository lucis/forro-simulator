import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import type { TrackCatalog } from '../catalog/catalog'
import { HomeStudioPage } from './HomeStudioPage'

vi.mock('../audio/AudioPlayer', () => ({
  AudioPlayer: ({ src, onCurrentTimeChange }: { src: string; onCurrentTimeChange(time: number): void }) => <div data-testid="audio-source">{src}<button onClick={() => onCurrentTimeChange(1.5)}>Ir para batida</button></div>,
}))
vi.mock('../dance/DanceStage', () => ({
  DanceStage: ({ showLeader, showFollower, camera }: { showLeader: boolean; showFollower: boolean; camera: string }) => <div data-testid="stage-props">{`${showLeader}/${showFollower}/${camera}`}</div>,
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
  expect(await screen.findByTestId('audio-source')).toHaveTextContent('/a.mp3')

  fireEvent.click(screen.getByRole('button', { name: /Baião B/ }))

  expect(await screen.findByRole('heading', { name: 'Baião B' })).toBeInTheDocument()
  expect(await screen.findByTestId('audio-source')).toHaveTextContent('/b.mp3')
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

test('sincroniza contagem e controles com a timeline', async () => {
  const beats = [
    { id: 'a', type: 'rhythm-marker' as const, t: 1, slotId: 'z1', source: 'manual' as const },
    { id: 'b', type: 'rhythm-marker' as const, t: 2, slotId: 'z2', source: 'manual' as const },
  ]
  render(<HomeStudioPage catalogLoader={async () => ({ tracks: [catalog.tracks[0]] })} timelineLoader={async () => ({ ...timeline('xote-a', 'xote'), events: beats })} />)

  expect(await screen.findByText('Prepare-se')).toBeInTheDocument()
  fireEvent.click(await screen.findByRole('button', { name: 'Ir para batida' }))
  expect(screen.getByLabelText('Contagem da dança')).toHaveTextContent('1')

  fireEvent.click(screen.getByRole('button', { name: 'Ocultar cavalheiro' }))
  fireEvent.click(screen.getByRole('button', { name: 'Câmera lateral' }))
  expect(screen.getByTestId('stage-props')).toHaveTextContent('false/true/side')
})
