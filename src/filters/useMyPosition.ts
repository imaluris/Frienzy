import { useCallback, useState } from 'react'
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
  return { state, ask }
}
