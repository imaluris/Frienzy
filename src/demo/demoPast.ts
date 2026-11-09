import type { Services } from '../firebase/createServices'
import { toNewEvent, type DemoEventSpec } from './demoEvents'

// Eventi già passati (solo anteprima e screenshot): servono a vedere presenze, voti e il riepilogo nel Profilo.
export const DEMO_PAST_SPECS: DemoEventSpec[] = [
  { tipo: 'aperitivo', titolo: 'Aperitivo di ieri sera', descrizione: 'Spritz e musica sul Naviglio.', giorni: -1, ora: 19, zona: 'Navigli, Milano', lat: 45.4523, lng: 9.1766, indirizzo: 'Alzaia Naviglio Pavese 4', max: 8, approvazione: false, organizzatore: 'demo-io', confermati: ['demo-giulia', 'demo-luca', 'demo-sara'] },
  { tipo: 'cena', titolo: "Cena d'autunno", descrizione: 'Zucca, castagne e vino nuovo.', giorni: -4, ora: 20, zona: 'Isola, Milano', lat: 45.4894, lng: 9.1911, indirizzo: 'Via Borsieri 20', max: 6, approvazione: false, organizzatore: 'demo-marco', confermati: ['demo-io', 'demo-giulia'] },
  { tipo: 'trekking', titolo: 'Trekking di domenica', descrizione: 'Un anello facile tra i boschi.', giorni: -8, ora: 9, zona: 'Lago di Como', lat: 45.9, lng: 9.27, indirizzo: 'Parcheggio di Onno', max: 10, approvazione: false, organizzatore: 'demo-sara', confermati: ['demo-io', 'demo-marco'] },
  { tipo: 'mostra', titolo: 'Mostra di design', descrizione: 'Visita libera e caffè dopo.', giorni: -12, ora: 16, zona: 'Brera, Milano', lat: 45.4719, lng: 9.1881, indirizzo: 'Via Brera 5', max: 10, approvazione: false, organizzatore: 'demo-luca', confermati: ['demo-io'] },
]

// Presenze e voti d'esempio. Il cuore del demo: demo-io ha fatto 2 eventi su 3 (67%) e riceve due voti come organizzatore.
export async function seedDemoPast(services: Services): Promise<void> {
  for (const spec of DEMO_PAST_SPECS) {
    const event = await services.events.create(toNewEvent(spec), { indirizzo: spec.indirizzo, lat: spec.lat, lng: spec.lng })
    for (const uid of spec.confermati) await services.participations.add(event.id, uid, 'confermato')
  }
  const events = await services.events.list()
  const byTitle = (t: string) => events.find((e) => e.titolo === t)
  const dinner = byTitle("Cena d'autunno")
  const hike = byTitle('Trekking di domenica')
  const expo = byTitle('Mostra di design')
  const aperitivo = byTitle('Aperitivo di ieri sera')
  if (!dinner || !hike || !expo || !aperitivo) return
  const { attendance } = services
  await attendance.markPresence(dinner.id, 'demo-marco', 'demo-io', 'presente')
  await attendance.markPresence(hike.id, 'demo-sara', 'demo-io', 'presente')
  await attendance.markPresence(expo.id, 'demo-luca', 'demo-io', 'assente')
  await attendance.rate(hike.id, 'demo-io', { stelle: 5, etichetta: 'Accogliente' })
  await attendance.rate(aperitivo.id, 'demo-giulia', { stelle: 5, etichetta: 'Ben organizzato' })
  await attendance.rate(aperitivo.id, 'demo-luca', { stelle: 4, etichetta: 'Simpatico' })
}
