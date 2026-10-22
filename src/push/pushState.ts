import type { PushNotificationInfo, PushPermission } from './pushService'

// Lo stato delle notifiche, descritto da un "reducer" puro: facile da testare senza telefono.
export interface PushState {
  status: 'idle' | 'unsupported' | 'denied' | 'registering' | 'registered' | 'error'
  token: string
  error: string
  last: PushNotificationInfo | null
}

export type PushEvent =
  | { type: 'unsupported' }
  | { type: 'permission'; permission: PushPermission }
  | { type: 'token'; token: string }
  | { type: 'error'; message: string }
  | { type: 'notification'; info: PushNotificationInfo }

export const initialPushState: PushState = { status: 'idle', token: '', error: '', last: null }

export function pushReducer(state: PushState, event: PushEvent): PushState {
  switch (event.type) {
    case 'unsupported':
      return { ...state, status: 'unsupported' }
    case 'permission':
      // "prompt" = l'utente non ha ancora deciso: lo trattiamo come rifiuto (non registriamo nulla).
      return event.permission === 'granted' ? { ...state, status: 'registering' } : { ...state, status: 'denied' }
    case 'token':
      return { ...state, status: 'registered', token: event.token, error: '' }
    case 'error':
      return { ...state, status: 'error', error: event.message }
    case 'notification':
      return { ...state, last: event.info }
  }
}
