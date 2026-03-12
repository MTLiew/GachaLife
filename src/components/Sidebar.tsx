import GameFilter from './GameFilter'
import type { GachaEvent, Game } from '../types'
import { GAMES } from '../games'

type Props = {
  selectedGames: string[]
  onToggle: (gameId: string) => void
  events: GachaEvent[]
}

function Sidebar({ selectedGames, onToggle, events }: Props) {
  const today = new Date()

  const upcoming = events
    .filter(e => e.end >= today)
    .sort((a, b) => a.end.getTime() - b.end.getTime())
    .slice(0, 8)

  const gameColorMap = Object.fromEntries(
    GAMES.map((g: Game) => [g.id, g.color])
  )

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <aside className="sidebar">
      <div>
        <h2>Games</h2>
        <GameFilter selectedGames={selectedGames} onToggle={onToggle} />
      </div>
      <div>
        <h2>Ending Soon</h2>
        <div className="upcoming-events">
          {upcoming.map(event => (
            <div
              key={event.id}
              className="upcoming-event-item"
              style={{ borderLeftColor: gameColorMap[event.game] ?? '#888' }}
            >
              <div className="event-title">{event.title}</div>
              <div className="event-date">Ends {formatDate(event.end)}</div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar