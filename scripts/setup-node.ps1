$ErrorActionPreference = 'Stop'
$version = '24.22.0'
$architecture = [System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture.ToString()
if ($architecture -ne 'X64') { throw 'Questo bootstrap supporta Windows x64. Usa Node.js di sistema per le altre piattaforme.' }
$projectRoot = Split-Path -Parent $PSScriptRoot
$runtimeDir = Join-Path $projectRoot '.tools/node'
$downloadDir = Join-Path $projectRoot '.tools/download'
New-Item -ItemType Directory -Force -Path $runtimeDir, $downloadDir | Out-Null
$baseUrl = "https://nodejs.org/dist/v$version"
$candidate = Join-Path $downloadDir 'node.exe'
$checksums = (Invoke-WebRequest -UseBasicParsing -Uri "$baseUrl/SHASUMS256.txt").Content
$expected = [regex]::Match($checksums, '(?m)^([a-fA-F0-9]{64})\s+win-x64/node\.exe\s*$')
if (-not $expected.Success) { throw 'Checksum ufficiale del runtime non trovato.' }
Invoke-WebRequest -UseBasicParsing -Uri "$baseUrl/win-x64/node.exe" -OutFile $candidate
$actual = (Get-FileHash -LiteralPath $candidate -Algorithm SHA256).Hash
if ($actual -ne $expected.Groups[1].Value) { throw 'Checksum del runtime non valido: installazione interrotta.' }
Invoke-WebRequest -UseBasicParsing -Uri "https://raw.githubusercontent.com/nodejs/node/v$version/LICENSE" -OutFile (Join-Path $runtimeDir 'LICENSE')
Copy-Item -LiteralPath $candidate -Destination (Join-Path $runtimeDir 'node.exe') -Force
& (Join-Path $runtimeDir 'node.exe') --version
if ($LASTEXITCODE -ne 0) { throw 'Impossibile avviare il runtime.' }
Write-Host 'Node.js portatile pronto. Esegui scripts\test.cmd per i test.'
