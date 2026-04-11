# Arquitetura Limpa do Controle de Fiado

## Objetivo

Preparar a base para evoluir clientes, vendas, pagamentos, cobrancas e autenticacao sem acoplar regra de negocio ao Fastify, Prisma ou React.

## Principios

- regra de negocio fica no centro
- framework e banco ficam nas bordas
- casos de uso orquestram o sistema
- integracoes externas entram por contratos
- frontend cresce por `pages`, `features` e `shared`

## Estrutura alvo

### Backend

```text
backend/src/
  domain/
    customers/
    sales/
    payments/
    whatsapp/
  application/
    customers/
      dto/
      use-cases/
    sales/
      dto/
      use-cases/
    payments/
      dto/
      use-cases/
    charges/
      use-cases/
    ports/
  infra/
    db/
      prisma/
        repositories/
    observability/
    whatsapp/
    jobs/
  interfaces/
    http/
      modules/
```

### Frontend

```text
frontend/src/
  app/
  pages/
  features/
    customers/
    sales/
    payments/
    charges/
  shared/
    api/
    components/
    hooks/
    utils/
```

## Regra de dependencia

As dependencias devem sempre apontar para dentro:

- `interfaces` pode depender de `application`
- `infra` pode depender de `application` e `domain`
- `application` pode depender de `domain`
- `domain` nao depende de nada externo

## Fluxo padrao do backend

1. rota/controller recebe request HTTP
2. schema valida input
3. controller chama um use case
4. use case usa portas como repositores, auditoria e provider externo
5. infraestrutura implementa essas portas com Prisma, jobs e WhatsApp
6. resposta volta sem expor detalhes de infraestrutura

## Exemplo adotado agora

O modulo de clientes foi reorganizado nesse padrao:

- `domain/customers/customer.ts`
- `application/customers/use-cases/*`
- `application/ports/customer-repository.ts`
- `infra/db/prisma/repositories/prisma-customer-repository.ts`
- `interfaces/http/modules/customers/*`

## Contratos que ja existem para crescer

- `CustomerRepository`
- `AuditLogService`
- `WhatsAppProvider`

Esses contratos existem para que as proximas features nascam no desenho certo.

## Como implementar cada proximo modulo

### Sales

- entidade e regras de vencimento e acrescimo em `domain/sales`
- `RegisterSaleUseCase`
- `SaleRepository`
- repositorio Prisma
- controller e routes HTTP

### Payments

- regra de rateio automatico em `domain/payments`
- `RegisterPaymentUseCase`
- `PaymentRepository`
- `PaymentAllocationRepository`
- testes obrigatorios de rateio

### Charges

- `ListDueChargesUseCase`
- `SendManualChargeUseCase`
- `RunDailyChargeJobUseCase`
- persistir historico antes e depois do envio

### Auth

- `AuthenticateUserUseCase`
- `PasswordHasher`
- `TokenService`
- middleware HTTP apenas valida identidade, nao decide regra de negocio

## Regras arquiteturais obrigatorias

- nenhuma regra financeira deve ficar em controller
- nenhum use case deve importar Prisma diretamente
- nenhum componente React deve calcular regra financeira critica
- saldo do cliente sempre deriva de vendas e pagamentos
- WhatsApp sempre passa por provider + persistencia de historico
- auditoria deve entrar pelos use cases, nao pela UI

## Ordem recomendada

1. fechar a arquitetura de clientes
2. criar modulo de vendas
3. criar modulo de pagamentos com testes
4. criar extrato do cliente
5. criar cobrancas e job diario
6. adicionar autenticacao e auditoria persistida
7. portar o prototipo visual para as features reais
