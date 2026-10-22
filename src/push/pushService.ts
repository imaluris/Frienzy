// Interfaccia del servizio notifiche: l'app non sa se dietro c'è Capacitor o un finto per i test.
export type PushPermission = 'granted' | 'denied' | 'prompt'

export interface PushNotificationInfo {
  title: string
  body: string
}

export interface PushService {
  /** true solo dentro l'app nativa (nel browser le notifiche push native non esistono). */
  isSupported(): boolean
  /** Chiede il permesso all'utente e restituisce la risposta. */
  requestPermission(): Promise<PushPermission>
  /** Si registra presso il sistema operativo: il token arriva poi tramite `onToken`. */
  register(): Promise<void>
  onToken(listener: (token: string) => void): () => void
  onError(listener: (message: string) => void): () => void
  onNotification(listener: (info: PushNotificationInfo) => void): () => void
}
