import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import App from './App'

test('carrega a Home Studio sob demanda', async () => {
  window.history.replaceState({}, '', '/')
  render(<App />)
  expect(screen.getByText('Carregando interface…')).toBeInTheDocument()
  expect(await screen.findByRole('heading', { name: 'Simulador de Forró' })).toBeInTheDocument()
})
