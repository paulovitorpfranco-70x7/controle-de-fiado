param(
  [Parameter(Mandatory = $true)]
  [string]$BackupPath,

  [string]$TargetPath = ""
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$resolvedBackup = Resolve-Path -LiteralPath $BackupPath
$targetDb = if ([string]::IsNullOrWhiteSpace($TargetPath)) {
  Join-Path $projectRoot "prisma\dev.db"
} else {
  if ([System.IO.Path]::IsPathRooted($TargetPath)) {
    $TargetPath
  } else {
    Join-Path $projectRoot $TargetPath
  }
}

if (-not (Test-Path -LiteralPath $resolvedBackup)) {
  throw "Backup nao encontrado."
}

$targetDir = Split-Path -Parent $targetDb
New-Item -ItemType Directory -Force -Path $targetDir | Out-Null

Copy-Item -LiteralPath $resolvedBackup -Destination $targetDb -Force

Write-Output "Banco restaurado em: $targetDb"
