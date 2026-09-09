import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import App from './App'

test('abre a Home Studio como experiência principal', () => {
  window.history.replaceState({}, '', '/')
  render(<App />)
  expect(screen.getByRole('heading', { name: 'Simulador de Forró' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Escolha o ritmo' })).toBeInTheDocument()
})
