@echo off
setlocal
cd /d "%~dp0"

echo ==========================================
echo Ryan English - Bat Kokoro local
echo ==========================================
echo.
echo Se mo local TTS gateway tai http://localhost:8787
echo Hay giu cua so nay mo trong luc dung web app.
echo.

where pnpm >nul 2>nul
if errorlevel 1 (
  echo Khong tim thay pnpm.
  echo Hay cai Node.js truoc: https://nodejs.org/
  pause
  exit /b 1
)

call server\scripts\start-kokoro-local.bat
exit /b %errorlevel%
