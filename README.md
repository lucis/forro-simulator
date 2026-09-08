# Forró Simulator

Frontend React + TypeScript criado com Vite e preparado para publicação como
[Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/).
O projeto não usa Cloudflare Pages nem possui backend.

## Marco V0: editor de ritmo

O app carrega a faixa local **Santana, O Cantador — Se Tu Quiser** e permite
construir uma timeline de zabumba diretamente sobre a reprodução:

- `Espaço`: reproduzir ou pausar;
- `Z`: marcar uma batida no topo da zabumba;
- `C`: marcar o camarão;
- `A`: iniciar uma seção `accordion-only`;
- `R`: iniciar uma seção `rhythm`;
- `Delete` ou `Backspace`: apagar o marcador selecionado.

Depois de marcar dois ciclos `Z · Z · Z · C`, use **Prever até o fim** para
repetir matematicamente o ritmo. Arraste uma marca prevista para corrigi-la e
use **Reflow a partir daqui** para recalcular as batidas seguintes. A timeline
pode ser importada ou exportada no formato JSON.

Os timestamps usam segundos desde o início do MP3. As marcações manuais e
corrigidas são preservadas quando a previsão é recalculada.

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
