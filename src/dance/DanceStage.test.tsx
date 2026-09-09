import { render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { FRENTE_E_TRAS } from './patterns/frenteETras'
import { DanceStage } from './DanceStage'

vi.mock('@react-three/fiber', () => ({ Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="canvas">{children}</div> }))
vi.mock('./DanceScene', () => ({ DanceScene: ({ showLeader, showFollower }: { showLeader: boolean; showFollower: boolean }) => <span>{`${showLeader}/${showFollower}`}</span> }))

test('expõe palco e encaminha visibilidade dos dançarinos', () => {
  render(<DanceStage pose={FRENTE_E_TRAS.keyframes[0].pose} showLeader showFollower={false} camera="front" />)
  expect(screen.getByLabelText('Palco de dança')).toBeInTheDocument()
  expect(screen.getByTestId('canvas')).toHaveTextContent('true/false')
})
