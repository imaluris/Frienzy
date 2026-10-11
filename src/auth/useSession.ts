import { useEffect, useState } from 'react'
import type { AuthService } from './authService'

export interface Session {
  /** false finché non sappiamo se qualcuno è già collegato. */
  ready: boolean
  uid: string | null
}

// Segue l'utente collegato: si aggiorna da solo a ogni login/logout.
export function useSession(auth: AuthService): Session {
  const [session, setSession] = useState<Session>({ ready: false, uid: null })
  useEffect(() => auth.onChange((uid) => setSession({ ready: true, uid })), [auth])
  return session
}
