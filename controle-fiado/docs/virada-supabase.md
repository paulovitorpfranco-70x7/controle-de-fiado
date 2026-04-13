# Virada para Supabase

## Objetivo

Executar a primeira virada controlada do projeto para o modo web com Supabase,
sem depender mais do backend legado para os fluxos principais.

## Antes de virar a chave

Confirme que estes itens ja existem:

- schema inicial em `supabase/migrations/0001_initial_schema.sql`
- RPC de pagamentos em `supabase/migrations/0002_register_payment_rpc.sql`
- RPC/job de cobranca em `supabase/migrations/0003_charge_workflow_rpc.sql`
- bootstrap de perfis em `supabase/seed/0001_bootstrap_profiles.sql`
- frontend com auth dual
- frontend com data mode dual

## Ordem exata da virada

### Passo 1: Criar o projeto no Supabase

- criar projeto
- guardar `URL`
- guardar `anon key`
- guardar `service role`

### Passo 2: Aplicar SQL em ordem

No SQL Editor do Supabase, executar nesta ordem:

1. `supabase/migrations/0001_initial_schema.sql`
2. `supabase/migrations/0002_register_payment_rpc.sql`
3. `supabase/migrations/0003_charge_workflow_rpc.sql`

Nao inverter esta ordem.

## Passo 3: Criar usuarios no Auth

Criar manualmente:

- dono
- operadora

Depois:

- copiar os UUIDs de `auth.users`
- atualizar `supabase/seed/0001_bootstrap_profiles.sql`
- executar o seed no SQL Editor

## Passo 4: Validar tabelas e perfis

Confirmar:

- `profiles` criada
- `customers` criada
- `sales` criada
- `payments` criada
- `payment_allocations` criada
- `whatsapp_messages` criada
- `audit_logs` criada
- dono com role `OWNER`
- operadora com role `STAFF`

## Passo 5: Configurar frontend local

Criar `.env` do frontend com:

```env
VITE_AUTH_MODE=supabase
VITE_DATA_MODE=supabase
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Passo 6: Primeiro teste local

Rodar frontend localmente e validar:

- login do `OWNER`
- login da `STAFF`
- leitura de `profile`
- lista de clientes
- ficha do cliente
- criacao de venda
- criacao de pagamento pelo `OWNER`
- dashboard
- fila de cobranca
- envio manual de mensagem

## Passo 7: Validar restricoes

Com `STAFF`, confirmar:

- consegue entrar
- consegue ver clientes
- consegue criar venda
- nao consegue usar cobranca
- nao consegue executar job diario
- nao consegue registrar pagamento se essa restricao estiver ativa

Com `OWNER`, confirmar:

- consegue operar tudo
- consegue rodar job diario
- consegue marcar cobranca como enviada

## Passo 8: Publicar na Vercel

Depois da validacao local:

- configurar projeto da Vercel apontando para `frontend/`
- cadastrar variaveis:
  - `VITE_AUTH_MODE=supabase`
  - `VITE_DATA_MODE=supabase`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- publicar preview

Guia detalhado:

- `docs/setup-vercel-preview.md`

## Passo 9: Teste remoto real

Validar no celular:

- tela de login
- sessao
- dashboard
- clientes
- vendas
- cobrancas
- abrir `wa.me`

## Checklist de aceite da virada

- migrations aplicadas sem erro
- perfis corretos criados
- frontend autenticando via Supabase
- frontend operando com `VITE_DATA_MODE=supabase`
- `OWNER` acessa tudo
- `STAFF` respeita restricoes
- cobranca manual abre WhatsApp corretamente
- job diario cria mensagens `PENDING`

## Se algo falhar

Se a virada falhar:

1. voltar `VITE_AUTH_MODE=legacy`
2. voltar `VITE_DATA_MODE=legacy`
3. validar ambiente local antigo
4. corrigir o problema no Supabase
5. tentar novamente

## Decisao recomendada

Nao virar direto em producao.

Fazer assim:

1. validar local com Supabase
2. validar preview na Vercel
3. validar com dono e operadora
4. so depois considerar a virada oficial
