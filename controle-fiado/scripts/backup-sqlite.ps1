$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$sourceDb = Join-Path $projectRoot "prisma\dev.db"
$backupDir = Join-Path $projectRoot "backups\sqlite"

if (-not (Test-Path -LiteralPath $sourceDb)) {
  throw "Banco SQLite nao encontrado em $sourceDb"
}

New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = Join-Path $backupDir "dev-$timestamp.db"
$metadataPath = Join-Path $backupDir "dev-$timestamp.json"

Copy-Item -LiteralPath $sourceDb -Destination $backupPath -Force

$metadata = [ordered]@{
  createdAt = (Get-Date).ToString("o")
  source = $sourceDb
  backup = $backupPath
  sizeBytes = (Get-Item -LiteralPath $backupPath).Length
}

$metadata | ConvertTo-Json | Set-Content -LiteralPath $metadataPath -Encoding UTF8

Write-Output "Backup criado em: $backupPath"
