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
