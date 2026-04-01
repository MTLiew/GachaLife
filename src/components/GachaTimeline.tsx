import { useMemo, useRef, useEffect } from 'react'
import type { GachaEvent } from '../types'
import { GAMES } from '../games'

type Props = {
  events: GachaEvent[]
  selectedGames: string[]
}

const LABEL_WIDTH = 150
const DAY_WIDTH = 60
const ROW_HEIGHT = 36
const GAME_PADDING = 12
const HEADER_HEIGHT = 56
const TOTAL_WEEKS = 9
const TOTAL_DAYS = TOTAL_WEEKS * 7
const PAST_DAYS = 28

function GachaTimeline({ events, selectedGames }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const headerScrollRef = useRef<HTMLDivElement>(null)

  const now = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const rangeStart = useMemo(() => {
    const d = new Date(now)
    d.setDate(d.getDate() - PAST_DAYS)
    return d
  }, [now])

  const totalWidth = TOTAL_DAYS * DAY_WIDTH

  const dateToX = (date: Date): number => {
    const diffMs = date.getTime() - rangeStart.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    return diffDays * DAY_WIDTH
  }

  const todayX = dateToX(now)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (headerScrollRef.current) {
      headerScrollRef.current.scrollLeft = e.currentTarget.scrollLeft
    }
  }

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollRef.current) {
      e.preventDefault()
      e.stopPropagation()
      scrollRef.current.scrollLeft += e.deltaY
      if (headerScrollRef.current) {
        headerScrollRef.current.scrollLeft = scrollRef.current.scrollLeft
      }
    }
  }

  useEffect(() => {
  const el = scrollRef.current
  if (!el) return

  const onWheel = (e: WheelEvent) => {
    e.preventDefault()
    el.scrollLeft += e.deltaY
    if (headerScrollRef.current) {
      headerScrollRef.current.scrollLeft = el.scrollLeft
    }
  }

  el.addEventListener('wheel', onWheel, { passive: false })
  return () => el.removeEventListener('wheel', onWheel)
}, [])

  useEffect(() => {
    if (scrollRef.current && headerScrollRef.current) {
      const defaultScroll = (PAST_DAYS - 7) * DAY_WIDTH
      scrollRef.current.scrollLeft = defaultScroll
      headerScrollRef.current.scrollLeft = defaultScroll
    }
  }, [])

  const gameGroups = useMemo(() => {
    return GAMES
      .filter(g => selectedGames.includes(g.id))
      .map(game => {
        const gameEvents = events
          .filter(e => e.game === game.id)
          .sort((a, b) => a.start.getTime() - b.start.getTime())
        return { game, events: gameEvents }
      })
  }, [events, selectedGames])

  return (
    <div className="timeline-wrapper">
      <div className="timeline-container">
        {/* Header row */}
        <div className="timeline-header-row">
          <div className="timeline-label-spacer" style={{ width: LABEL_WIDTH }} />
          <div className="timeline-header-scroll" ref={headerScrollRef}>
            <div style={{ width: totalWidth, height: HEADER_HEIGHT, position: 'relative', background: 'var(--bg-secondary)' }}>
              {Array.from({ length: TOTAL_DAYS }).map((_, i) => {
                const date = new Date(rangeStart)
                date.setDate(date.getDate() + i)
                const x = i * DAY_WIDTH
                const isToday = date.getTime() === now.getTime()
                const weekday = date.toLocaleDateString('en-US', { weekday: 'short' })
                const dayNum = date.getDate()
                const monthLabel = date.toLocaleDateString('en-US', { month: 'short' })
                const showMonth = date.getDate() === 1 || i === 0

                return (
                  <div
                    key={i}
                    className={`timeline-header-cell ${isToday ? 'today' : ''}`}
                    style={{ left: x, width: DAY_WIDTH }}
                  >
                    <span className="timeline-header-weekday">{weekday}</span>
                    <span className="timeline-header-day">
                      {showMonth ? `${monthLabel} ${dayNum}` : dayNum}
                    </span>
                  </div>
                )
              })}
              <div className="timeline-today-marker" style={{ left: todayX }} />
            </div>
          </div>
        </div>

        {/* Main body */}
        <div className="timeline-body">
          {/* Game label column */}
          <div className="timeline-labels" style={{ width: LABEL_WIDTH }}>
            {gameGroups.map(({ game, events: gameEvents }) => {
              const rowCount = Math.max(gameEvents.length, 1)
              const height = rowCount * ROW_HEIGHT + GAME_PADDING * 2
              return (
                <div
                  key={game.id}
                  className="timeline-label"
                  style={{ height, borderLeftColor: game.color }}
                >
                  {game.name}
                </div>
              )
            })}
          </div>

          {/* Scrollable event grid */}
          <div
            className="timeline-scroll"
            ref={scrollRef}
            onScroll={handleScroll}
          >
            <div style={{ width: totalWidth, position: 'relative' }}>
              {gameGroups.map(({ game, events: gameEvents }) => {
                const rowCount = Math.max(gameEvents.length, 1)
                const height = rowCount * ROW_HEIGHT + GAME_PADDING * 2
                return (
                  <div
                    key={game.id}
                    className="timeline-game-row"
                    style={{ height }}
                  >
                    <div className="timeline-today-marker" style={{ left: todayX }} />
                    {gameEvents.map((event, rowIndex) => {
                        const startX = Math.max(0, dateToX(event.start))
                        const endX = Math.min(totalWidth, dateToX(event.end))
                        const width = endX - startX
                        const top = GAME_PADDING + rowIndex * ROW_HEIGHT
                        const startsBeforeRange = event.start < rangeStart

                        if (width <= 0) return null

                        return (
                            <div
                            key={event.id}
                            className={`timeline-event-bar ${startsBeforeRange ? 'clipped-left' : ''}`}
                            style={{
                                left: startX,
                                width,
                                top,
                                height: ROW_HEIGHT - 6,
                                backgroundColor: GAMES.find(g => g.id === event.game)?.color ?? '#888',
                            }}
                            title={event.title}
                            >
                            <span className="timeline-event-label">{event.title}</span>
                            </div>
                        )
                        })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GachaTimeline