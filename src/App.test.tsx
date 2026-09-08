import { render, screen } from '@testing-library/react'
import App from './App'

test('identifica o app e seu alvo de deploy', () => {
  render(<App />)

  expect(
    screen.getByRole('heading', { name: 'Forró Simulator' }),
  ).toBeInTheDocument()
  expect(screen.getByText('Cloudflare Workers')).toBeInTheDocument()
})
