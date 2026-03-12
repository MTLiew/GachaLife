import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import type { GachaEvent, Game } from '../types'
import { GAMES } from '../games'


const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'en-US': enUS },
})

type Props = {
  events: GachaEvent[]
  selectedGames: string[]
}

function GachaCalendar({ events, selectedGames }: Props) {
  const filteredEvents = selectedGames.length === 0
    ? events
    : events.filter(e => selectedGames.includes(e.game))

  const gameColorMap = Object.fromEntries(
    GAMES.map((g: Game) => [g.id, g.color])
  )

  const eventStyleGetter = (event: GachaEvent) => ({
    style: {
      backgroundColor: gameColorMap[event.game] ?? '#888',
      borderRadius: '4px',
      border: 'none',
      color: 'white',
    }
  })

  return (
    <div className="calendar-container">
      <Calendar
        localizer={localizer}
        events={filteredEvents}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        eventPropGetter={eventStyleGetter}
        style={{ height: 600 }}
      />
    </div>
  )
}

export default GachaCalendar