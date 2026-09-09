import { AnnotatorPage } from '../pages/AnnotatorPage'
import { HomeStudioPage } from '../pages/HomeStudioPage'
import { routeFor } from './route'

export function AppRouter() {
  const route = routeFor(window.location.pathname)
  if (route === 'home') return <HomeStudioPage />
  if (route === 'annotator') return <AnnotatorPage />
  return <main className="not-found"><h1>Página não encontrada</h1><a href="/">Voltar ao início</a></main>
}
