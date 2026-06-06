import { useState, useEffect } from 'react'

function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('cookie-consent')
    if (!accepted) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem('cookie-consent', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="cookie-banner">
      <p className="cookie-text">
        Reverie uses cookies for authentication and to save your preferences.
        By continuing to use the site, you agree to our{' '}
        <a href="/privacy" className="cookie-link">Privacy Policy</a>.
      </p>
      <button className="cookie-btn" onClick={accept}>
        Got it
      </button>
    </div>
  )
}

export default CookieBanner