import type { EventTypeId } from '../domain/eventTypes'

// Colore del segnaposto per ogni tipo: stesso tono di partenza della copertina di quel tipo.
export const TYPE_COLOR: Record<EventTypeId, string> = {
  aperitivo: '#E2725B',
  cena: '#B9533F',
  mostra: '#6F5AA8',
  trekking: '#2F5D50',
  passeggiata: '#4F8A73',
  sport: '#2F6F9A',
  altro: '#D79A22',
}
