import { Link, useLocation } from 'react-router-dom'
import ThemeDropdown from './ThemeDropdown'
import { useAuth0 } from '@auth0/auth0-react'
import CookieBanner from './CookieBanner'

const NAV_LINKS = [
  { path: '/', label: 'Calendar' },
  { path: '/about', label: 'About' },
  { path: '/games', label: 'Games' },
  { path: '/changelog', label: 'Changelog' },
  { path: '/privacy', label: 'Privacy' },
  { path: '/support', label: 'Support' },
]

type Props = {
  children: React.ReactNode
}

function Layout({ children }: Props) {
  const location = useLocation()
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0()

  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="app-logo">
          <h1>Reverie</h1>
        </Link>
        <nav className="app-nav">
          {NAV_LINKS.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <ThemeDropdown />
        <div className="auth-controls">
          <a
            href="https://ko-fi.com/reveriegacha"
            target="_blank"
            rel="noopener noreferrer"
            className="kofi-btn"
          >
            Support on Ko-Fi
          </a>
          {isAuthenticated ? (
            <div className="auth-user">
              {user?.picture && (
                <img
                  src={user.picture}
                  alt={user.name ?? 'User'}
                  className="auth-avatar"
                />
              )}
              <span className="auth-name">{user?.name}</span>
              <button
                className="auth-btn"
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              className="auth-btn"
              onClick={() => loginWithRedirect()}
            >
              Sign In
            </button>
          )}
        </div>
      </header>
      <main className="app-main">
        {children}
      </main>
      <CookieBanner />
    </div>
  )
}

export default Layout