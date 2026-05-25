import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import App from './App'
import Games from './pages/Games'
import Changelog from './pages/Changelog'
import Support from './pages/Support'
import './index.css'
import { Auth0Provider } from '@auth0/auth0-react'

const domain = import.meta.env.VITE_AUTH0_DOMAIN
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID
const audience = import.meta.env.VITE_AUTH0_AUDIENCE

function Root() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/games" element={<Games />} />
        <Route path="/changelog" element={<Changelog />} />
        <Route path="/support" element={<Support />} />
      </Routes>
    </Layout>
  )
}

document.documentElement.setAttribute('data-theme', 'light')
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience,
        scope: 'openid profile email'
      }}
    >
      <ThemeProvider>
        <BrowserRouter>
          <Root />
        </BrowserRouter>
      </ThemeProvider>
    </Auth0Provider>
  </StrictMode>
)