import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthContext'
import App from './App'
import './styles/globals.css'
import { getTheme, setTheme } from './lib/theme'
import { hasOAuthCallbackInUrl, recoverOAuthSession, stripOAuthFromUrl } from './features/auth/recoverOAuthSession'

setTheme(getTheme())

async function bootstrap() {
  if (hasOAuthCallbackInUrl()) {
    try {
      await recoverOAuthSession()
    } catch {
      stripOAuthFromUrl('/')
    }
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>,
  )
}

bootstrap()