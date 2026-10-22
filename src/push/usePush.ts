import { useCallback, useEffect, useReducer } from 'react'
import { initialPushState, pushReducer } from './pushState'
import type { PushService } from './pushService'

// Collega il servizio notifiche allo stato. `enable` va chiamato da un gesto dell'utente (pulsante).
export function usePush(push: PushService) {
  const [state, dispatch] = useReducer(pushReducer, initialPushState)

  // Ascolta token, errori e notifiche finché la schermata è aperta.
  useEffect(() => {
    if (!push.isSupported()) {
      dispatch({ type: 'unsupported' })
      return
    }
    const offs = [
      push.onToken((token) => dispatch({ type: 'token', token })),
      push.onError((message) => dispatch({ type: 'error', message })),
      push.onNotification((info) => dispatch({ type: 'notification', info })),
    ]
    return () => offs.forEach((off) => off())
  }, [push])

  const enable = useCallback(async () => {
    try {
      const permission = await push.requestPermission()
      dispatch({ type: 'permission', permission })
      if (permission === 'granted') await push.register()
    } catch (e) {
      dispatch({ type: 'error', message: e instanceof Error ? e.message : 'Errore notifiche' })
    }
  }, [push])

  return { state, enable }
}
