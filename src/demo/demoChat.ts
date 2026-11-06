import type { Services } from '../firebase/createServices'
import { DEMO_EVENT_SPECS } from './demoEvents'

// Qualche messaggio d'esempio nelle chat di due eventi (solo anteprima e screenshot).
const CHATS: Record<string, [string, string][]> = {
  'Trekking al lago': [
    ['demo-marco', 'Ciao a tutti! Ci vediamo alle 9 al parcheggio di Onno.'],
    ['demo-luca', 'Perfetto, porto io il thermos con il tè caldo.'],
    ['demo-luca', 'Serve qualcosa di particolare per le scarpe?'],
    ['demo-marco', 'Bastano scarpe da trekking leggere, il sentiero è facile.'],
    ['demo-io', 'Io arrivo in treno e poi in taxi: qualcuno ha un posto in macchina dal lago?'],
  ],
  'Passeggiata nel parco': [
    ['demo-giulia', 'Posso portare anche il mio cane?'],
    ['demo-io', 'Certo, più siamo meglio è! Ci vediamo all\'Arco della Pace.'],
  ],
}

export async function seedDemoChat(services: Services): Promise<void> {
  const events = await services.events.list()
  for (const spec of DEMO_EVENT_SPECS) {
    const lines = CHATS[spec.titolo]
    const event = events.find((e) => e.titolo === spec.titolo)
    if (!lines || !event) continue
    for (const [uid, text] of lines) await services.chat.send(event.id, uid, text)
  }
}
