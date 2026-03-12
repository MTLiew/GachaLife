import { GAMES } from '../games'
import type { Game } from '../types'

type Props = {
  selectedGames: string[]
  onToggle: (gameId: string) => void
}

function GameFilter({ selectedGames, onToggle }: Props) {
  return (
    <div className="game-filter">
      {GAMES.map((game: Game) => (
        <button
          key={game.id}
          className={`game-filter-btn ${selectedGames.includes(game.id) ? 'active' : ''}`}
          style={{ borderColor: game.color, color: selectedGames.includes(game.id) ? 'white' : game.color, backgroundColor: selectedGames.includes(game.id) ? game.color : 'transparent' }}
          onClick={() => onToggle(game.id)}
        >
          {game.name}
        </button>
      ))}
    </div>
  )
}

export default GameFilter