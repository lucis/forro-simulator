import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, vi } from 'vitest'
import App from './App'

const { mockPlayPause } = vi.hoisted(() => ({
  mockPlayPause: vi.fn(() => Promise.resolve()),
}))

vi.mock('wavesurfer.js', () => ({
  default: {
    create: () => ({
      destroy: vi.fn(),
      getCurrentTime: () => 0,
      isPlaying: () => false,
      on: () => vi.fn(),
      playPause: mockPlayPause,
      setPlaybackRate: vi.fn(),
      setTime: vi.fn(),
    }),
  },
}))

beforeEach(() => mockPlayPause.mockClear())

test('identifica o app e seu alvo de deploy', () => {
  render(<App />)

  expect(
    screen.getByRole('heading', { name: 'Forró Simulator' }),
  ).toBeInTheDocument()
  expect(screen.getByText('Santana, O Cantador — Se Tu Quiser')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Reproduzir' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Prever até o fim' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Exportar JSON' })).toBeInTheDocument()
})

test('Espaço controla o áudio mesmo quando um botão tem foco', () => {
  render(<App />)
  const playButton = screen.getByRole('button', { name: 'Reproduzir' })
  playButton.focus()

  fireEvent.keyDown(playButton, { code: 'Space' })

  expect(mockPlayPause).toHaveBeenCalledOnce()
})
