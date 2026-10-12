import type { AuthService } from '../auth/authService'
import type { EventRepository } from '../data/eventRepository'
import type { ParticipationRepository } from '../data/participationRepository'
import type { PhotoStorage } from '../data/photoStorage'
import type { UserRepository } from '../data/userRepository'
import { FirebaseAuthService } from './firebaseAuthService'
import { FirebasePhotoStorage } from './firebasePhotoStorage'
import { FirestoreEventRepository } from './firestoreEventRepository'
import { FirestoreParticipationRepository } from './firestoreParticipationRepository'
import { FirestoreUserRepository } from './firestoreUserRepository'

// L'unico punto che sa che si usa Firebase: il resto dell'app riceve solo le interfacce.
export interface Services {
  auth: AuthService
  users: UserRepository
  events: EventRepository
  participations: ParticipationRepository
  photos: PhotoStorage
}

export function createFirebaseServices(): Services {
  return {
    auth: new FirebaseAuthService(),
    users: new FirestoreUserRepository(),
    events: new FirestoreEventRepository(),
    participations: new FirestoreParticipationRepository(),
    photos: new FirebasePhotoStorage(),
  }
}
