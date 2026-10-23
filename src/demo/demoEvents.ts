import type { NewEvent } from '../domain/event'
import type { EventTypeId } from '../domain/eventTypes'
import { approximateCoordinate } from '../events/approximate'
import { encodeGeohash } from '../events/geohash'

// Descrizione compatta di un evento d'esempio; il resto si ricava.
export interface DemoEventSpec {
  tipo: EventTypeId
  titolo: string
  descrizione: string
  giorni: number // quanti giorni da oggi
  ora: number
  zona: string
  lat: number
  lng: number
  indirizzo: string
  max: number
  approvazione: boolean
  organizzatore: string
  confermati: string[]
  richieste?: string[]
  annullato?: boolean
}

export const DEMO_EVENT_SPECS: DemoEventSpec[] = [
  { tipo: 'aperitivo', titolo: 'Aperitivo sul Naviglio', descrizione: 'Spritz e chiacchiere in compagnia.', giorni: 2, ora: 19, zona: 'Navigli, Milano', lat: 45.4523, lng: 9.1766, indirizzo: 'Alzaia Naviglio Grande 12', max: 8, approvazione: false, organizzatore: 'demo-giulia', confermati: ['demo-sara'] },
  { tipo: 'cena', titolo: 'Cena di pasta fatta in casa', descrizione: 'Si impasta insieme, poi si mangia.', giorni: 3, ora: 20, zona: 'Isola, Milano', lat: 45.4894, lng: 9.1911, indirizzo: 'Via Borsieri 8', max: 6, approvazione: true, organizzatore: 'demo-sara', confermati: ['demo-giulia'], richieste: ['demo-luca'] },
  { tipo: 'mostra', titolo: 'Mostra di fotografia', descrizione: 'Visita guidata e caffè dopo.', giorni: 5, ora: 16, zona: 'Brera, Milano', lat: 45.4719, lng: 9.1881, indirizzo: 'Via Brera 28', max: 10, approvazione: false, organizzatore: 'demo-sara', confermati: [] },
  { tipo: 'trekking', titolo: 'Trekking al lago', descrizione: 'Sentiero facile, circa 3 ore.', giorni: 6, ora: 9, zona: 'Lago di Como', lat: 45.9, lng: 9.27, indirizzo: 'Parcheggio di Onno', max: 12, approvazione: true, organizzatore: 'demo-marco', confermati: ['demo-io', 'demo-luca'] },
  { tipo: 'passeggiata', titolo: 'Passeggiata nel parco', descrizione: 'Due passi con calma.', giorni: 1, ora: 10, zona: 'Parco Sempione, Milano', lat: 45.4727, lng: 9.1747, indirizzo: 'Ingresso Arco della Pace', max: 15, approvazione: false, organizzatore: 'demo-io', confermati: ['demo-giulia'], richieste: [] },
  { tipo: 'sport', titolo: 'Calcetto del giovedì', descrizione: 'Partita tra amici, tutti i livelli.', giorni: 4, ora: 21, zona: 'Lambrate, Milano', lat: 45.4844, lng: 9.2326, indirizzo: 'Campo Sportivo Rubattino', max: 2, approvazione: false, organizzatore: 'demo-luca', confermati: ['demo-marco', 'demo-sara'] },
  { tipo: 'altro', titolo: 'Serata giochi da tavolo', descrizione: 'Portate un gioco da condividere.', giorni: 8, ora: 20, zona: 'Porta Romana, Milano', lat: 45.4513, lng: 9.2055, indirizzo: 'Viale Sabotino 3', max: 8, approvazione: false, organizzatore: 'demo-marco', confermati: [] },
  { tipo: 'cena', titolo: 'Cena sociale (annullata)', descrizione: 'Rimandata per imprevisto.', giorni: 7, ora: 20, zona: 'Navigli, Milano', lat: 45.4491, lng: 9.1789, indirizzo: 'Via Vigevano 20', max: 6, approvazione: false, organizzatore: 'demo-io', confermati: ['demo-luca'], annullato: true },
]

export function toNewEvent(spec: DemoEventSpec): NewEvent {
  const when = new Date()
  when.setDate(when.getDate() + spec.giorni)
  when.setHours(spec.ora, 0, 0, 0)
  const lat = approximateCoordinate(spec.lat)
  const lng = approximateCoordinate(spec.lng)
  return {
    organizzatoreId: spec.organizzatore, tipo: spec.tipo, titolo: spec.titolo, descrizione: spec.descrizione,
    dataOra: when, zonaNome: spec.zona, latApprossimata: lat, lngApprossimata: lng, geohash: encodeGeohash(lat, lng),
    maxPartecipanti: spec.max, richiedeApprovazione: spec.approvazione,
  }
}
