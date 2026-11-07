import type { ChatRepository } from '../chat/chatRepository'
import type { AuthService } from '../auth/authService'
import type { EventRepository } from '../data/eventRepository'
import type { ParticipationRepository } from '../data/participationRepository'
import type { PhotoStorage } from '../data/photoStorage'
import type { UserRepository } from '../data/userRepository'
import { CapacitorPushService } from '../push/capacitorPushService'
import type { PushService } from '../push/pushService'
import type { SavedRepository } from '../saved/savedRepository'
import type { BlockRepository } from '../safety/blockRepository'
import type { ReportRepository } from '../safety/reportRepository'
import { FirestoreBlockRepository } from './firestoreBlockRepository'
import { FirestoreReportRepository } from './firestoreReportRepository'
import { FirestoreChatRepository } from './firestoreChatRepository'
import { FirebaseAuthService } from './firebaseAuthService'
import { FirebasePhotoStorage } from './firebasePhotoStorage'
import { FirestoreEventRepository } from './firestoreEventRepository'
import { FirestoreParticipationRepository } from './firestoreParticipationRepository'
import { FirestoreSavedRepository } from './firestoreSavedRepository'
import { FirestoreUserRepository } from './firestoreUserRepository'

// L'unico punto che sa che si usa Firebase: il resto dell'app riceve solo le interfacce.
export interface Services {
  auth: AuthService
  users: UserRepository
  events: EventRepository
  participations: ParticipationRepository
  photos: PhotoStorage
  push: PushService
  saved: SavedRepository
  chat: ChatRepository
  reports: ReportRepository
  blocks: BlockRepository
}

export function createFirebaseServices(): Services {
  return {
    auth: new FirebaseAuthService(),
    users: new FirestoreUserRepository(),
    events: new FirestoreEventRepository(),
    participations: new FirestoreParticipationRepository(),
    photos: new FirebasePhotoStorage(),
    push: new CapacitorPushService(),
    saved: new FirestoreSavedRepository(),
    chat: new FirestoreChatRepository(),
    reports: new FirestoreReportRepository(),
    blocks: new FirestoreBlockRepository(),
  }
}
