# Manual do Administrador

## Objetivo

Este manual resume o minimo que o responsavel tecnico ou dono precisa saber
para manter o sistema funcionando em operacao.

## Responsabilidades do administrador

O administrador deve conseguir:

- confirmar se o sistema esta no ar
- criar e bloquear usuarios
- conferir se o perfil do usuario esta correto
- saber onde ficam Vercel e Supabase
- agir em caso de erro operacional

## 1. Estrutura atual

O sistema usa:

- `Vercel` para hospedar o frontend
- `Supabase` para login, banco e permissoes

Perfis:

- `OWNER`: acesso total
- `STAFF`: operacao limitada

## 2. Onde verificar se o sistema esta no ar

### Vercel

Conferir:

- se o ultimo deploy esta com status verde
- se a URL oficial abre normalmente

Sinais de problema:

- deploy com erro
- tela branca
- login nao abre

### Supabase

Conferir:

- se o projeto esta ativo
- se Auth e banco estao respondendo

Sinais de problema:

- usuario nao consegue entrar
- dados nao carregam
- erro de permissao inesperado

## 3. Como criar um usuario

Hoje o processo e manual.

### Passo 1: criar no Auth

No painel do Supabase:

1. abrir `Authentication`
2. criar usuario com email e senha

### Passo 2: criar profile

Depois inserir a linha correspondente em `public.profiles`.

Campos principais:

- `auth_user_id`
- `name`
- `role`
- `is_active`

Exemplo `OWNER`:

```sql
insert into public.profiles (
  auth_user_id,
  name,
  role,
  is_active
)
values (
  'UUID_DO_USUARIO',
  'Nome do Dono',
  'OWNER',
  true
);
```

Exemplo `STAFF`:

```sql
insert into public.profiles (
  auth_user_id,
  name,
  role,
  is_active
)
values (
  'UUID_DO_USUARIO',
  'Nome da Operadora',
  'STAFF',
  true
);
```

## 4. Como bloquear um usuario

Opcao mais simples:

1. localizar a linha na tabela `profiles`
2. mudar `is_active` para `false`

Exemplo:

```sql
update public.profiles
set is_active = false
where auth_user_id = 'UUID_DO_USUARIO';
```

Com isso:

- o usuario pode ate existir no Auth
- mas nao consegue operar no sistema

## 5. Como conferir se o perfil esta correto

Consultar:

```sql
select id, auth_user_id, name, role, is_active
from public.profiles
order by created_at desc;
```

Confirmar:

- se o nome esta correto
- se o papel esta correto
- se `is_active` esta correto

## 6. O que validar depois de publicar uma nova versao

Depois de cada deploy:

1. abrir a URL oficial
2. testar login `OWNER`
3. testar login `STAFF`
4. abrir `Clientes`
5. registrar uma venda de teste, se necessario
6. validar pagamento com `OWNER`
7. validar `Cobrar` com `OWNER`
8. validar no celular

## 7. Backup e restauracao

O sistema nao deve ficar sem estrategia de backup.

O administrador precisa definir:

- frequencia do backup
- onde o backup fica guardado
- quem sabe restaurar

Minimo recomendado:

- backup recorrente do banco
- teste de restauracao em ambiente controlado

## 8. Quando um erro exige parada

Considere incidente critico se ocorrer:

- saldo incorreto
- pagamento aplicado no titulo errado
- usuario `STAFF` vendo area de `OWNER`
- login falhando para todos
- sistema indisponivel
- duplicidade de dado financeiro

## 9. Resposta rapida a incidentes

### Caso: usuario nao consegue entrar

Conferir:

- se o usuario existe no Auth
- se existe linha correspondente em `profiles`
- se `is_active = true`

### Caso: tela abre mas sem dados

Conferir:

- status do Supabase
- erros de deploy na Vercel
- se houve mudanca recente de variaveis

### Caso: erro financeiro

Acao imediata:

1. parar uso da funcionalidade afetada
2. registrar o cliente e a operacao envolvida
3. nao corrigir no improviso sem rastrear causa
4. validar no banco antes de seguir

## 10. O que o administrador nao deve fazer

- nao expor `service_role` no frontend
- nao criar usuarios sem criar `profile`
- nao trocar role de usuario sem validar acesso
- nao publicar mudanca sem teste basico
- nao corrigir erro financeiro apenas pela interface sem entender o impacto

## 11. Checklist rapido do administrador

Todo inicio de periodo importante:

- Vercel ok
- Supabase ok
- login `OWNER` ok
- login `STAFF` ok

Quando entrar novo funcionario:

- criar usuario no Auth
- criar `profile`
- testar login

Quando alguem sair:

- marcar `is_active = false`

Depois de deploy:

- validar fluxos principais

## Resumo

O administrador nao precisa programar o sistema no dia a dia.

Mas precisa saber:

- onde criar e bloquear usuarios
- onde conferir deploy
- onde conferir banco
- quando parar a operacao e chamar suporte
