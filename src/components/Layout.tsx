import { Link, useLocation } from 'react-router-dom'
import ThemeDropdown from './ThemeDropdown'

const NAV_LINKS = [
  { path: '/', label: 'Calendar' },
  { path: '/games', label: 'Games' },
  { path: '/changelog', label: 'Changelog' },
  { path: '/support', label: 'Support' },
]

type Props = {
  children: React.ReactNode
}

function Layout({ children }: Props) {
  const location = useLocation()

  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="app-logo">
          <h1>Gacha Calendar</h1>
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
      </header>
      <main className="app-main">
        {children}
      </main>
    </div>
  )
}

export default Layout