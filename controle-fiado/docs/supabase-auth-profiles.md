# Auth e Profiles no Supabase

## Objetivo

Definir como o login e os perfis do app vao funcionar no Supabase, mantendo o
controle de acesso simples e seguro para o contexto atual:

- `OWNER` com acesso total
- `STAFF` com acesso operacional limitado

## Decisao principal

Separar claramente:

- autenticacao: `auth.users`
- perfil de negocio: `public.profiles`

Isso evita misturar:

- login
- papel de acesso
- dados do usuario dentro do sistema

## Estrutura

### auth.users

Responsabilidade:

- email
- senha
- sessao
- recuperacao de acesso

### public.profiles

Responsabilidade:

- nome exibido no sistema
- papel (`OWNER` ou `STAFF`)
- status ativo/inativo
- vinculo com o usuario autenticado

Campos principais:

- `id`
- `auth_user_id`
- `name`
- `role`
- `is_active`
- `created_at`
- `updated_at`

## Fluxo de autenticacao

### Login

1. usuario informa email e senha
2. frontend chama Supabase Auth
3. Supabase valida a credencial
4. frontend consulta `public.profiles`
5. app monta a sessao interna com:
   - `profile_id`
   - `name`
   - `role`
   - `is_active`

### Validacao de sessao

Ao carregar o app:

1. frontend pede sessao atual ao Supabase
2. se houver sessao, busca `profile`
3. se `profile.is_active = false`, o usuario e tratado como bloqueado

### Logout

1. frontend chama `supabase.auth.signOut()`
2. estado local e limpo
3. usuario volta para a tela de login

## Regra de perfis

### OWNER

Pode:

- acessar tudo
- gerenciar clientes
- registrar vendas
- registrar pagamentos
- enviar cobrancas
- ver auditoria
- executar rotinas administrativas
- criar ou ajustar equipe em fase posterior

### STAFF

Pode:

- acessar operacao do dia a dia
- cadastrar clientes
- editar clientes
- registrar vendas

Nao pode:

- enviar cobranca
- acessar auditoria
- alterar configuracoes
- operar acoes administrativas

## Como criar o primeiro OWNER

### Opcao recomendada

Criar o primeiro usuario manualmente no painel do Supabase Auth e depois inserir
o `profile` correspondente.

Passo a passo:

1. criar usuario no painel Auth
2. copiar o `id` desse usuario
3. executar SQL de bootstrap do `OWNER`

Exemplo:

```sql
insert into public.profiles (
  auth_user_id,
  name,
  role,
  is_active
)
values (
  'UUID_DO_AUTH_USER',
  'Nome do Dono',
  'OWNER',
  true
);
```

### Motivo

Isso reduz a complexidade inicial e evita criar onboarding administrativo cedo
demais.

## Como criar a STAFF

### Fase inicial recomendada

Tambem criar manualmente:

1. criar usuario no Auth
2. inserir `profile` com role `STAFF`

Exemplo:

```sql
insert into public.profiles (
  auth_user_id,
  name,
  role,
  is_active
)
values (
  'UUID_DA_ATENDENTE',
  'Nome da Atendente',
  'STAFF',
  true
);
```

### Fase posterior

Se o produto amadurecer, o `OWNER` pode ganhar tela para:

- convidar usuario
- ativar/inativar perfil
- trocar papel

Mas isso nao e prioridade agora.

## Regra de seguranca importante

Nao confiar apenas no frontend para saber se o usuario e `OWNER` ou `STAFF`.

O frontend pode:

- esconder botoes
- ajustar navegacao

Mas a protecao real deve estar em:

- `profiles`
- RLS
- policies do banco

## Consulta minima de perfil

Depois do login, o frontend deve carregar algo equivalente a:

```sql
select id, name, role, is_active
from public.profiles
where auth_user_id = auth.uid();
```

## Casos que precisam ser tratados

### Usuario autenticado sem profile

Situacao:

- o login existe no Auth
- nao existe linha correspondente em `public.profiles`

Tratamento recomendado:

- bloquear acesso ao app
- mostrar mensagem de usuario sem permissao

### Usuario inativo

Situacao:

- existe `profile`
- `is_active = false`

Tratamento recomendado:

- permitir login tecnico
- bloquear uso do sistema
- mostrar mensagem de acesso desativado

### Usuario com role inesperada

Situacao:

- valor fora do esperado ou profile inconsistente

Tratamento recomendado:

- tratar como acesso invalido
- nao carregar modulo algum

## Estrategia do frontend

O frontend deve ter uma camada de sessao com:

- sessao do Supabase
- `profile`
- `role`
- funcoes `login`, `logout`, `refreshProfile`

Componentes e rotas devem depender dessa camada, nao de checks espalhados.

## Estrategia de migracao da auth atual

Hoje o projeto tem autenticacao propria.

Na migracao:

1. Supabase Auth vira a fonte oficial da sessao
2. `profiles` vira a fonte oficial do papel do usuario
3. a auth atual do backend deixa de ser o centro

## Checklist de implementacao

- criar projeto Supabase
- ativar email/senha
- criar primeiro usuario `OWNER`
- inserir `profile` do `OWNER`
- criar usuario `STAFF`
- inserir `profile` da `STAFF`
- implementar leitura de `profile` no frontend
- bloquear usuario sem `profile`
- bloquear usuario inativo
- adaptar UI por `role`

## Decisao recomendada

Para a fase atual:

- criar usuarios manualmente no painel do Supabase
- criar `profiles` manualmente via SQL
- nao construir onboarding administrativo ainda

Isso e mais simples, seguro e suficiente para o tamanho do projeto agora.
