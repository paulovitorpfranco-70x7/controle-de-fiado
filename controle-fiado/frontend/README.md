# Frontend

Frontend operacional do `Controle de Fiado`, reconstruido sobre o backend existente.

## Stack

- React + TypeScript
- Vite
- React Router
- CSS proprio em `src/styles.css`

## Estrutura principal

- `src/App.tsx`: roteamento, protecao de acesso e lazy loading das telas
- `src/main.tsx`: bootstrap da aplicacao com `BrowserRouter`
- `src/app/AppShell.tsx`: shell principal, navegacao lateral e menu mobile
- `src/app/use-fiado-app.ts`: estado e integracao da operacao
- `src/app/views/`: telas de alto nivel
- `src/features/`: modulos por dominio (`auth`, `customers`, `sales`, `payments`, `charges`, `dashboard`, `system`)
- `src/shared/`: componentes reutilizaveis

## Rotas ativas

- `/login`
- `/dashboard`
- `/clientes`
- `/operacoes`
- `/cobrancas`
- `/sistema`

## Diretrizes

- O fluxo ativo mora em `src/app/` e `src/features/`
- Evite recriar paginas em `src/pages/`; esse padrao foi legado da fase anterior
- Os assets usados pela aplicacao ficam em `public/assets`
- Fontes de marca e arquivos brutos devem ficar fora do frontend publico

## Execucao

```bash
npm run dev
```

Build:

```bash
npm run build
```
