import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { AnnotatorPage } from './AnnotatorPage'

const createObjectURL = vi.fn(() => 'blob:track')
const revokeObjectURL = vi.fn()

vi.mock('../audio/AudioPlayer', () => ({
  AudioPlayer: ({ src }: { src: string }) => <div data-testid="annotator-audio">{src}</div>,
}))

afterEach(() => {
  createObjectURL.mockClear()
  revokeObjectURL.mockClear()
})

test('abre um MP3 local depois de preencher os metadados', () => {
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL })
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL })
  render(<AnnotatorPage />)

  fireEvent.change(screen.getByLabelText('ID da música'), { target: { value: 'novo-xote' } })
  fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Novo Xote' } })
  fireEvent.change(screen.getByLabelText('Artista'), { target: { value: 'Trio' } })
  const file = new File(['audio'], 'novo.mp3', { type: 'audio/mpeg' })
  fireEvent.change(screen.getByLabelText('Arquivo MP3'), { target: { files: [file] } })

  expect(createObjectURL).toHaveBeenCalledWith(file)
  expect(screen.getByTestId('annotator-audio')).toHaveTextContent('blob:track')
  expect(screen.getByRole('heading', { name: 'Novo Xote' })).toBeInTheDocument()
})

test('revoga a URL temporária ao substituir o arquivo', () => {
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL })
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL })
  render(<AnnotatorPage />)
  const input = screen.getByLabelText('Arquivo MP3')

  fireEvent.change(input, { target: { files: [new File(['a'], 'a.mp3', { type: 'audio/mpeg' })] } })
  fireEvent.change(input, { target: { files: [new File(['b'], 'b.mp3', { type: 'audio/mpeg' })] } })

  expect(revokeObjectURL).toHaveBeenCalledWith('blob:track')
})
