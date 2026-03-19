import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import GachaCalendar from './components/GachaCalendar'
import ThemeDropdown from './components/ThemeDropdown'
import Clock from './components/Clock'
import type { GachaEvent } from './types'
import { fetchEvents } from './api/events'
import './index.css'

function App() {
  const [selectedGames, setSelectedGames] = useState<string[]>(['genshin'])
  const [events, setEvents] = useState<GachaEvent[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline'>('calendar')

  const handleViewToggle = () => {
    setViewMode(prev => prev === 'calendar' ? 'timeline' : 'calendar')
  }

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true)
      try {
        const genshinEvents = await fetchEvents('genshin')
        setEvents(genshinEvents)
      } catch (error) {
        console.error('Failed to fetch events:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadEvents()
  }, [])

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
        <button className="view-toggle-btn" onClick={handleViewToggle}>
          {viewMode === 'calendar' ? '📅 Timeline' : '📅 Calendar'}
        </button>
        <ThemeDropdown />
      </header>
      <main className="app-main">
        <Sidebar
          selectedGames={selectedGames}
          onToggle={handleToggle}
          events={events}
        />
        <div className="calendar-wrapper">
          <Clock />
          <GachaCalendar events={events} selectedGames={selectedGames} />
        </div>
      </main>
    </div>
  )
}

export default App