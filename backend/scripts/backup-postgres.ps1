param(
  [string]$OutputDirectory = "./backups",
  [string]$Container = "agrimac-postgres",
  [string]$Database = $env:POSTGRES_DB,
  [string]$User = $env:POSTGRES_USER,
  [int]$KeepDays = 14
)

$ErrorActionPreference = "Stop"
if ([string]::IsNullOrWhiteSpace($Database) -or [string]::IsNullOrWhiteSpace($User)) { throw "POSTGRES_DB and POSTGRES_USER are required." }
New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$target = Join-Path $OutputDirectory "agrimac-$stamp.dump"
docker exec $Container pg_dump -Fc -U $User -d $Database | Set-Content -Encoding Byte -Path $target
Get-ChildItem -LiteralPath $OutputDirectory -Filter "agrimac-*.dump" -File | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$KeepDays) } | Remove-Item -Force
Write-Output "Backup created: $target"
