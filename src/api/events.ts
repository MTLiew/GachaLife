import axios from 'axios'
import type { GachaEvent } from '../types'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export async function fetchEvents(gameId: string): Promise<GachaEvent[]> {
  const response = await axios.get(`${BASE_URL}/events/${gameId}`)
  const raw = response.data.events

  return raw.map((e: any) => ({
    id: e.id,
    title: e.title,
    game: e.game,
    start: new Date(e.start),
    end: new Date(e.end),
    type: e.type,
    url: e.url,
  }))
}

export async function fetchStatus(): Promise<Record<string, {
  last_updated: string | null
  event_count: number | null
  cached: boolean
}>> {
  const response = await axios.get(`${BASE_URL}/status`)
  return response.data
}