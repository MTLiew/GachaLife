import { GAMES } from '../games'
import type { Game } from '../types'

type Props = {
  selectedGames: string[]
  onToggle: (gameId: string) => void
  maintenanceGames: string[]
}

function GameFilter({ selectedGames, onToggle, maintenanceGames }: Props) {
  return (
    <div className="game-filter">
      {GAMES.map((game: Game) => {
        const isComingSoon = game.comingSoon
        const isMaintenance = maintenanceGames.includes(game.id)
        const isDisabled = isComingSoon || isMaintenance
        const overlayText = isMaintenance ? 'Under Maintenance' : isComingSoon ? 'Coming Soon' : null

        return (
          <div key={game.id} className="game-filter-wrapper">
            <button
              className={`game-filter-btn ${selectedGames.includes(game.id) ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
              style={{
                borderColor: game.color,
                color: selectedGames.includes(game.id) ? 'white' : game.color,
                backgroundColor: selectedGames.includes(game.id) ? game.color : 'transparent'
              }}
              onClick={() => !isDisabled && onToggle(game.id)}
              disabled={isDisabled}
            >
              {game.name}
            </button>
            {overlayText && (
              <div className={`game-filter-overlay ${isMaintenance ? 'maintenance' : 'coming-soon'}`}>
                {overlayText}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default GameFilter