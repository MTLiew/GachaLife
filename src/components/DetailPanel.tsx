import type { GachaEvent } from '../types'
import { GAMES } from '../games'

type Props = {
  event: GachaEvent | null
}

const ALL_TAGS = ['Challenge', 'Story', 'Login', 'Login (Limited)', 'Time-Gated', 'Mini-Game',
  'Casual', 'Relaxed', 'Focused', 'Intense', 'Memento', 'Permanent', 'Permanent (Limited)', 'Recurring'
] as const

// Stub data — replace with real vote data once auth + database are in
const STUB_VOTES: Record<string, { votes: number; percentage: number }> = {
  'Story':       { votes: 24, percentage: 78 },
  'Time-Gated':  { votes: 18, percentage: 60 },
  'Challenge':   { votes: 5,  percentage: 16 },
  'Relaxed':     { votes: 2,  percentage: 6  },
}

const TAG_INFO: Record<string, string> = {
  'Challenge': 'Difficult core gameplay intended for end-game players',
  'Story': 'Extensive dialogue and character appearances',
  'Login': 'Rewards issued for logging in daily',
  'Login (Limited)': 'Rewards issued limited by day and not acquirable afterwards',
  'Time-Gated': 'Requires real-world waiting time',
  'Mini-Game': 'Centered on alternative gameplay',
  'Casual': 'Completable in under an hour',
  'Relaxed': 'Requires little to no effort to complete',
  'Focused': 'Requires some effort to complete',
  'Intense': 'Requires significant effort and thinking to complete',
  'Memento': 'Event-limited items can be acquired',
  'Permanent': 'Completable in the future',
  'Permanent (Limited)': 'Completable in the future with time-limited rewards',
  'Recurring': 'Event that refreshes at regular intervals',
}

function formatDate(date: Date): string {
  const rounded = new Date(date)
  rounded.setMinutes(0, 0, 0)
  const timezone = localStorage.getItem('timezone') 
    ?? Intl.DateTimeFormat().resolvedOptions().timeZone
  return rounded.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  })
}

function getDaysRemaining(end: Date): string {
  const now = new Date()
  const diffMs = end.getTime() - now.getTime()
  if (diffMs <= 0) return 'Ended'
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days === 0) return `${hours}h remaining`
  return `${days}d ${hours}h remaining`
}

function DetailPanel({ event }: Props) {
  const game = GAMES.find(g => g.id === event?.game)

  const sortedTags = [...ALL_TAGS].sort((a, b) => {
    const da = STUB_VOTES[a]
    const db = STUB_VOTES[b]
    if (db.percentage !== da.percentage) return db.percentage - da.percentage
    return db.votes - da.votes
    })

  return (
    <div className={`detail-panel-wrapper`}>
      {/* Panel content */}
        <div className="detail-panel">
          {event === null ? (
            <div className="detail-panel-empty">
              <p>Click an event to see details</p>
            </div>
          ) : (
            <>
              {/* Banner placeholder */}
              <div
                className="detail-panel-banner"
                style={{
                  background: `linear-gradient(135deg, ${game?.color ?? '#888'}99, ${game?.color ?? '#888'}22)`,
                }}
              >
                <div className="detail-panel-banner-overlay">
                  <span className="detail-panel-game-name">{game?.name ?? event.game}</span>
                  <h2 className="detail-panel-title">{event.title}</h2>
                  <span className={`detail-panel-type-badge ${event.type}`}>
                    {event.type === 'banner' ? 'Banner' : 'Event'}
                  </span>
                </div>
              </div>

              {/* Metadata */}
              <div className="detail-panel-section">
                <div className="detail-panel-meta-row">
                  <span className="detail-panel-label">Starts</span>
                  <span className="detail-panel-value">{formatDate(event.start)}</span>
                </div>
                <div className="detail-panel-meta-row">
                  <span className="detail-panel-label">Ends</span>
                  <span className="detail-panel-value">{formatDate(event.end)}</span>
                </div>
                <div className="detail-panel-remaining">
                  {getDaysRemaining(event.end)}
                </div>
              </div>

              {/* Tags */}
              <div className="detail-panel-section">
                <h3 className="detail-panel-section-title">Community Tags</h3>
                <div className="detail-panel-tags">
                  {sortedTags.map(tag => {
                    const data = STUB_VOTES[tag]
                    return (
                      <div key={tag} className="detail-panel-tag">
                        <div className="detail-panel-tag-header">
                          <span className="detail-panel-tag-label" title={TAG_INFO[tag]}>{tag}</span>
                          <span className="detail-panel-tag-votes">{data.votes} votes</span>
                        </div>
                        <div className="detail-panel-tag-bar-bg">
                          <div
                            className="detail-panel-tag-bar-fill"
                            style={{ width: `${data.percentage}%` }}
                          />
                        </div>
                        <span className="detail-panel-tag-pct">{data.percentage}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Vote section */}
              <div className="detail-panel-section">
                <h3 className="detail-panel-section-title">Vote on Tags</h3>
                <p className="detail-panel-vote-hint">
                  Sign in to vote and help the community categorize events.
                </p>
                <div className="detail-panel-vote-tags">
                  {ALL_TAGS.map(tag => (
                    <button
                      key={tag}
                      className="detail-panel-vote-btn"
                      onClick={() => alert('Sign in to vote!')}
                      title={TAG_INFO[tag]}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
    </div>
  )
}

export default DetailPanel