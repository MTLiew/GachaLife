import { useState, useEffect } from 'react'

function Clock() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [is12Hour, setIs12Hour] = useState<boolean>(true)

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
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getTimezone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  }

  return (
    <div className="clock">
      <div className="clock-time">{formatTime(currentTime)}</div>
      <div className="clock-date">{formatDate(currentTime)}</div>
      <div className="clock-footer">
        <span className="clock-timezone">{getTimezone()}</span>
        <button
          className="clock-toggle"
          onClick={() => setIs12Hour(prev => !prev)}
        >
          {is12Hour ? '24hr' : '12hr'}
        </button>
      </div>
    </div>
  )
}

export default Clock