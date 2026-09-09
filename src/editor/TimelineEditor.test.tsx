import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { EMPTY_XOTE_TIMELINE } from '../domain/timeline'
import { TimelineEditor } from './TimelineEditor'

test('registra atalho de zabumba mesmo após um botão receber foco', () => {
  const onTimelineChange = vi.fn()
  render(
    <TimelineEditor
      currentTime={1.25}
      duration={10}
      viewport={{ start: 0, end: 10 }}
      audioPlayer={<div />}
      timeline={EMPTY_XOTE_TIMELINE}
      onTimelineChange={onTimelineChange}
      onNotice={vi.fn()}
    />,
  )
  screen.getByRole('button', { name: 'Exportar JSON' }).focus()

  fireEvent.keyDown(document.activeElement as Element, { key: 'z' })

  expect(onTimelineChange).toHaveBeenCalledWith(
    expect.objectContaining({
      events: [
        expect.objectContaining({
          type: 'rhythm-marker',
          t: 1.25,
          slotId: 'z1',
          source: 'manual',
        }),
      ],
    }),
  )
})

test('apaga o marcador selecionado com Delete', () => {
  const onTimelineChange = vi.fn()
  render(
    <TimelineEditor
      currentTime={2}
      duration={10}
      viewport={{ start: 0, end: 10 }}
      audioPlayer={<div />}
      timeline={{
        ...EMPTY_XOTE_TIMELINE,
        events: [
          {
            id: 'marker-1',
            type: 'rhythm-marker',
            t: 1,
            slotId: 'z1',
            source: 'manual',
          },
        ],
      }}
      onTimelineChange={onTimelineChange}
      onNotice={vi.fn()}
    />,
  )

  const marker = screen.getByRole('button', { name: 'Topo em 1.00 segundos' })
  expect(marker).toBeEmptyDOMElement()
  fireEvent.click(marker)
  fireEvent.keyDown(marker, { key: 'Delete' })

  expect(onTimelineChange).toHaveBeenCalledWith(
    expect.objectContaining({ events: [] }),
  )
})
