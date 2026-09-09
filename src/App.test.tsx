import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, vi } from 'vitest'
import App from './App'

const { mockPlayPause, mockZoom } = vi.hoisted(() => ({
  mockPlayPause: vi.fn(() => Promise.resolve()),
  mockZoom: vi.fn(),
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
      zoom: mockZoom,
    }),
  },
}))

beforeEach(() => {
  mockPlayPause.mockClear()
  mockZoom.mockClear()
})

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

test('mantém marcadores e waveform na mesma superfície temporal', () => {
  render(<App />)

  const timeline = screen.getByRole('region', {
    name: 'Timeline alinhada ao áudio',
  })
  expect(within(timeline).getByLabelText('Marcações da zabumba')).toBeInTheDocument()
  expect(within(timeline).getByLabelText('Forma de onda do áudio')).toBeInTheDocument()
  expect(within(timeline).getByRole('slider', { name: 'Zoom da timeline' })).toBeInTheDocument()
})

test('aplica zoom ao waveform pelo controle da timeline', () => {
  render(<App />)
  const slider = screen.getByRole('slider', { name: 'Zoom da timeline' })

  fireEvent.change(slider, { target: { value: '40' } })

  expect(mockZoom).toHaveBeenCalledWith(40)
  expect(slider).toHaveValue('40')
  expect(screen.getByRole('button', { name: 'Ajustar' })).toBeEnabled()
})
