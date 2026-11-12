# Gera o ZIP para submeter na Chrome Web Store (apenas os ficheiros necessários à extensão).
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$version = (Get-Content "$root\manifest.json" -Raw | ConvertFrom-Json).version
$dist = Join-Path $root 'dist'
$zip = Join-Path $dist "gta6-no-spoiler-$version.zip"

New-Item -ItemType Directory -Force $dist | Out-Null
if (Test-Path $zip) { Remove-Item $zip }

$items = 'manifest.json', '_locales', 'icons', 'src' | ForEach-Object { Join-Path $root $_ }
Compress-Archive -Path $items -DestinationPath $zip
Write-Output "Pacote criado: $zip"

