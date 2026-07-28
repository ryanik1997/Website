# Local TTS Service (Kokoro)

Node/TypeScript gateway (`:8787`) + Python Kokoro engine child process (`:8788`).

- `POST /api/tts` → real `audio/wav` (filesystem cache on Node)
- `GET /api/tts/health` → Node + Kokoro engine status
- Frontend Listening is already wired:
  - if local Kokoro is ready, Listening uses Kokoro audio
  - if local Kokoro is missing/down, Listening falls back to browser `Web Speech API`

## Architecture

```
Client (Listening)  →  Node Express (:8787)
              ├─ filesystem cache (text+voice+speed hash)
              └─ Python kokoro_server.py (:8788)
                    └─ Kokoro model (HF_HOME)
```

## Quick start (Windows)

### 1. Prerequisites

- **Python 3.10, 3.11, or 3.12** ([python.org](https://www.python.org/downloads/)) — tick **Add Python to PATH**
- **Internet** for first model download (~600MB via Hugging Face)

### 2. Install Kokoro deps (recommended)

From repo root in PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File server/scripts/setup-kokoro.ps1
```

This creates `server/python/.venv` and writes `server/python/python_path.txt`.

Manual alternative:

```powershell
cd server/python
py -3.11 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
# optional: echo full path to python.exe > python_path.txt
```

### 3. Run Node gateway

```bash
pnpm install --ignore-scripts
pnpm dev:server
```

Health check:

```powershell
Invoke-RestMethod http://localhost:8787/api/tts/health | ConvertTo-Json -Depth 6
```

Synth sample (saves WAV):

```powershell
Invoke-WebRequest http://localhost:8787/api/tts `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"text":"Hello world","voice":"default","speed":1}' `
  -OutFile sample.wav
```

### 4. Use in the web app

Default frontend target:

- `http://localhost:8787`

You do not need extra frontend config if you keep the default local port.

Optional override:

```env
VITE_TTS_SERVICE_URL=http://localhost:8787
```

Behavior in Listening:

- Kokoro local running: app uses Kokoro
- Kokoro local missing/down: app falls back to browser voice
- UI badge shows the current engine status

## Configuration

Copy `server/.env.example` → `server/.env` (optional).

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8787` | Node gateway port |
| `KOKORO_PORT` | `8788` | Python Kokoro port |
| `PYTHON_PATH` | auto-detect | Path to `python.exe` |
| `KOKORO_CACHE_DIR` | `server/.cache/tts` | WAV cache directory |
| `HF_HOME` | `server/.cache/huggingface` | Kokoro model cache |
| `KOKORO_AUTO_START` | `1` | Spawn Python on Node boot |

Python path resolution order:

1. `PYTHON_PATH` env
2. `server/python/python_path.txt`
3. Common Windows install paths + `server/python/.venv`
4. `python` on PATH

## API

### `GET /api/tts/health`

Returns Node status plus `kokoro` engine block:

- `available` — Python HTTP server reachable
- `ready` — `kokoro`, `numpy`, `soundfile` installed
- `cache.dir` — filesystem cache path

### `POST /api/tts`

Body:

```json
{ "text": "Hello world", "voice": "default", "speed": 1, "lang": "b" }
```

- Success: `audio/wav` body, headers `X-Cache: HIT|MISS`
- Kokoro not ready: `503` JSON with `installHint`
- Cache key: SHA-256 of `text|voice|speed`

Voice aliases: `default` → `bf_emma` (British), `en-us` → `af_heart`.

## Common Windows issues

| Problem | Fix |
|---------|-----|
| `Python not found` | Install Python 3.10–3.12, or set `PYTHON_PATH` / run `setup-kokoro.ps1` |
| `kokoro: false` in health | Run `pip install -r server/python/requirements.txt` in the venv |
| Port 8788 in use | Set `KOKORO_PORT=8790` and restart |
| First synth very slow | Normal — model downloads to `HF_HOME` on first run |
| `503 Kokoro engine not ready` | Check `kokoro.lastError` in health JSON; run `/deps?force=1` on Python server |
| Antivirus blocks Python | Allow `python.exe` and `server/python/.venv` |

Debug Python logs: `RYAN_KOKORO_DEBUG=1 pnpm dev:server`

## Dev commands

```bash
pnpm dev:server
pnpm --filter server typecheck
```

## Windows one-click helpers

From repo root:

```powershell
.\server\scripts\install-kokoro-local.bat
.\server\scripts\start-kokoro-local.bat
```

- `install-kokoro-local.bat`:
  - installs JS deps
  - runs `setup-kokoro.ps1`
- `start-kokoro-local.bat`:
  - starts the Node local TTS gateway on `localhost:8787`
