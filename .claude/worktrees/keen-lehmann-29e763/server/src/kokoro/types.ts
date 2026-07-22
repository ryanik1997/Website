export interface KokoroDepsStatus {
  ok?: boolean
  ready?: boolean
  python?: string
  executable?: string
  kokoro?: boolean
  soundfile?: boolean
  numpy?: boolean
  install_hint?: string
  last_error?: string | null
  kokoro_error?: string
  soundfile_error?: string
  numpy_error?: string
}

export interface KokoroHealthStatus {
  ok?: boolean
  service?: string
  host?: string
  port?: number
  ready?: boolean | null
  deps_checked?: boolean
  last_error?: string | null
  kokoro?: boolean
  soundfile?: boolean
  numpy?: boolean
  install_hint?: string
}

export interface KokoroEngineStatus {
  available: boolean
  ready: boolean
  processRunning: boolean
  host: string
  port: number
  python: string | null
  pythonScript: string
  lastError: string | null
  deps: KokoroDepsStatus | null
  installHint: string | null
}