@echo off
setlocal
cd /d "%~dp0\..\.."

echo Starting local Kokoro TTS gateway at http://localhost:8787 ...
call pnpm dev:server
