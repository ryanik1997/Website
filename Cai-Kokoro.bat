@echo off
setlocal
cd /d "%~dp0"

echo ==========================================
echo Ryan English - Cai dat Kokoro local
echo ==========================================
echo.
echo Buoc 1: Kiem tra pnpm...
where pnpm >nul 2>nul
if errorlevel 1 (
  echo Khong tim thay pnpm.
  echo Hay cai Node.js truoc: https://nodejs.org/
  echo Sau do mo lai file nay.
  pause
  exit /b 1
)

echo Buoc 2: Chay file cai dat...
call server\scripts\install-kokoro-local.bat
if errorlevel 1 (
  echo.
  echo Cai dat that bai.
  echo Neu may chua co Python 3.10-3.12, hay cai Python roi thu lai.
  pause
  exit /b 1
)

echo.
echo Cai dat thanh cong.
echo Tiep theo: double-click file Bat-Kokoro.bat moi khi muon dung giong Kokoro.
pause
exit /b 0
