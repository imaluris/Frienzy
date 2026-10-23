import { MemoryAuthService } from '../auth/memoryAuthService'
import { createMemoryServices } from '../data/memory/createMemoryServices'
import type { Services } from '../firebase/createServices'
import { DEMO_EVENT_SPECS, toNewEvent } from './demoEvents'
import { DEMO_PROFILES, DEMO_UID } from './demoPeople'

export const DEMO_EMAIL = 'demo@frienzy.it'
export const DEMO_PASSWORD = 'demo1234'

// Servizi in memoria con persone ed eventi d'esempio e un utente già collegato.
// Serve a guardare l'app senza Firebase (anteprima e screenshot).
export async function createDemoServices(): Promise<Services> {
  const services = createMemoryServices(new MemoryAuthService(() => DEMO_UID))
  for (const profile of DEMO_PROFILES) await services.users.save(profile)
  for (const spec of DEMO_EVENT_SPECS) {
    const event = await services.events.create(toNewEvent(spec), { indirizzo: spec.indirizzo, lat: spec.lat, lng: spec.lng })
    for (const uid of spec.confermati) await services.participations.add(event.id, uid, 'confermato')
    for (const uid of spec.richieste ?? []) await services.participations.add(event.id, uid, 'richiesta')
    if (spec.annullato) await services.events.update(event.id, { stato: 'annullato' })
  }
  await services.auth.register(DEMO_EMAIL, DEMO_PASSWORD) // dopo la registrazione si è già dentro
  return services
}
