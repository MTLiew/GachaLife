import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import GachaCalendar from './components/GachaCalendar'
import Clock from './components/Clock'
import GachaTimeline from './components/GachaTimeline'
import type { GachaEvent } from './types'
import { fetchEvents } from './api/events'
import './index.css'

function App() {
  const [selectedGames, setSelectedGames] = useState<string[]>(['genshin'])
  const [events, setEvents] = useState<GachaEvent[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline'>('calendar')
  const [maintenanceGames, setMaintenanceGames] = useState<string[]>([])

  const handleViewToggle = () => {
    setViewMode(prev => prev === 'calendar' ? 'timeline' : 'calendar')
  }

  useEffect(() => {
    let cancelled = false

    const loadEvents = async () => {
      setIsLoading(true)
      try {
        const results = await Promise.allSettled(
          selectedGames.map(id => fetchEvents(id))
        )
        if (!cancelled) {
          const newMaintenance: string[] = []
          const allEvents: GachaEvent[] = []

          results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
              allEvents.push(...result.value)
            } else {
              newMaintenance.push(selectedGames[index])
            }
          })

          setEvents(allEvents)
          setMaintenanceGames(prev => {
            const updated = [...prev]
            newMaintenance.forEach(id => {
              if (!updated.includes(id)) updated.push(id)
            })
            return updated
          })
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadEvents()

    return () => {
      cancelled = true
    }
  }, [selectedGames])

  const handleToggle = (gameId: string) => {
    setSelectedGames(prev =>
      prev.includes(gameId)
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId]
    )
  }

  return (
    <div className="app-content">
      <Sidebar
        selectedGames={selectedGames}
        onToggle={handleToggle}
        events={events}
        maintenanceGames={maintenanceGames}
      />
      <div className="calendar-wrapper">
        <Clock />
          <div className="calendar-toolbar">
            <button className="view-toggle-btn" onClick={handleViewToggle}>
              {viewMode === 'calendar' ? '📅 Switch to Timeline' : '📅 Switch to Calendar'}
            </button>
          </div>
        <div className="calendar-area">
          {isLoading && (
            <div className="loading-overlay">
              <div className="loading-spinner" />
              <p className="loading-text">Fetching events...</p>
            </div>
          )}
          {viewMode === 'calendar'
            ? <GachaCalendar events={events} selectedGames={selectedGames} />
            : (
              <div className="timeline-page">
                <div className="timeline-side" />
                <GachaTimeline events={events} selectedGames={selectedGames} />
                <div className="timeline-side" />
              </div>
            )
          }
        </div>
      </div>
    </div>
  )
}

export default App