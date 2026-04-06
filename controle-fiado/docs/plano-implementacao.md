# Plano de Implementacao

## Diagnostico atual

O projeto atual e um prototipo estatico:

- `index.html`, `styles.css` e `app.js` concentram a interface
- `mocks.js` simula todos os dados
- `server.js` apenas serve arquivos estaticos
- nao existe banco, API, autenticacao ou persistencia

Isso significa que a UI pode ser reaproveitada como referencia visual, mas a aplicacao precisa ser reconstruida sobre uma base real.

## Arquitetura alvo

### Frontend

- React com Vite
- rotas para dashboard, clientes, cliente detalhado e cobrancas
- camada de servicos para consumir API
- componentes reaproveitando a linguagem visual atual

### Backend

- Node.js com Fastify
- validacao com Zod
- Prisma para acesso ao banco
- jobs agendados para cobranca automatica

### Banco

- PostgreSQL

## Modelo inicial de dados

### `users`

- id
- name
- email ou login
- password_hash
- role
- created_at

### `customers`

- id
- name
- phone
- phone_e164
- address
- credit_limit
- notes
- is_active
- created_at
- updated_at

### `sales`

- id
- customer_id
- description
- original_amount
- fee_amount
- final_amount
- sale_date
- due_date
- status
- created_by
- created_at

### `payments`

- id
- customer_id
- amount
- payment_date
- method
- notes
- created_by
- created_at

### `payment_allocations`

- id
- payment_id
- sale_id
- amount

### `whatsapp_messages`

- id
- customer_id
- sale_id
- trigger_type
- template_code
- message_body
- send_status
- provider_name
- provider_message_id
- provider_response
- scheduled_for
- sent_at
- created_by
- created_at

### `audit_logs`

- id
- actor_user_id
- action
- entity_type
- entity_id
- payload_json
- created_at

## Fases

### Fase 1: Fundacao tecnica

- inicializar app frontend moderno
- criar backend com API
- configurar banco e migracoes
- criar modelo inicial de dados
- criar seeds de desenvolvimento

### Fase 2: Operacao principal

- cadastrar cliente
- editar cliente
- listar clientes
- registrar venda fiado
- registrar pagamento
- calcular saldo real
- exibir extrato do cliente

### Fase 3: Cobranca e vencimento

- listar debitos vencendo em 3 dias
- listar debitos no vencimento
- registrar historico de mensagens
- integrar provedor de WhatsApp
- envio manual de cobranca
- job diario de envio automatico

### Fase 4: Gestao e confiabilidade

- autenticacao
- autorizacao basica
- auditoria
- testes de regras financeiras
- tratamento de erro
- logs

## Ordem recomendada de execucao

1. Criar backend, banco e migracoes.
2. Implementar clientes.
3. Implementar vendas e calculo de saldo.
4. Implementar pagamentos e rateio automatico.
5. Trocar o frontend de mocks para API real.
6. Implementar tela de cobrancas com dados reais.
7. Integrar WhatsApp.
8. Adicionar autenticacao e auditoria.

## Decisoes tecnicas recomendadas

- nao usar `localStorage` como persistencia principal
- nao acoplar regra de cobranca ao frontend
- nao disparar WhatsApp diretamente da tela sem registrar em banco
- nao calcular saldo apenas por campo salvo no cliente

## Proximo passo de desenvolvimento

O proximo passo pratico deve ser montar a nova base da aplicacao com:

- `frontend/`
- `backend/`
- `prisma/`
- schema inicial
- API minima de clientes

Depois disso, a UI atual pode ser portada modulo por modulo.

