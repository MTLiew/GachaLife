export type GachaEvent = {
  id: string
  title: string
  game: string
  start: Date
  end: Date
  type: 'banner' | 'event' | 'maintenance'
  engagement?: 'relaxed' | 'casual' | 'focused' | 'challenge'
  url?: string
}

export type Game = {
  id: string
  name: string
  color: string
  comingSoon?: boolean
}