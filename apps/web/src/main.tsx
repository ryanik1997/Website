import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthContext'
import App from './App'
import './styles/globals.css'
import { applyTheme, getAutoTheme, getThemePreference } from './lib/theme'

applyTheme(getThemePreference() ?? getAutoTheme())

function scheduleAutoTheme() {
  if (getThemePreference()) return
  const now = new Date()
  const next = new Date(now)
  const utcHour = now.getUTCHours()
  next.setUTCMinutes(0, 0, 0)
  next.setUTCHours(utcHour < 18 ? 18 : 24)
  const delay = Math.max(1000, next.getTime() - now.getTime())
  window.setTimeout(() => {
    if (!getThemePreference()) applyTheme(getAutoTheme())
    scheduleAutoTheme()
  }, delay)
}

scheduleAutoTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
