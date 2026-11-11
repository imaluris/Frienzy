import { MemoryAuthService } from '../auth/memoryAuthService'
import { createMemoryServices } from '../data/memory/createMemoryServices'
import type { Services } from '../firebase/createServices'
import { EXTREME_PROFILES, EXTREME_SPEC } from './demoExtreme'
import { DEMO_EVENT_SPECS, toNewEvent } from './demoEvents'
import { seedDemoPast } from './demoPast'
import { seedDemoChat } from './demoChat'
import { DEFAULT_PREFS } from '../notifications/prefs'
import { DEMO_PROFILES, DEMO_UID } from './demoPeople'

export const DEMO_EMAIL = 'demo@frienzy.it'
export const DEMO_PASSWORD = 'demo1234'

// Servizi in memoria con persone ed eventi d'esempio e un utente già collegato.
// Serve a guardare l'app senza Firebase (anteprima e screenshot).
export async function createDemoServices(): Promise<Services> {
  // Il primo account è quello della demo; chi si registra dopo (anche negli screenshot) è una persona nuova, senza profilo.
  let registered = 0
  const services = createMemoryServices(new MemoryAuthService(() => (registered++ === 0 ? DEMO_UID : `nuovo-${registered}`)))
  const extreme = import.meta.env.VITE_DEMO_EXTREME === '1' // solo per la revisione grafica
  const profiles = extreme ? [...DEMO_PROFILES, ...EXTREME_PROFILES] : DEMO_PROFILES
  const specs = extreme ? [EXTREME_SPEC, ...DEMO_EVENT_SPECS] : DEMO_EVENT_SPECS
  for (const profile of profiles) await services.users.save(profile)
  for (const spec of specs) {
    const event = await services.events.create(toNewEvent(spec), { indirizzo: spec.indirizzo, lat: spec.lat, lng: spec.lng })
    for (const uid of spec.confermati) await services.participations.add(event.id, uid, 'confermato')
    for (const uid of spec.richieste ?? []) await services.participations.add(event.id, uid, 'richiesta')
    for (const uid of spec.attesa ?? []) await services.participations.joinWaitlist(event.id, uid)
    if (spec.annullato) await services.events.update(event.id, { stato: 'annullato' })
  }
  await services.notifications.savePrefs(DEMO_UID, { ...DEFAULT_PREFS, inviti: true }) // così la demo mostra anche gli inviti
  await seedDemoChat(services)
  await seedDemoPast(services)
  await services.auth.register(DEMO_EMAIL, DEMO_PASSWORD) // dopo la registrazione si è già dentro
  return services
}
