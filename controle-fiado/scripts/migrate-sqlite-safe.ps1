param(
  [Parameter(Mandatory = $true)]
  [string]$Name
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$backupScript = Join-Path $projectRoot "scripts\backup-sqlite.ps1"

Push-Location $projectRoot
try {
  Write-Host "Criando backup antes da migracao..."
  & powershell -ExecutionPolicy Bypass -File $backupScript

  Write-Host "Validando schema Prisma..."
  & npm --workspace backend run prisma:validate

  Write-Host "Aplicando migracao local do SQLite..."
  & npm --workspace backend run prisma:migrate -- --name $Name
} finally {
  Pop-Location
}
