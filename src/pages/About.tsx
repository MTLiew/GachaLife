function About() {
  return (
    <div className="page-container">
      <div className="support-wrapper">
        <div className="support-header">
          <h1>About Reverie</h1>
          <p>A unified event calendar for gacha games.</p>
        </div>
        <div className="changelog-entry">
          <div className="changelog-entry-header">
            <span className="changelog-version">What is Reverie?</span>
          </div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
            <p>Reverie is a community-driven event tracker for gacha games. Instead of juggling multiple wikis and official sites, Reverie aggregates events from your favorite games into a single timeline and calendar view.</p>
            <p>Events are automatically scraped and updated every six hours, so you always have a current picture of what's running, what's ending soon, and what's coming up next.</p>
            <p>Community tagging lets players label events by type - whether something is story-heavy, time-gated, casual, or challenging — so you can plan your time across games more effectively.</p>
          </div>
        </div>
        <div className="changelog-entry">
          <div className="changelog-entry-header">
            <span className="changelog-version">Supported Games</span>
          </div>
          <div style={{ padding: '16px 20px', fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
            <p>Currently tracking Genshin Impact, Honkai: Star Rail, and Zenless Zone Zero, with more games on the way. Check the Games page for the full list and current status.</p>
          </div>
        </div>
        <div className="changelog-entry">
          <div className="changelog-entry-header">
            <span className="changelog-version">Built by</span>
          </div>
          <div style={{ padding: '16px 20px', fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
            <p>Reverie is an independent project built and maintained by a solo developer. If you find it useful, consider supporting me on Ko-Fi.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About