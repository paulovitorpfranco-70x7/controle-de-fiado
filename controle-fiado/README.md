# Controle de Fiado

Nova base do sistema para transformar o prototipo atual em uma aplicacao real com:

- frontend React
- backend Fastify
- Prisma
- PostgreSQL ou SQLite para desenvolvimento inicial
- preparacao para cobrancas por WhatsApp

## Estrutura

- `frontend/`: interface do sistema
- `backend/`: API e regras de negocio
- `prisma/`: schema do banco
- `docs/`: requisitos e plano de implementacao

## Fluxo sugerido

1. Instalar dependencias na raiz com `npm install`
2. Copiar `backend/.env.example` para `backend/.env`
3. Rodar `npm run db:generate`
4. Rodar `npm run db:migrate`
5. Rodar `npm run db:seed`
6. Subir backend com `npm run dev:backend`
7. Subir frontend com `npm run dev:frontend`

## Observacao

O prototipo antigo continua nos arquivos da raiz (`index.html`, `app.js`, `styles.css`) como referencia visual. A implementacao real deve evoluir dentro de `frontend/` e `backend/`.

