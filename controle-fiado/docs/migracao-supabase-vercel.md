# Migracao para Supabase + Vercel

## Objetivo

Migrar a arquitetura atual do sistema para um modelo web hospedado, acessivel de
qualquer lugar, com custo inicial zero ou muito proximo de zero.

Arquitetura alvo:

- frontend hospedado na Vercel
- autenticacao no Supabase Auth
- banco de dados no Supabase Postgres
- controle de acesso por perfil
- cobranca manual via `wa.me`
- rotina diaria para gerar fila de cobrancas

## Motivo da migracao

A arquitetura atual foi montada para um contexto local:

- uso em maquina unica
- banco `SQLite`
- backend Fastify local
- operacao de baixo custo no PC do usuario

O novo contexto mudou:

- o app precisa rodar via web
- o dono quer acessar de qualquer lugar
- havera pelo menos dois usuarios
- a operadora vai usar o sistema no dia a dia
- o dono tera acesso total e sera responsavel pelas cobrancas

Nesse cenario, o modelo local deixa de ser o mais adequado.

## Contexto de negocio alvo

Perfis esperados:

- `OWNER`
  - acesso total
  - consulta geral
  - envio manual de cobrancas
  - controle operacional
- `STAFF`
  - cadastro de clientes
  - registro de vendas
  - operacao limitada

Fluxo de cobranca:

- o sistema gera a fila de cobrancas
- o dono revisa
- o dono abre o WhatsApp
- o envio e manual

## Arquitetura atual

Hoje o projeto esta estruturado como:

- `frontend/` em React + Vite
- `backend/` em Fastify
- `prisma/` com schema e persistencia
- `SQLite` como banco atual
- autenticacao propria
- scheduler proprio

Pontos que podem ser reaproveitados:

- regras de dominio
- modelagem conceitual das entidades
- fluxo de vendas, pagamentos e extrato
- regras de cobranca
- estrutura geral do frontend
- documentacao de negocio

Pontos que deixam de ser o centro:

- Fastify como API principal
- Prisma como camada principal de acesso a dados
- `SQLite` como persistencia principal
- autenticacao customizada atual

## Arquitetura alvo

### Frontend

- React hospedado na Vercel
- consumo direto de dados/autenticacao do Supabase
- mesma experiencia em desktop e smartphone

### Banco

- Supabase Postgres
- tabelas principais do dominio
- indices e constraints equivalentes ao modelo atual

### Autenticacao

- Supabase Auth
- login por email e senha
- sessao gerenciada pelo Supabase

### Autorizacao

- tabela de perfis do app
- `OWNER` e `STAFF`
- Row Level Security no banco

### Rotinas

- rotina diaria para gerar lembretes de cobranca
- preferencia por cron no Supabase ou Edge Function agendada

### WhatsApp

- manter fluxo manual via `wa.me`
- nao depender de API paga nesta fase

## Modelo de dados alvo

Tabelas previstas:

- `profiles`
- `customers`
- `sales`
- `payments`
- `payment_allocations`
- `whatsapp_messages`
- `audit_logs`

### Profiles

Responsavel por complementar `auth.users`.

Campos sugeridos:

- `id`
- `auth_user_id`
- `name`
- `role`
- `is_active`
- `created_at`
- `updated_at`

### Customers

Campos principais:

- `id`
- `name`
- `phone`
- `phone_e164`
- `address`
- `credit_limit_cents`
- `notes`
- `is_active`
- `created_at`
- `updated_at`

### Sales

Campos principais:

- `id`
- `customer_id`
- `description`
- `original_amount_cents`
- `fee_amount_cents`
- `final_amount_cents`
- `remaining_amount_cents`
- `sale_date`
- `due_date`
- `status`
- `created_by_profile_id`
- `created_at`
- `updated_at`

### Payments

Campos principais:

- `id`
- `customer_id`
- `amount_cents`
- `payment_date`
- `method`
- `notes`
- `created_by_profile_id`
- `created_at`

### Payment Allocations

Campos principais:

- `id`
- `payment_id`
- `sale_id`
- `amount_cents`

### WhatsApp Messages

Campos principais:

- `id`
- `customer_id`
- `sale_id`
- `trigger_type`
- `message_body`
- `send_status`
- `provider_name`
- `provider_message_id`
- `provider_response`
- `scheduled_for`
- `sent_at`
- `created_by_profile_id`
- `created_at`

### Audit Logs

Campos principais:

- `id`
- `actor_profile_id`
- `action`
- `entity_type`
- `entity_id`
- `payload_json`
- `created_at`

## Regras criticas que precisam ser preservadas

Estas regras nao podem se perder na migracao:

- saldo do cliente e derivado, nunca digitado
- pagamento abate os debitos mais antigos primeiro
- venda muda de status conforme saldo e vencimento
- cobranca automatica nao duplica por `sale + trigger`
- envio manual de cobranca continua registrado em historico
- operadora nao pode enviar cobranca

## Estrategia de seguranca

### OWNER

Permissoes:

- ler tudo
- criar/editar clientes
- criar vendas
- registrar pagamentos
- ver dashboard completo
- ver auditoria
- enviar cobrancas
- executar rotina de cobranca, se exposta manualmente

### STAFF

Permissoes:

- ler clientes necessarios para operacao
- criar clientes
- editar dados operacionais de clientes
- criar vendas
- opcional: registrar pagamentos

Restricoes:

- nao enviar cobrancas
- nao acessar auditoria
- nao alterar configuracoes

## Estrategia de migracao

### Fase 1: Preparacao

- congelar novas features estruturais
- consolidar requisitos de perfis e acesso remoto
- criar projeto Supabase
- criar projeto Vercel

Guia pratico desta fase:

- `docs/setup-supabase-vercel.md`

### Fase 2: Modelagem no Supabase

- traduzir schema atual para SQL/Postgres
- criar tabelas
- criar enums equivalentes, quando fizer sentido
- criar indices
- criar constraints
- criar seeds basicos de homologacao

Arquivos base desta fase:

- `supabase/migrations/0001_initial_schema.sql`
- `docs/supabase-schema-alvo.md`

### Fase 3: Auth e perfis

- ligar Supabase Auth
- criar fluxo de login
- criar tabela `profiles`
- vincular usuario autenticado ao perfil do app
- definir `OWNER` e `STAFF`

Arquivos base desta fase:

- `docs/supabase-auth-profiles.md`
- `supabase/seed/0001_bootstrap_profiles.sql`

### Fase 4: RLS

- criar policies de leitura e escrita
- restringir acoes do `STAFF`
- garantir acesso total do `OWNER`
- validar acesso pelo banco, nao apenas pelo frontend

### Fase 5: Migracao funcional por modulo

Ordem recomendada:

1. autenticacao
2. clientes
3. vendas
4. pagamentos
5. extrato
6. cobrancas
7. dashboard
8. auditoria

### Fase 6: Rotina diaria

- reimplementar a geracao diaria da fila de cobranca
- usar cron do Supabase ou funcao agendada
- registrar mensagens `PENDING`
- manter deduplicacao

### Fase 7: WhatsApp manual

- manter `wa.me`
- gerar mensagem pronta
- abrir link no dispositivo do dono
- registrar historico no banco

### Fase 8: Publicacao

- publicar frontend na Vercel
- configurar variaveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- validar acesso por smartphone
- validar sessao e logout

### Fase 9: Piloto

- cadastrar os dois usuarios reais
- validar operacao da atendente
- validar consulta do dono
- validar fila de cobranca
- validar backup/exportacao minima

## O que fazer com o backend atual

O backend atual nao precisa ser descartado imediatamente.

Ele pode ser usado como:

- referencia das regras atuais
- base para comparar comportamento
- fonte de migracao das regras financeiras

Mas o objetivo e que ele deixe de ser a peca central da producao.

## O que vai mudar no frontend

Mudancas principais:

- sair de `http fetch` para camada baseada em Supabase
- trocar auth atual por sessao do Supabase
- adaptar listagens e formularios para operacoes no banco hospedado

Mudancas que devem ser evitadas neste momento:

- refatoracao visual grande
- redesign desnecessario
- mudanca de fluxo de operacao do usuario

## Estrategia para regras financeiras

Estas regras devem continuar fora de componentes React:

- calculo de valores finais
- rateio de pagamentos
- atualizacao de saldo
- atualizacao de status de venda
- geracao da fila diaria

Opcoes validas:

- funcoes SQL / RPC
- Edge Functions
- combinacao de transacao no banco com camada fina no frontend

Evitar:

- deixar regra critica apenas no cliente

## Riscos principais

### Risco 1: perder consistencia financeira

Mitigacao:

- migrar primeiro as regras
- testar pagamentos parciais
- testar vendas vencidas
- testar extrato

### Risco 2: RLS mal configurada

Mitigacao:

- validar com usuario `OWNER`
- validar com usuario `STAFF`
- testar proibicoes explicitamente

### Risco 3: depender demais do frontend

Mitigacao:

- manter logica critica no banco/funcoes
- frontend apenas orquestra e apresenta

### Risco 4: migrar tudo de uma vez

Mitigacao:

- migracao por modulo
- validar cada modulo antes de passar ao proximo

## Ordem pratica recomendada

1. Criar projeto Supabase
2. Criar schema e perfis
3. Implementar login real
4. Migrar clientes
5. Migrar vendas
6. Migrar pagamentos
7. Migrar extrato
8. Migrar cobrancas
9. Publicar frontend na Vercel
10. Executar piloto com `OWNER` e `STAFF`

## Critério de pronto

A migracao pode ser considerada pronta quando:

- dono acessa pelo celular
- operadora acessa pelo navegador
- login e perfis funcionam
- clientes, vendas e pagamentos funcionam
- fila de cobranca funciona
- dono consegue enviar cobranca manual
- nao ha erro de saldo ou vencimento

## Decisao recomendada

Para o novo cenario do projeto, a recomendacao e:

- seguir com Vercel + Supabase
- manter WhatsApp manual
- migrar por etapas
- preservar regras de negocio antes de pensar em novas features
