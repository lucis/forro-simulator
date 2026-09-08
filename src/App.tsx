import './index.css'

function App() {
  return (
    <main className="app-shell">
      <div className="ambient ambient--one" aria-hidden="true" />
      <div className="ambient ambient--two" aria-hidden="true" />

      <section className="hero" aria-labelledby="app-title">
        <p className="eyebrow">Passo, ritmo e conexão</p>
        <h1 id="app-title">Forró Simulator</h1>
        <p className="intro">
          Uma nova experiência para explorar a dança brasileira está tomando
          forma.
        </p>

        <div className="status" aria-label="Estado da infraestrutura">
          <span className="status__dot" aria-hidden="true" />
          <span>React + Vite</span>
          <span className="status__divider" aria-hidden="true" />
          <span>Cloudflare Workers</span>
        </div>
      </section>

      <footer>
        <span>Frontend pronto</span>
        <span aria-hidden="true">→</span>
      </footer>
    </main>
  )
}

export default App
