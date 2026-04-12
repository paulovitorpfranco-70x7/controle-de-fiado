# Schema Alvo do Supabase

## Objetivo

Definir a primeira versao do schema no Supabase para substituir o modelo atual
`Prisma + SQLite` por `Postgres + Auth + RLS`.

Arquivo base:

- `supabase/migrations/0001_initial_schema.sql`

## Premissas

- app web com acesso remoto
- dois perfis principais: `OWNER` e `STAFF`
- `OWNER` pode cobrar manualmente e ver tudo
- `STAFF` opera clientes e vendas
- cobranca segue manual via `wa.me`
- regra financeira critica nao deve depender apenas do frontend

## Mapeamento do modelo atual

### User -> profiles

O modelo atual `User` deixa de ser tabela de login principal.

No Supabase:

- login fica em `auth.users`
- dados de dominio do usuario ficam em `public.profiles`

Campos principais:

- `auth_user_id`
- `name`
- `role`
- `is_active`

## Entidades

### profiles

Uso:

- perfil do usuario autenticado
- papel de autorizacao
- vinculo com `auth.users`

Decisao:

- separar auth da regra do negocio
- permitir evoluir perfil sem depender da tabela interna do Supabase

### customers

Uso:

- cadastro principal do cliente
- base para vendas, pagamentos e mensagens

Decisao:

- manter estrutura muito proxima do modelo atual
- preservar `phone_e164` para compatibilidade futura

### sales

Uso:

- debito gerado por venda fiado
- saldo remanescente por titulo
- vencimento por titulo

Decisao:

- `remaining_amount_cents` permanece salvo
- `status` permanece salvo
- `due_date >= sale_date` vira `check constraint`

### payments

Uso:

- registro do pagamento recebido

Decisao:

- insercao inicial permitida apenas para `OWNER`
- isso reduz risco enquanto a regra de rateio ainda nao foi migrada para RPC

### payment_allocations

Uso:

- historico do rateio do pagamento sobre os debitos

Decisao:

- continua como tabela separada
- ownership restrita a operacoes controladas

### whatsapp_messages

Uso:

- fila e historico de cobranca

Decisao:

- manter `PENDING`, `SENT`, `FAILED`, `CANCELED`
- manter `trigger_type`
- manter `provider_name`
- o provider inicial esperado e `wa_link`

### audit_logs

Uso:

- trilha de auditoria

Decisao:

- leitura apenas para `OWNER`
- manter `payload_json` em `jsonb`

## Tipos e enums

Enums previstos:

- `app_role`
- `sale_status`
- `payment_method`
- `whatsapp_trigger_type`
- `whatsapp_send_status`

## Indices principais

Indices definidos no SQL inicial:

- `sales(customer_id, due_date)`
- `sales(status, due_date)`
- `payments(customer_id, payment_date)`
- `payment_allocations(payment_id)`
- `payment_allocations(sale_id)`
- `whatsapp_messages(customer_id, created_at desc)`
- `whatsapp_messages(sale_id, trigger_type, send_status, created_at desc)`
- `whatsapp_messages(send_status, scheduled_for)`
- `audit_logs(entity_type, entity_id)`
- `audit_logs(action, created_at desc)`

## RLS inicial

### Regra geral

- usuario autenticado pode ler operacao basica
- `OWNER` tem permissao administrativa
- `STAFF` nao pode enviar cobranca nem mexer em auditoria

### OWNER

Pode:

- ver tudo
- editar tudo relevante
- criar pagamentos
- criar mensagens
- consultar auditoria

### STAFF

Pode:

- ler operacao
- criar clientes
- editar clientes
- criar vendas

Nao pode:

- criar cobrancas
- ler auditoria
- alterar pagamentos/alocacoes manualmente

## Ponto importante sobre pagamentos

No schema inicial, `payments` e `payment_allocations` ficam mais restritos do que
o desejado no produto final.

Motivo:

- a regra de rateio automatico ainda precisa ser migrada com seguranca
- permitir escrita ampla cedo demais aumenta risco financeiro

Direcao recomendada:

- migrar o rateio para RPC ou Edge Function
- depois liberar a operacao exata que fizer sentido

## Ponto importante sobre cobrancas

O cron diario nao precisa enviar mensagem.

Ele deve:

- localizar titulos que vencem em 3 dias
- localizar titulos que vencem hoje
- criar lembretes `PENDING`
- evitar duplicidade por `sale_id + trigger_type`

O envio final continua:

- manual
- pelo `OWNER`
- via `wa.me`

## Ordem de implementacao recomendada

1. criar projeto Supabase
2. aplicar `0001_initial_schema.sql`
3. criar o primeiro `OWNER`
4. testar login
5. testar leitura de `profiles`
6. testar insercao de `customers`
7. testar insercao de `sales`
8. so depois migrar `payments`

## O que ainda nao esta neste schema

Ainda faltara definir em detalhe:

- RPC para criar pagamento com rateio
- RPC para gerar fila diaria
- RPC ou action para registrar auditoria de forma centralizada
- seeds de homologacao
- views de dashboard, se forem uteis

## Decisao recomendada

Este schema inicial ja e suficiente para comecar a migracao real para Supabase,
mas a parte financeira deve ser migrada em duas etapas:

1. schema + auth + operacao basica
2. RPCs e regras transacionais criticas
