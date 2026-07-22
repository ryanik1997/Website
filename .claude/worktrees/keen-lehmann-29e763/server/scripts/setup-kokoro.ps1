# Ryan English — Kokoro TTS setup (Windows)
# Creates server/python/.venv and installs Kokoro dependencies.

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$PythonDir = Join-Path $Root "python"
$VenvDir = Join-Path $PythonDir ".venv"
$ReqFile = Join-Path $PythonDir "requirements.txt"

function Find-Python {
  $candidates = @(
    "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe",
    "$env:LOCALAPPDATA\Programs\Python\Python311\python.exe",
    "$env:LOCALAPPDATA\Programs\Python\Python310\python.exe"
  )
  foreach ($path in $candidates) {
    if (Test-Path $path) { return $path }
  }
  $cmd = Get-Command python -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  throw "Python 3.10–3.12 not found. Install from https://www.python.org/downloads/ and enable Add to PATH."
}

Write-Host "Ryan English — Kokoro setup" -ForegroundColor Cyan
$python = Find-Python
Write-Host "Using Python: $python"

& $python -m venv $VenvDir
$venvPython = Join-Path $VenvDir "Scripts\python.exe"
& $venvPython -m pip install --upgrade pip
& $venvPython -m pip install -r $ReqFile

$pathFile = Join-Path $PythonDir "python_path.txt"
Set-Content -Path $pathFile -Value $venvPython -Encoding UTF8
Write-Host "Saved python_path.txt -> $venvPython" -ForegroundColor Green
Write-Host "Next: pnpm dev:server" -ForegroundColor Green