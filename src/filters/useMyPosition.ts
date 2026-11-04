import { useCallback, useEffect, useState } from 'react'
import type { LatLng } from '../events/geohashDecode'

export type PositionState = { status: 'idle' | 'asking' | 'denied' | 'unsupported' } | { status: 'ok'; point: LatLng }

/** Chiede la posizione al dispositivo SOLO quando si chiama `ask()`. Serve a calcolare le distanze, non viene salvata. */
export function useMyPosition() {
  const [state, setState] = useState<PositionState>({ status: 'idle' })
  const ask = useCallback(() => {
    if (!('geolocation' in navigator)) return setState({ status: 'unsupported' })
    setState({ status: 'asking' })
    navigator.geolocation.getCurrentPosition(
      (pos) => setState({ status: 'ok', point: { lat: pos.coords.latitude, lng: pos.coords.longitude } }),
      () => setState({ status: 'denied' }),
    )
  }, [])

  // Se il permesso è già stato dato in passato la posizione si legge da sola (nessuna finestra di richiesta);
  // altrimenti si aspetta che l'utente la chieda.
  useEffect(() => {
    if (!('permissions' in navigator)) return
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((status) => status.state === 'granted' && ask())
      .catch(() => undefined)
  }, [ask])

  return { state, ask }
}
