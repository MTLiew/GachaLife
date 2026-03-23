type ChangelogEntry = {
  version: string
  date: string
  changes: {
    type: 'added' | 'fixed' | 'changed' | 'removed'
    description: string
  }[]
}

const CHANGELOG: ChangelogEntry[] = [
  {
    version: '0.2.0',
    date: '2025-03-22',
    changes: [
      { type: 'added', description: 'ZZZ event scraper and parser' },
      { type: 'added', description: 'Backend caching with 30 minute TTL' },
      { type: 'added', description: 'localStorage persistence for theme and timezone' },
      { type: 'added', description: 'Loading overlay with spinner' },
      { type: 'fixed', description: 'Playwright Windows asyncio compatibility issue' },
      { type: 'fixed', description: 'Race condition when switching games rapidly' },
    ]
  },
  {
    version: '0.1.0',
    date: '2025-03-15',
    changes: [
      { type: 'added', description: 'Genshin Impact event scraper and parser' },
      { type: 'added', description: 'Calendar view with react-big-calendar' },
      { type: 'added', description: 'Game filter sidebar' },
      { type: 'added', description: 'Theme switcher with Light, Dark, Sakura and Cosmic themes' },
      { type: 'added', description: 'Clock with timezone selector' },
    ]
  },
]

const TYPE_STYLES: Record<ChangelogEntry['changes'][0]['type'], { label: string, className: string }> = {
  added: { label: 'Added', className: 'badge-added' },
  fixed: { label: 'Fixed', className: 'badge-fixed' },
  changed: { label: 'Changed', className: 'badge-changed' },
  removed: { label: 'Removed', className: 'badge-removed' },
}

function Changelog() {
  return (
    <div className="page-container">
      <div className="changelog-wrapper">
        <div className="changelog-header">
          <h1>Changelog</h1>
        </div>
        <div className="changelog-list">
          {CHANGELOG.map(entry => (
            <div key={entry.version} className="changelog-entry">
              <div className="changelog-entry-header">
                <span className="changelog-version">v{entry.version}</span>
                <span className="changelog-date">{entry.date}</span>
              </div>
              <ul className="changelog-changes">
                {entry.changes.map((change, i) => (
                  <li key={i} className="changelog-change">
                    <span className={`changelog-badge ${TYPE_STYLES[change.type].className}`}>
                      {TYPE_STYLES[change.type].label}
                    </span>
                    <span>{change.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Changelog