import { useState } from 'react'
import Sidebar from './components/Sidebar'
import GachaCalendar from './components/GachaCalendar'
import type { GachaEvent } from './types'
import ThemeDropdown from './components/ThemeDropdown'
import './index.css'

const DUMMY_EVENTS: GachaEvent[] = [
  {
    id: '1',
    title: 'Wanderer Rerun Banner',
    game: 'genshin',
    start: new Date(2026, 2, 10),
    end: new Date(2026, 2, 25),
    type: 'banner',
  },
  {
    id: '2',
    title: 'Acheron Rerun Banner',
    game: 'hsr',
    start: new Date(2026, 2, 5),
    end: new Date(2026, 2, 26),
    type: 'banner',
  },
  {
    id: '3',
    title: 'Hollow Zero Seasonal Event',
    game: 'zzz',
    start: new Date(2026, 2, 1),
    end: new Date(2026, 2, 20),
    type: 'event',
  },
]

function App() {
  const [selectedGames, setSelectedGames] = useState<string[]>([])

  const handleToggle = (gameId: string) => {
    setSelectedGames(prev =>
      prev.includes(gameId)
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId]
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Gacha Calendar</h1>
        <ThemeDropdown />
      </header>
      <main className="app-main">
        <Sidebar
          selectedGames={selectedGames}
          onToggle={handleToggle}
          events={DUMMY_EVENTS}
        />
        <GachaCalendar events={DUMMY_EVENTS} selectedGames={selectedGames} />
      </main>
    </div>
  )
}

export default App