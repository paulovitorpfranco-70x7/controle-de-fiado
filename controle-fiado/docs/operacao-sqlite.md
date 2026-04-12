# Operacao do SQLite

## Banco atual

- banco local: `prisma/dev.db`
- uso atual: unico usuario, sem custo, execucao local

## Backup

Rodar na raiz do projeto:

```powershell
npm run db:backup
```

O script cria uma copia do banco em `backups/sqlite/` e tambem grava um arquivo `.json` com metadados do backup.

## Restauracao

Para restaurar um backup para o banco principal:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/restore-sqlite.ps1 -BackupPath "backups/sqlite/dev-20260411-120000.db"
```

Para testar restauracao sem sobrescrever o banco principal:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/restore-sqlite.ps1 -BackupPath "backups/sqlite/dev-20260411-120000.db" -TargetPath "tmp/restore-test/dev-restored.db"
```

## Cuidados

- nao rode restauracao sobre o banco principal com a aplicacao aberta
- mantenha mais de um backup disponivel antes de qualquer mudanca estrutural
- antes de subir para um ambiente online, reavaliar se `SQLite` ainda atende

## Migracao segura de schema

Para qualquer mudanca no `prisma/schema.prisma`, use este fluxo:

1. rodar backup do banco
2. validar o schema Prisma
3. aplicar a migracao nomeada
4. subir backend e testes
5. manter o backup anterior ate validar a operacao

Comando sugerido:

```powershell
npm run db:migrate:safe -- add_whatsapp_indexes
```

Se preferir separar por etapa:

```powershell
npm run db:backup
npm --workspace backend run prisma:validate
npm run db:migrate -- --name add_whatsapp_indexes
```

## Datas e timezone

- o projeto deve operar no horario local do comercio
- entradas `type="date"` do frontend sao tratadas como data local, sem `toISOString()`
- `saleDate` e `paymentDate` entram como data local do dia informado
- `dueDate` entra como final do dia local para nao vencer antes da hora
- consultas de cobranca e dashboard usam janela local de inicio e fim do dia

Isso evita o erro classico de um `YYYY-MM-DD` salvo como UTC cair no dia anterior em `America/Sao_Paulo`.
