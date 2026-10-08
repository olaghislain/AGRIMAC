param(
  [Parameter(Mandatory = $true)][string]$BackupFile,
  [string]$Container = "agrimac-postgres",
  [string]$Database = $env:POSTGRES_DB,
  [string]$User = $env:POSTGRES_USER
)

$ErrorActionPreference = "Stop"
if (-not (Test-Path -LiteralPath $BackupFile)) { throw "Backup file not found: $BackupFile" }
if ([string]::IsNullOrWhiteSpace($Database) -or [string]::IsNullOrWhiteSpace($User)) { throw "POSTGRES_DB and POSTGRES_USER are required." }
Get-Content -LiteralPath $BackupFile -Raw -Encoding Byte | docker exec -i $Container pg_restore --clean --if-exists --no-owner -U $User -d $Database
Write-Output "Restore completed from: $BackupFile"
