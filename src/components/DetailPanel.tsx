import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import type { GachaEvent } from '../types'
import { GAMES } from '../games'

type Props = {
  event: GachaEvent | null
}

const ALL_TAGS = [
  'Challenge', 'Story', 'Login', 'Login (Limited)', 'Time-Gated', 'Mini-Game',
  'Casual', 'Relaxed', 'Focused', 'Intense', 'Memento', 'Permanent',
  'Permanent (Limited)', 'Recurring'
] as const

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
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: timezone,
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
  const { isAuthenticated, getAccessTokenSilently, loginWithRedirect } = useAuth0()

  const [votes, setVotes] = useState<Record<string, number>>({})
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set())
  const [votesLoading, setVotesLoading] = useState(false)
  const [pendingTag, setPendingTag] = useState<string | null>(null)
  const [voterCount, setVoterCount] = useState<number>(0)

  // Fetch votes whenever the selected event changes
  useEffect(() => {
    if (!event) {
      setVotes({})
      setUserVotes(new Set())
      setVoterCount(0) 
      return
    }

    const fetchVotes = async () => {
      setVotesLoading(true)
      try {
        const headers: Record<string, string> = {}
        if (isAuthenticated) {
          const token = await getAccessTokenSilently()
          headers['Authorization'] = `Bearer ${token}`
        }

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/events/${encodeURIComponent(event.id)}/votes`,
          { headers }
        )
        if (!res.ok) return
        const data = await res.json()
        setVotes(data.votes)
        setUserVotes(new Set(data.user_votes))
        setVoterCount(data.voter_count ?? 0)
      } catch (err) {
        console.error('Failed to fetch votes:', err)
      } finally {
        setVotesLoading(false)
      }
    }

    fetchVotes()
  }, [event?.id, isAuthenticated])

  const handleVote = async (tag: string) => {
    if (!isAuthenticated) {
      loginWithRedirect()
      return
    }
    if (!event || pendingTag) return

    setPendingTag(tag)
    try {
      const token = await getAccessTokenSilently()
      const res = await fetch(`${import.meta.env.VITE_API_URL}/votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ event_id: event.id, tag }),
      })
      if (!res.ok) return
      const data = await res.json()
      setVotes(data.votes)
      setUserVotes(new Set(data.user_votes))
      setVoterCount(data.voter_count ?? 0)
    } catch (err) {
      console.error('Failed to cast vote:', err)
    } finally {
      setPendingTag(null)
    }
  }

  const totalVoters = voterCount

  const sortedTags = [...ALL_TAGS].sort((a, b) => {
    const va = votes[a] ?? 0
    const vb = votes[b] ?? 0
    return vb - va
  })

  return (
    <div className="detail-panel-wrapper">
      <div className="detail-panel">
        {event === null ? (
          <div className="detail-panel-empty">
            <p>Click an event to see details</p>
          </div>
        ) : (
          <>
            {/* Banner */}
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

            {/* Community Tags */}
            <div className="detail-panel-section">
              <h3 className="detail-panel-section-title">Community Tags</h3>
              {votesLoading ? (
                <p className="detail-panel-vote-hint">Loading...</p>
              ) : (
                <div className="detail-panel-tags">
                  {sortedTags.map(tag => {
                    const count = votes[tag] ?? 0
                    const pct = totalVoters > 0 ? Math.round((count / totalVoters) * 100) : 0
                    return (
                      <div key={tag} className="detail-panel-tag">
                        <div className="detail-panel-tag-header">
                          <span className="detail-panel-tag-label" title={TAG_INFO[tag]}>{tag}</span>
                          <span className="detail-panel-tag-pct">{pct}%</span>
                        </div>
                        <div className="detail-panel-tag-bar-bg">
                          <div
                            className="detail-panel-tag-bar-fill"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Vote section */}
            <div className="detail-panel-section">
              <h3 className="detail-panel-section-title">Vote on Tags</h3>
              {!isAuthenticated && (
                <p className="detail-panel-vote-hint">
                  Sign in to vote and help the community categorize events.
                </p>
              )}
              <div className="detail-panel-vote-tags">
                {ALL_TAGS.map(tag => {
                  const isVoted = userVotes.has(tag)
                  const isPending = pendingTag === tag
                  return (
                    <button
                      key={tag}
                      className={`detail-panel-vote-btn ${isVoted ? 'voted' : ''}`}
                      onClick={() => handleVote(tag)}
                      disabled={isPending}
                      title={TAG_INFO[tag]}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default DetailPanel