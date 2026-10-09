// Tipi di evento. Gli stessi id servono anche come "interessi" del profilo.
export const EVENT_TYPE_IDS = [
  'aperitivo',
  'cena',
  'mostra',
  'trekking',
  'passeggiata',
  'sport',
  'altro',
] as const

export type EventTypeId = (typeof EVENT_TYPE_IDS)[number]

export const EVENT_TYPE_EMOJI: Record<EventTypeId, string> = {
  aperitivo: '🍹',
  cena: '🍽️',
  mostra: '🖼️',
  trekking: '🥾',
  passeggiata: '🚶',
  sport: '⚽',
  altro: '✨',
}

export function isEventTypeId(value: string): value is EventTypeId {
  return (EVENT_TYPE_IDS as readonly string[]).includes(value)
}
