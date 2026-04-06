# Setup da Nova Base

## O que foi criado

- monorepo com `frontend` e `backend`
- schema inicial em `prisma/schema.prisma`
- backend Fastify com rota de health e clientes
- frontend React com tela inicial consumindo `GET /api/customers`

## Como subir

1. Na raiz do projeto, rode `npm install`
2. Copie `backend/.env.example` para `backend/.env`
3. Rode `npm run db:generate`
4. Rode `npm run db:migrate`
5. Rode `npm run db:seed`
6. Em um terminal, rode `npm run dev:backend`
7. Em outro terminal, rode `npm run dev:frontend`

## Primeiros proximos passos

- implementar detalhes do cliente
- criar modulo de vendas
- criar modulo de pagamentos
- trocar frontend de leitura simples para fluxo operacional
- adicionar modulo de mensagens WhatsApp

