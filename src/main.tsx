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
    <ThemeProvider>
      <BrowserRouter>
        <Root />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
)