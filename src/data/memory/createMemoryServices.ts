import { MemoryPushService } from '../../push/memoryPushService'
import { MemoryAuthService } from '../../auth/memoryAuthService'
import type { Services } from '../../firebase/createServices'
import { MemoryEventRepository } from './memoryEventRepository'
import { MemoryParticipationRepository } from './memoryParticipationRepository'
import { MemoryPhotoStorage } from './memoryPhotoStorage'
import { MemoryUserRepository } from './memoryUserRepository'

// Servizi tutti in memoria: usati dai test al posto di Firebase.
export function createMemoryServices(): Services {
  // L'archivio degli eventi ha bisogno di leggere le iscrizioni (per il luogo esatto), e viceversa:
  // il collegamento è una funzione che guarda `participations` solo quando serve.
  const events: MemoryEventRepository = new MemoryEventRepository(undefined, undefined, (eventId, uid) => participations.get(eventId, uid))
  const participations: MemoryParticipationRepository = new MemoryParticipationRepository(events)
  return {
    auth: new MemoryAuthService(),
    users: new MemoryUserRepository(),
    events,
    participations,
    photos: new MemoryPhotoStorage(),
    push: new MemoryPushService(),
  }
}
