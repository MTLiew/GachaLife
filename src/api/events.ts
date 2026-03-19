import axios from 'axios'
import type { GachaEvent } from '../types'

const BASE_URL = 'http://127.0.0.1:8000'

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