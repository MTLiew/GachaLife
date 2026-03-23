import { useEffect, useState } from 'react'
import { fetchStatus } from '../api/events'
import { GAMES } from '../games'

type GameStatus = {
  last_updated: string | null
  event_count: number | null
  cached: boolean
}

function Games() {
  const [status, setStatus] = useState<Record<string, GameStatus>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStatus()
      .then(data => setStatus(data))
      .catch(err => console.error('Failed to fetch status:', err))
      .finally(() => setIsLoading(false))
  }, [])

  const formatLastUpdated = (iso: string | null) => {
  if (!iso) return 'Not yet loaded'
  const date = new Date(iso + 'Z') // append Z to tell JS it's UTC
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
}

  return (
    <div className="page-container">
      <div className="games-wrapper">
        <div className="games-header">
          <h1>Games</h1>
          <p>All games currently tracked by GachaLife.</p>
        </div>
        {isLoading ? (
          <div className="games-loading">Loading status...</div>
        ) : (
          <div className="games-grid">
            {GAMES.map(game => {
              const gameStatus = status[game.id]
              return (
                <div key={game.id} className="game-card">
                  <div className="game-card-header" style={{ borderLeftColor: game.color }}>
                    <span className="game-card-name">{game.name}</span>
                    <span
                      className={`game-card-status ${gameStatus?.cached ? 'status-active' : 'status-inactive'}`}
                    >
                      {gameStatus?.cached ? 'Active' : 'Not loaded'}
                    </span>
                  </div>
                  <div className="game-card-body">
                    <div className="game-card-row">
                      <span className="game-card-label">Events tracked</span>
                      <span className="game-card-value">
                        {gameStatus?.event_count ?? '—'}
                      </span>
                    </div>
                    <div className="game-card-row">
                      <span className="game-card-label">Last updated</span>
                      <span className="game-card-value">
                        {formatLastUpdated(gameStatus?.last_updated ?? null)}
                      </span>
                    </div>
                    <div className="game-card-row">
                      <span className="game-card-label">Current patch</span>
                      <span className="game-card-value game-card-soon">Coming soon</span>
                    </div>
                    <div className="game-card-row">
                      <span className="game-card-label">Patch ends</span>
                      <span className="game-card-value game-card-soon">Coming soon</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Games