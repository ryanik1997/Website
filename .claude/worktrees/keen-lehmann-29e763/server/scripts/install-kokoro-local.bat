@echo off
setlocal
cd /d "%~dp0\..\.."

echo [1/2] Installing workspace dependencies...
call pnpm install --ignore-scripts
if errorlevel 1 (
  echo Failed: pnpm install --ignore-scripts
  exit /b 1
)

echo [2/2] Setting up Kokoro Python environment...
powershell -ExecutionPolicy Bypass -File server\scripts\setup-kokoro.ps1
if errorlevel 1 (
  echo Failed: setup-kokoro.ps1
  exit /b 1
)

echo.
echo Kokoro local install completed.
echo Next step: run server\scripts\start-kokoro-local.bat
exit /b 0
