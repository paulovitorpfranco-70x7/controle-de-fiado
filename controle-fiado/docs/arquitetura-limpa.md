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
3. guard de autenticacao protege modulos de negocio
4. controller chama um use case
5. use case usa portas como repositores, auditoria e provider externo
6. infraestrutura implementa essas portas com Prisma, jobs e WhatsApp
7. resposta volta sem expor detalhes de infraestrutura

## Exemplo adotado agora

Os modulos de clientes, vendas e pagamentos ja seguem esse padrao:

- `domain/customers/customer.ts`
- `domain/sales/sale.ts`
- `domain/payments/payment.ts`
- `domain/payments/payment-allocation.ts`
- `application/customers/use-cases/*`
- `application/sales/use-cases/*`
- `application/payments/use-cases/*`
- `application/ports/customer-repository.ts`
- `application/ports/sale-repository.ts`
- `application/ports/payment-repository.ts`
- `application/ports/sale-balance-repository.ts`
- `infra/db/prisma/repositories/prisma-customer-repository.ts`
- `infra/db/prisma/repositories/prisma-sale-repository.ts`
- `infra/db/prisma/repositories/prisma-payment-repository.ts`
- `infra/db/prisma/repositories/prisma-sale-balance-repository.ts`
- `interfaces/http/modules/customers/*`
- `interfaces/http/modules/sales/*`
- `interfaces/http/modules/payments/*`

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

### Customer Detail / Statement

- leitura agregada do cliente por porta dedicada
- ficha deve consolidar cliente, vendas e pagamentos
- extrato deve ser derivado da base real, nunca de mock

### Charges

- `ListDueChargesUseCase`
- `SendManualChargeUseCase`
- `RunDailyChargeJobUseCase`
- persistir historico antes e depois do envio
- overview operacional de `dueSoon`, `dueToday` e `overdue`
- historico de mensagens por cliente e por operacao
- endpoint manual do job existe para validar a automacao antes do scheduler real

### Auth

- `AuthenticateUserUseCase`
- `PasswordHasher`
- `TokenService`
- middleware HTTP apenas valida identidade, nao decide regra de negocio
- login e leitura de `me` ja existem como base inicial
- token assinado fica isolado em servico proprio

## Regras arquiteturais obrigatorias

- nenhuma regra financeira deve ficar em controller
- nenhum use case deve importar Prisma diretamente
- nenhum componente React deve calcular regra financeira critica
- saldo do cliente sempre deriva de vendas e pagamentos
- WhatsApp sempre passa por provider + persistencia de historico
- auditoria deve entrar pelos use cases, nao pela UI
- auditoria deve persistir em banco, nunca ser apenas log efemero

## Ordem recomendada

1. fechar a arquitetura de clientes
2. criar modulo de vendas
3. criar modulo de pagamentos com testes
4. criar extrato do cliente
5. criar cobrancas e job diario
6. adicionar autenticacao e auditoria persistida
7. portar o prototipo visual para as features reais
