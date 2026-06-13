import { useState, useEffect, useCallback } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { GAMES } from '../games'

const API = import.meta.env.VITE_API_URL

type Event = {
  id: string
  title: string
  game: string
  start: string
  end: string
  url: string
  type: string
  image_url: string
}

type ScraperStatus = {
  [gameId: string]: {
    last_updated: string | null
    event_count: number
  }
}

const EMPTY_FORM = {
  title: '',
  game: 'genshin',
  type: 'event',
  start: '',
  end: '',
  url: '',
  image_url: '',
}

function Admin() {
  const {isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [scraperStatus, setScraperStatus] = useState<ScraperStatus>({})
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filterGame, setFilterGame] = useState<string>('all')
  const [loading, setLoading] = useState(false)
  const [scraping, setScraping] = useState<string | null>(null)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [uploading, setUploading] = useState(false)

  const authHeaders = useCallback(async () => {
    const token = await getAccessTokenSilently()
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  }, [getAccessTokenSilently])

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const uploadToCloudinary = async (): Promise<string | null> => {
    if (!imageFile) return form.image_url || null
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', imageFile)
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      )
      const data = await res.json()
      return data.secure_url
    } catch {
      showMessage('Image upload failed', 'error')
      return null
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
  const checkAdmin = async () => {
    if (isLoading) return
    if (!isAuthenticated) { setIsAdmin(false); return }
    try {
      const headers = await authHeaders()
      const res = await fetch(`${API}/admin/scraper-status`, { headers })
      setIsAdmin(res.ok)
    } catch {
      setIsAdmin(false)
    }
    }
    checkAdmin()
  }, [isAuthenticated, isLoading, authHeaders])

  const loadEvents = useCallback(async () => {
    setLoading(true)
    try {
      const headers = await authHeaders()
      const url = filterGame === 'all'
        ? `${API}/admin/events`
        : `${API}/admin/events?game_id=${filterGame}`
      const res = await fetch(url, { headers })
      if (!res.ok) throw new Error('Failed to load events')
      const data = await res.json()
      setEvents(data.events)
    } catch {
      showMessage('Failed to load events', 'error')
    } finally {
      setLoading(false)
    }
  }, [authHeaders, filterGame])

  const loadScraperStatus = useCallback(async () => {
    try {
      const headers = await authHeaders()
      const res = await fetch(`${API}/admin/scraper-status`, { headers })
      if (!res.ok) return
      const data = await res.json()
      setScraperStatus(data)
    } catch {}
  }, [authHeaders])

  useEffect(() => {
    if (isAdmin) loadEvents()
  }, [loadEvents, isAdmin])

  useEffect(() => {
    if (isAdmin) loadScraperStatus()
  }, [loadScraperStatus, isAdmin])

  const handleSubmit = async () => {
  if (!form.title || !form.start || !form.end) {
    showMessage('Title, start, and end are required', 'error')
    return
  }
  try {
    const image_url = await uploadToCloudinary()
    const headers = await authHeaders()
    const method = editingId ? 'PUT' : 'POST'
    const url = editingId
      ? `${API}/admin/events/${editingId}`
      : `${API}/admin/events`
    const res = await fetch(url, {
      method,
      headers,
      body: JSON.stringify({ ...form, image_url }),
    })
    if (!res.ok) throw new Error('Failed to save event')
    showMessage(editingId ? 'Event updated' : 'Event created', 'success')
    setForm({ ...EMPTY_FORM })
    setEditingId(null)
    setImageFile(null)
    setImagePreview('')
    loadEvents()
  } catch {
    showMessage('Failed to save event', 'error')
  }
}

  const handleEdit = (event: Event) => {
    setEditingId(event.id)
    setForm({
      title: event.title,
      game: event.game,
      type: event.type,
      start: event.start.slice(0, 16),
      end: event.end.slice(0, 16),
      url: event.url ?? '',
      image_url: event.image_url ?? '',
    })
    setImagePreview(event.image_url ?? '')
    setImageFile(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm('Delete this event?')) return
    try {
      const headers = await authHeaders()
      const res = await fetch(`${API}/admin/events/${eventId}`, {
        method: 'DELETE',
        headers,
      })
      if (!res.ok) throw new Error()
      showMessage('Event deleted', 'success')
      loadEvents()
    } catch {
      showMessage('Failed to delete event', 'error')
    }
  }

  const handleBulkDelete = async (gameId: string) => {
    if (!confirm(`Delete ALL events for ${gameId}?`)) return
    try {
      const headers = await authHeaders()
      const res = await fetch(`${API}/admin/events/game/${gameId}`, {
        method: 'DELETE',
        headers,
      })
      if (!res.ok) throw new Error()
      showMessage(`Deleted all ${gameId} events`, 'success')
      loadEvents()
    } catch {
      showMessage('Failed to delete events', 'error')
    }
  }

  const handleScrape = async (gameId: string) => {
    setScraping(gameId)
    try {
      const headers = await authHeaders()
      const res = await fetch(`${API}/admin/scrape/${gameId}`, {
        method: 'POST',
        headers,
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      showMessage(`Scraped ${data.event_count} events for ${gameId}`, 'success')
      loadEvents()
      loadScraperStatus()
    } catch {
      showMessage(`Scrape failed for ${gameId}`, 'error')
    } finally {
      setScraping(null)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm({ ...EMPTY_FORM })
    setImageFile(null)
    setImagePreview('')
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })

  const formatLastUpdated = (iso: string | null) => {
    if (!iso) return 'Never'
    const d = new Date(iso)
    const age = Date.now() - d.getTime()
    const hours = Math.floor(age / (1000 * 60 * 60))
    if (hours < 1) return 'Less than an hour ago'
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  if (isLoading || isAdmin === null) return (
    <div className="page-container">
      <p style={{ padding: '40px', color: 'var(--text-muted)' }}>Checking access...</p>
    </div>
  )

  if (!isAdmin) return (
    <div className="page-container">
      <p style={{ padding: '40px', color: 'var(--text-muted)' }}>Access denied.</p>
    </div>
  )

  return (
    <div className="page-container">
      <div className="admin-wrapper">
        <div className="support-header">
          <h1>Admin Panel</h1>
          <p>Manage events, trigger scrapes, and monitor scraper health.</p>
        </div>

        {message && (
          <div className={`admin-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="changelog-entry">
          <div className="changelog-entry-header">
            <span className="changelog-version">
              {editingId ? `Editing: ${editingId}` : 'Create Event'}
            </span>
            {editingId && (
              <button className="admin-btn-small" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
          <div className="admin-form">
            <div className="admin-form-row">
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  className="form-input"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Event title"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Game *</label>
                <select
                  className="form-input"
                  value={form.game}
                  onChange={e => setForm(f => ({ ...f, game: e.target.value }))}
                >
                  {GAMES.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="admin-form-row">
              <div className="form-group">
                <label className="form-label">Type *</label>
                <select
                  className="form-input"
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                >
                  <option value="event">Event</option>
                  <option value="banner">Banner</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">URL</label>
                <input
                  className="form-input"
                  value={form.url}
                  onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div className="form-group">
                <label className="form-label">Event Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-input"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      marginTop: '8px',
                      maxHeight: '120px',
                      borderRadius: '6px',
                      objectFit: 'cover',
                    }}
                  />
                )}
              </div>
            </div>
            <div className="admin-form-row">
              <div className="form-group">
                <label className="form-label">Start *</label>
                <input
                  className="form-input"
                  type="datetime-local"
                  value={form.start}
                  onChange={e => setForm(f => ({ ...f, start: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">End *</label>
                <input
                  className="form-input"
                  type="datetime-local"
                  value={form.end}
                  onChange={e => setForm(f => ({ ...f, end: e.target.value }))}
                />
              </div>
            </div>
            <button className="auth-btn" onClick={handleSubmit}>
              {editingId ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </div>

        <div className="changelog-entry">
          <div className="changelog-entry-header">
            <span className="changelog-version">Scraper Status</span>
          </div>
          <div className="admin-scraper-grid">
            {Object.entries(scraperStatus).map(([gameId, status]) => {
              const game = GAMES.find(g => g.id === gameId)
              return (
                <div key={gameId} className="admin-scraper-card">
                  <div className="admin-scraper-header">
                    <span
                      className="admin-scraper-name"
                      style={{ color: game?.color ?? 'var(--text-primary)' }}
                    >
                      {game?.name ?? gameId}
                    </span>
                    <span className="admin-scraper-count">
                      {status.event_count} events
                    </span>
                  </div>
                  <div className="admin-scraper-updated">
                    Last updated: {formatLastUpdated(status.last_updated)}
                  </div>
                  <div className="admin-scraper-actions">
                    <button
                      className="admin-btn-small"
                      onClick={() => handleScrape(gameId)}
                      disabled={scraping === gameId}
                    >
                      {scraping === gameId ? 'Scraping...' : 'Scrape Now'}
                    </button>
                    <button
                      className="admin-btn-small danger"
                      onClick={() => handleBulkDelete(gameId)}
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="changelog-entry">
          <div className="changelog-entry-header">
            <span className="changelog-version">
              Events {loading ? '(loading...)' : `(${events.length})`}
            </span>
            <select
              className="admin-filter-select"
              value={filterGame}
              onChange={e => setFilterGame(e.target.value)}
            >
              <option value="all">All Games</option>
              {GAMES.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div className="admin-event-list">
            {events.length === 0 && !loading && (
              <p className="admin-empty">No events found.</p>
            )}
            {events.map(event => {
              const game = GAMES.find(g => g.id === event.game)
              return (
                <div key={event.id} className="admin-event-row">
                  <div
                    className="admin-event-color"
                    style={{ background: game?.color ?? '#888' }}
                  />
                  <div className="admin-event-info">
                    <span className="admin-event-title">{event.title}</span>
                    <span className="admin-event-meta">
                      {game?.name ?? event.game} · {event.type} · {formatDate(event.start)} → {formatDate(event.end)}
                    </span>
                  </div>
                  <div className="admin-event-actions">
                    <button
                      className="admin-btn-small"
                      onClick={() => handleEdit(event)}
                    >
                      Edit
                    </button>
                    <button
                      className="admin-btn-small danger"
                      onClick={() => handleDelete(event.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin