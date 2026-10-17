import { MemoryAuthService } from '../../auth/memoryAuthService'
import type { Services } from '../../firebase/createServices'
import { MemoryEventRepository } from './memoryEventRepository'
import { MemoryParticipationRepository } from './memoryParticipationRepository'
import { MemoryPhotoStorage } from './memoryPhotoStorage'
import { MemoryUserRepository } from './memoryUserRepository'

// Servizi tutti in memoria: usati dai test al posto di Firebase.
export function createMemoryServices(): Services {
  const events = new MemoryEventRepository()
  return {
    auth: new MemoryAuthService(),
    users: new MemoryUserRepository(),
    events,
    participations: new MemoryParticipationRepository(events),
    photos: new MemoryPhotoStorage(),
  }
}
