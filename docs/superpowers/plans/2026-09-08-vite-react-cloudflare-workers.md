# Vite React Cloudflare Workers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar um frontend React + TypeScript com Vite, testado e publicável exclusivamente como Cloudflare Workers Static Assets.

**Architecture:** O Vite produz a SPA em `dist/`, sem código backend ou entrypoint de Worker. O Wrangler publica esse diretório como Static Assets e devolve `index.html` para navegações client-side desconhecidas.

**Tech Stack:** React 19, TypeScript, Vite 8, Vitest, Testing Library, ESLint 10 e Wrangler 4.

**Spec:** `docs/superpowers/specs/2026-09-08-vite-react-cloudflare-workers-design.md`

## Global Constraints

- Usar npm como único gerenciador de pacotes.
- Publicar exclusivamente em Cloudflare Workers Static Assets; não adicionar Cloudflare Pages.
- Não criar backend, handler HTTP, binding, roteador ou gerenciador global de estado.
- Usar `compatibility_date` igual a `2026-09-08`.
- Manter a interface inicial pequena e sem biblioteca visual adicional.

---

### Task 1: Toolchain e configuração de Workers Static Assets

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `.gitignore`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `eslint.config.js`
- Create: `wrangler.jsonc`

**Interfaces:**
- Produces: scripts npm `dev`, `test`, `typecheck`, `lint`, `build`, `preview`, `deploy:dry-run` e `deploy`.
- Produces: build Vite no diretório `dist/` consumido pelo Wrangler.

- [ ] **Step 1: Criar os manifests e as configurações mínimas**

Definir React como dependência de runtime; Vite, TypeScript, Vitest, Testing Library, ESLint e Wrangler como dependências de desenvolvimento. Configurar `vite.config.ts` com React e ambiente `jsdom` para testes.

- [ ] **Step 2: Configurar o alvo Workers**

Criar `wrangler.jsonc` com:

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "forro-simulator",
  "compatibility_date": "2026-09-08",
  "assets": {
    "directory": "./dist/",
    "not_found_handling": "single-page-application"
  }
}
```

- [ ] **Step 3: Instalar e validar a configuração**

Run: `npm install`

Run: `npm run typecheck`

Expected: exit code 0, sem diagnósticos TypeScript.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json .gitignore index.html tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts eslint.config.js wrangler.jsonc
git commit -m "build: configure Vite and Cloudflare Workers"
```

### Task 2: Tela inicial React orientada por teste

**Files:**
- Create: `src/App.test.tsx`
- Create: `src/test/setup.ts`
- Create: `src/App.tsx`
- Create: `src/main.tsx`
- Create: `src/index.css`

**Interfaces:**
- Produces: componente React default `App(): JSX.Element`.
- Produces: elemento `#root` inicializado por `src/main.tsx`.

- [ ] **Step 1: Escrever o teste que falha**

```tsx
import { render, screen } from '@testing-library/react'
import App from './App'

test('identifica o app e seu alvo de deploy', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: 'Forró Simulator' })).toBeInTheDocument()
  expect(screen.getByText('Cloudflare Workers')).toBeInTheDocument()
})
```

- [ ] **Step 2: Confirmar RED**

Run: `npm test -- --run src/App.test.tsx`

Expected: FAIL porque `src/App.tsx` ainda não existe.

- [ ] **Step 3: Implementar a menor tela funcional**

Criar `App.tsx` com um `main`, o título `Forró Simulator`, uma descrição curta e o texto `Cloudflare Workers`. Criar `main.tsx` para montar o componente e CSS próprio responsivo, sem dependências de UI.

- [ ] **Step 4: Confirmar GREEN**

Run: `npm test -- --run src/App.test.tsx`

Expected: 1 test passed.

- [ ] **Step 5: Validar o frontend**

Run: `npm run typecheck && npm run lint && npm run build`

Expected: exit code 0 e `dist/index.html` gerado.

- [ ] **Step 6: Commit**

```bash
git add src
git commit -m "feat: add Forro Simulator starter screen"
```

### Task 3: Documentação e verificação do pacote de deploy

**Files:**
- Create: `README.md`
- Modify: `package.json`

**Interfaces:**
- Produces: instruções completas para desenvolvimento, verificação, preview e deploy.

- [ ] **Step 1: Documentar comandos e arquitetura**

Explicar os pré-requisitos Node/npm e autenticação com `npx wrangler login`. Registrar que `npm run deploy` executa o build antes de `wrangler deploy` e que o projeto não utiliza Pages.

- [ ] **Step 2: Validar o dry-run**

Run: `npm run deploy:dry-run`

Expected: exit code 0 e relatório dos assets encontrados em `dist/`, sem publicação.

- [ ] **Step 3: Executar a verificação integral**

Run: `npm test -- --run && npm run typecheck && npm run lint && npm run build && npm run deploy:dry-run`

Expected: todos os comandos terminam com exit code 0, sem testes ou diagnósticos falhando.

- [ ] **Step 4: Inspecionar o repositório e commit final**

Run: `git diff --check && git status --short`

```bash
git add README.md package.json package-lock.json docs/superpowers/plans/2026-09-08-vite-react-cloudflare-workers.md
git commit -m "docs: add development and deployment guide"
```
