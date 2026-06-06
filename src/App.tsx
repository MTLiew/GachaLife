import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Clock from './components/Clock'
import GachaTimeline from './components/GachaTimeline'
import type { GachaEvent } from './types'
import { fetchEvents } from './api/events'
import './index.css'
import DetailPanel from './components/DetailPanel'
import { useAuth0 } from '@auth0/auth0-react'

function App() {
  const [selectedGames, setSelectedGames] = useState<string[]>(['genshin'])
  const [events, setEvents] = useState<GachaEvent[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  //const [viewMode, setViewMode] = useState<'calendar' | 'timeline'>('timeline')
  const [maintenanceGames, setMaintenanceGames] = useState<string[]>([])
  const [selectedEvent, setSelectedEvent] = useState<GachaEvent | null>(null)
  const { isAuthenticated, getAccessTokenSilently } = useAuth0()

  /*const handleViewToggle = () => {
    setViewMode(prev => prev === 'calendar' ? 'timeline' : 'calendar')
  }*/

  useEffect(() => {
    if (!isAuthenticated) return

    const syncUser = async () => {
      try {
        const token = await getAccessTokenSilently()
        await fetch(`${import.meta.env.VITE_API_URL}/auth/sync`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      } catch (error) {
        console.error('Failed to sync user:', error)
      }
    }

    syncUser()
  }, [isAuthenticated])

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
        <div className="calendar-area">
          {isLoading && (
            <div className="loading-overlay">
              <div className="loading-spinner" />
              <p className="loading-text">Fetching events...</p>
            </div>
          )}
          <div className="timeline-page">
            <div className="timeline-side" />
            <GachaTimeline
              events={events}
              selectedGames={selectedGames}
              onEventClick={setSelectedEvent}
            />
            <div className="timeline-side" />
            <DetailPanel event={selectedEvent} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App