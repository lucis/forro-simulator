# Design: Vite React frontend on Cloudflare Workers

## Objetivo

Inicializar o diretório `forro-simulator` como uma aplicação frontend-only pronta para desenvolvimento local, build de produção e deploy no Cloudflare Workers. O projeto não terá backend, funções server-side nem dependências de Cloudflare Pages.

## Decisões

- Framework: React com TypeScript.
- Ferramenta de desenvolvimento e build: Vite.
- Gerenciador de pacotes: npm.
- Hospedagem: Cloudflare Workers Static Assets, configurado com Wrangler.
- Cloudflare Pages fica explicitamente fora do escopo.
- A primeira versão será mínima e não incluirá bibliotecas de UI, roteamento ou estado global.

## Arquitetura

O navegador carregará os arquivos estáticos produzidos pelo Vite em `dist/`. O Cloudflare Worker será usado como plataforma de entrega desses assets por meio da configuração `assets` do Wrangler; não haverá código de Worker executando lógica de aplicação.

O desenvolvimento cotidiano usará o servidor do Vite. O build de produção será gerado pelo Vite e validado pelo Wrangler antes do deploy. A configuração de assets terá fallback de single-page application, permitindo que futuras rotas client-side sejam resolvidas para `index.html`.

## Estrutura e componentes

- `src/`: entrada React, componente raiz, estilos e assets da aplicação.
- `public/`: arquivos públicos copiados sem transformação quando necessários.
- `vite.config.ts`: configuração de build do Vite.
- `wrangler.jsonc`: nome do Worker, data de compatibilidade e diretório de assets `dist/`.
- `package.json`: scripts e dependências do frontend e das ferramentas de deploy.
- `README.md`: requisitos, desenvolvimento, build, validação e deploy.

A tela inicial será deliberadamente simples: identificará o Forró Simulator e mostrará que o ambiente React/Vite/Workers está operacional. Funcionalidades do simulador não fazem parte desta inicialização.

## Fluxos

### Desenvolvimento

1. `npm install` instala dependências e materializa o lockfile.
2. `npm run dev` inicia o Vite com recarregamento automático.
3. Alterações em React e CSS são refletidas no navegador.

### Build e deploy

1. `npm run build` executa a verificação do TypeScript e gera `dist/`.
2. `npm run deploy:dry-run` valida a configuração e o pacote sem publicar.
3. `npm run deploy` recompila e publica os assets no Cloudflare Workers por meio do Wrangler.

## Tratamento de erros

- Falhas de tipos ou build encerram os scripts com código diferente de zero.
- Um deploy não é iniciado se o build falhar.
- O Wrangler reportará ausência de autenticação ou erros de configuração sem que credenciais sejam armazenadas no repositório.
- Rotas desconhecidas serão tratadas pelo fallback de SPA; erros reais de assets não deverão ser mascarados pela aplicação.

## Qualidade e verificação

Antes de considerar a inicialização concluída, serão executados:

- verificação TypeScript;
- lint;
- build de produção;
- dry-run do Wrangler;
- inspeção do pacote gerado e do estado do Git.

O projeto incluirá scripts separados para essas verificações, permitindo uso local e futura integração em CI.

## Fora do escopo

- Cloudflare Pages;
- código backend ou handlers HTTP customizados;
- banco de dados, autenticação ou bindings;
- roteador React e gerenciamento global de estado;
- deploy efetivo em uma conta Cloudflare, pois exige a sessão e autorização do proprietário.

## Critérios de aceite

- `npm run dev` inicia a aplicação React localmente.
- `npm run typecheck`, `npm run lint` e `npm run build` terminam com sucesso.
- `npm run deploy:dry-run` aceita a configuração de Workers Static Assets.
- `npm run deploy` está disponível como comando explícito de publicação no Cloudflare Workers.
- O README documenta os comandos e o pré-requisito de autenticação do Wrangler.
