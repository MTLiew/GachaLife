function Privacy() {
  return (
    <div className="page-container">
      <div className="support-wrapper">
        <div className="support-header">
          <h1>Privacy Policy</h1>
          <p>Last updated: June 2026</p>
        </div>
        <div className="changelog-entry">
          <div className="changelog-entry-header">
            <span className="changelog-version">Data We Collect</span>
          </div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
            <p>When you sign in, we collect your display name, email address, and profile picture from your chosen authentication provider (Google or Discord). This information is used solely to associate your votes with your account.</p>
            <p>We store your theme preference, timezone, and selected games in your browser's local storage. These never leave your device unless you are signed in, in which case they may be synced to your account in a future update.</p>
          </div>
        </div>
        <div className="changelog-entry">
          <div className="changelog-entry-header">
            <span className="changelog-version">How We Use Your Data</span>
          </div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
            <p>Your account information is used only to enable community tag voting. We do not sell, share, or use your data for advertising purposes.</p>
            <p>Authentication is handled by Auth0. You can review Auth0's privacy policy at auth0.com.</p>
          </div>
        </div>
        <div className="changelog-entry">
          <div className="changelog-entry-header">
            <span className="changelog-version">Cookies</span>
          </div>
          <div style={{ padding: '16px 20px', fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
            <p>Reverie uses cookies only for authentication session management via Auth0. We do not currently use advertising or analytics cookies.</p>
          </div>
        </div>
        <div className="changelog-entry">
          <div className="changelog-entry-header">
            <span className="changelog-version">Contact</span>
          </div>
          <div style={{ padding: '16px 20px', fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
            <p>For any privacy-related questions, please use the Support page to get in touch.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Privacy