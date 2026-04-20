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

## Arquitetura

- backend organizado em `domain`, `application`, `infra` e `interfaces`
- frontend organizado em `pages`, `features` e `shared`
- modulo de clientes ja segue esse padrao
- referencia arquitetural em `docs/arquitetura-limpa.md`

## Fluxo sugerido

1. Instalar dependencias na raiz com `npm install`
2. Copiar `backend/.env.example` para `backend/.env`
3. Rodar `npm run db:generate`
4. Rodar `npm run db:migrate`
5. Rodar `npm run db:seed`
6. Subir backend com `npm run dev:backend`
7. Subir frontend com `npm run dev:frontend`

## Login de desenvolvimento

- usuario: `tonhao`
- senha: `tonhao123`

## Testes

- backend: `npm run test:backend`

## Frontend web

Para a fase web com Supabase + Vercel:

- usar `frontend/.env` ou `frontend/.env.example`
- manter:
  - `VITE_AUTH_MODE=supabase`
  - `VITE_DATA_MODE=supabase`

O deploy de preview na Vercel deve apontar para:

- `frontend/`

Guia:

- `docs/setup-vercel-preview.md`
- `docs/go-live-checklist.md`
- `docs/manual-usuario-final.md`
- `docs/manual-administrador.md`
- `docs/proposta-entrega-final.md`

## Operacao local

- backup do SQLite: `npm run db:backup`
- migracao segura do SQLite: `npm run db:migrate:safe -- nome_da_migracao`
- restauracao do SQLite: ver `docs/operacao-sqlite.md`
- `LOG_LEVEL` pode ser ajustado em `backend/.env`
- `AUTH_TTL_SECONDS` controla a expiracao do token em segundos
- `ENABLE_DAILY_CHARGE_SCHEDULER=true` liga o scheduler diario local
- `DAILY_CHARGE_SCHEDULE_TIME="09:00"` define o horario diario do job
- `WHATSAPP_PROVIDER="wa_link"` usa o fluxo manual com link do WhatsApp como padrao
- `WHATSAPP_PROVIDER="meta_cloud"` ativa a integracao real com a Meta Cloud API
- configurar `META_WHATSAPP_ACCESS_TOKEN` e `META_WHATSAPP_PHONE_NUMBER_ID` para envio real

## Estrategia de WhatsApp atual

- modo padrao do projeto: `wa_link`
- o sistema prepara a mensagem, gera o link `wa.me` e o operador envia manualmente no WhatsApp
- isso reduz custo e risco operacional para o cenario atual de um unico usuario

## Regra de datas

- o sistema considera datas no horario local do comercio
- `dueDate` e tratado como final do dia local
- isso evita erro de vencimento por conversao UTC em campos `type="date"`

## Observacao

O prototipo antigo continua nos arquivos da raiz (`index.html`, `app.js`, `styles.css`) como referencia visual. A implementacao real deve evoluir dentro de `frontend/` e `backend/`.
