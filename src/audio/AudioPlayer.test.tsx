import { render } from '@testing-library/react'
import { beforeEach, expect, test, vi } from 'vitest'
import { AudioPlayer } from './AudioPlayer'

const { create, destroy } = vi.hoisted(() => ({ create: vi.fn(), destroy: vi.fn() }))

vi.mock('wavesurfer.js', () => ({
  default: {
    create,
  },
}))

beforeEach(() => {
  create.mockReset()
  destroy.mockReset()
  create.mockReturnValue({
    destroy,
    getCurrentTime: () => 0,
    on: () => vi.fn(),
    playPause: vi.fn(),
    setPlaybackRate: vi.fn(),
    setTime: vi.fn(),
    zoom: vi.fn(),
  })
})

test('recria o waveform quando a fonte muda', () => {
  const props = {
    currentTime: 0,
    onCurrentTimeChange: vi.fn(),
    onDurationChange: vi.fn(),
    onViewportChange: vi.fn(),
  }
  const { rerender } = render(<AudioPlayer {...props} src="/one.mp3" />)

  rerender(<AudioPlayer {...props} src="/two.mp3" />)

  expect(destroy).toHaveBeenCalledOnce()
  expect(create).toHaveBeenLastCalledWith(expect.objectContaining({ url: '/two.mp3' }))
})
