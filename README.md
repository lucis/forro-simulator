# Forró Simulator

Frontend React + TypeScript criado com Vite e preparado para publicação como
[Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/).
O projeto não usa Cloudflare Pages nem possui backend.

## Requisitos

- Node.js 20.19 ou mais recente
- npm 10 ou mais recente
- uma conta Cloudflare para publicar

## Desenvolvimento

```bash
npm install
npm run dev
```

O Vite informará o endereço local e recarregará a página após alterações no
código.

## Verificações

```bash
npm test -- --run
npm run typecheck
npm run lint
npm run build
```

O build de produção é escrito em `dist/`.

## Preview local

```bash
npm run build
npm run preview
```

## Cloudflare Workers

O arquivo `wrangler.jsonc` envia `dist/` para Workers Static Assets. A opção
`not_found_handling: "single-page-application"` devolve `index.html` para
navegações que não correspondem a um arquivo, deixando o projeto pronto para
rotas client-side futuras.

Valide o pacote sem publicar:

```bash
npm run deploy:dry-run
```

Antes do primeiro deploy, autentique o Wrangler:

```bash
npx wrangler login
```

Depois publique:

```bash
npm run deploy
```

O script de deploy sempre executa um build novo antes da publicação.
