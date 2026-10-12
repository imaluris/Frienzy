import { useCallback, useEffect, useState } from 'react'
import type { UserRepository } from '../data/userRepository'
import type { UserProfile } from '../domain/user'

// Carica il profilo di `uid`. `loading` è true finché non sappiamo se esiste.
export function useProfile(users: UserRepository, uid: string) {
  const [state, setState] = useState<{ loading: boolean; profile: UserProfile | null }>({
    loading: true,
    profile: null,
  })

  useEffect(() => {
    let cancelled = false
    void users.getById(uid).then((profile) => {
      if (!cancelled) setState({ loading: false, profile })
    })
    return () => {
      cancelled = true // se lo schermo cambia prima della risposta, la ignoriamo
    }
  }, [users, uid])

  const setProfile = useCallback((profile: UserProfile) => setState({ loading: false, profile }), [])
  return { ...state, setProfile }
}
