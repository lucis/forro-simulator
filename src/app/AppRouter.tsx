import { lazy, Suspense } from 'react'
import { routeFor } from './route'

const HomeStudioPage = lazy(() => import('../pages/HomeStudioPage').then((module) => ({ default: module.HomeStudioPage })))
const AnnotatorPage = lazy(() => import('../pages/AnnotatorPage').then((module) => ({ default: module.AnnotatorPage })))

export function AppRouter() {
  const route = routeFor(window.location.pathname)
  if (route === 'home') return <Suspense fallback={<p className="route-loading">Carregando interface…</p>}><HomeStudioPage /></Suspense>
  if (route === 'annotator') return <Suspense fallback={<p className="route-loading">Carregando interface…</p>}><AnnotatorPage /></Suspense>
  return <main className="not-found"><h1>Página não encontrada</h1><a href="/">Voltar ao início</a></main>
}
