# Backend Architecture

## Camadas

- `domain`: tipos e regras centrais do negocio
- `application`: casos de uso e portas
- `infra`: Prisma, providers, jobs e implementacoes concretas
- `interfaces`: HTTP e validacao de entrada

## Fluxo

`route -> controller -> use case -> port -> infra`

## Convencoes

- novos modulos devem nascer com `use-cases`
- repositorios devem ser interfaces em `application/ports`
- implementacoes Prisma ficam em `infra/db/prisma/repositories`
- controllers nao acessam Prisma
- regras de calculo financeiro nao entram em rotas
