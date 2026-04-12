# Setup Supabase + Vercel

## Objetivo

Definir o passo a passo pratico para subir a nova base web com:

- Supabase para auth e banco
- Vercel para frontend

Este documento cobre apenas a preparacao inicial do ambiente.

## Ordem recomendada

1. criar projeto no Supabase
2. aplicar schema inicial
3. criar usuarios do piloto
4. criar `profiles`
5. configurar frontend para usar Supabase
6. publicar frontend na Vercel
7. validar login e leitura de dados

## Parte 1: Criar projeto no Supabase

### Criacao do projeto

- acessar o painel do Supabase
- criar um novo projeto
- escolher nome simples do projeto
- escolher regiao mais proxima do usuario
- definir senha forte do banco

### Guardar com cuidado

Anote e guarde:

- `Project URL`
- `anon public key`
- `service role key`
- senha do banco

Observacao:

- `service role key` nao vai para o frontend

## Parte 2: Aplicar schema inicial

No SQL Editor do Supabase:

1. abrir um novo query
2. colar o conteudo de `supabase/migrations/0001_initial_schema.sql`
3. executar
4. confirmar que as tabelas foram criadas

Tabelas esperadas:

- `profiles`
- `customers`
- `sales`
- `payments`
- `payment_allocations`
- `whatsapp_messages`
- `audit_logs`

## Parte 3: Configurar Auth

No painel do Supabase:

- abrir `Authentication`
- habilitar login por email e senha
- desabilitar providers desnecessarios nesta fase

### Recomendacao inicial

Para o piloto:

- usar apenas email e senha
- nao abrir cadastro publico

## Parte 4: Criar usuarios iniciais

Criar manualmente no painel Auth:

- usuario do dono
- usuario da operadora

Depois:

- copiar os `UUIDs` de `auth.users`
- substituir no arquivo `supabase/seed/0001_bootstrap_profiles.sql`
- rodar o SQL no editor

Resultado esperado:

- dono com `OWNER`
- operadora com `STAFF`

## Parte 5: Validar profiles

Depois do bootstrap:

- abrir `Table Editor`
- validar se `profiles` tem 2 linhas
- confirmar `role` correto
- confirmar `is_active = true`

## Parte 6: Configurar frontend

Criar ou atualizar variaveis de ambiente do frontend:

```env
VITE_AUTH_MODE=supabase
VITE_DATA_MODE=legacy
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Nesta fase ainda nao colocar:

- `service_role`
- senha de banco

Observacao:

- manter `VITE_DATA_MODE=legacy` enquanto os modulos de dados ainda nao forem migrados
- mudar para `VITE_DATA_MODE=supabase` por modulo, quando estiver pronto

## Parte 7: Preparar Vercel

### Criar projeto

- importar o repositorio na Vercel
- apontar o projeto para `frontend/`
- confirmar framework Vite/React

### Variaveis na Vercel

Cadastrar:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Build

Confirmar:

- root directory correta
- build command do frontend
- output directory do frontend

## Parte 8: Primeira validacao

Checklist minimo:

- frontend publicado abre sem erro
- tela de login abre
- dono consegue logar
- operadora consegue logar
- app consegue buscar `profile`
- dono e operadora recebem o papel correto

## Parte 9: Validacoes de seguranca

Confirmar no piloto inicial:

- usuario sem `profile` nao entra
- usuario inativo nao opera
- `STAFF` nao ve acoes de cobranca
- `STAFF` nao ve acoes administrativas

## Parte 10: O que ainda nao fazer

Nesta etapa, ainda nao e hora de:

- publicar regra financeira critica no frontend
- liberar pagamentos sem camada segura
- abrir cadastro livre de usuarios
- expor `service role key`

## Resultado esperado desta fase

Ao final desta configuracao, o projeto deve ter:

- Supabase criado
- schema aplicado
- dois usuarios reais criados
- `profiles` funcionando
- frontend pronto para integrar auth e dados
- Vercel pronta para hospedar

## Proximo passo depois deste setup

Depois que isso estiver pronto, a ordem recomendada e:

1. migrar login
2. migrar clientes
3. migrar vendas
4. so depois migrar pagamentos
