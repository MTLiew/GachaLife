import { useState, useEffect } from 'react'

const TIMEZONES = [
  { label: 'UTC', value: 'UTC' },
  { label: 'New York (EST)', value: 'America/New_York' },
  { label: 'Los Angeles (PST)', value: 'America/Los_Angeles' },
  { label: 'London (GMT)', value: 'Europe/London' },
  { label: 'Paris (CET)', value: 'Europe/Paris' },
  { label: 'Shanghai (UTC+8)', value: 'Asia/Shanghai' },
  { label: 'Tokyo (JST)', value: 'Asia/Tokyo' },
  { label: 'Seoul (KST)', value: 'Asia/Seoul' },
]

function Clock() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [is12Hour, setIs12Hour] = useState<boolean>(true)
  const [timezone, setTimezone] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: is12Hour,
      timeZone: timezone,
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: timezone,
    })
  }

  return (
    <div className="clock">
      <div className="clock-time">{formatTime(currentTime)}</div>
      <div className="clock-date">{formatDate(currentTime)}</div>
      <div className="clock-footer">
        <select
          className="clock-timezone-select"
          value={timezone}
          onChange={e => setTimezone(e.target.value)}
        >
          {TIMEZONES.map(tz => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
        <button
          className="clock-toggle"
          onClick={() => setIs12Hour(prev => !prev)}
        >
          {is12Hour ? '12hr' : '24hr'}
        </button>
      </div>
    </div>
  )
}

export default Clock