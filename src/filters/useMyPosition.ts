import { useCallback, useEffect, useState } from 'react'
import type { LatLng } from '../events/geohashDecode'
import { isNativeApp, nativePermissionGranted, readNativePosition, type NativeResult } from './nativePosition'

export type PositionState =
  | { status: 'idle' | 'asking' | 'denied' | 'unsupported' | 'settings' | 'services' }
  | { status: 'unavailable'; detail?: string }
  | { status: 'ok'; point: LatLng }

const fromNative = (r: NativeResult): PositionState =>
  r.kind === 'ok' ? { status: 'ok', point: r.point } : r.kind === 'unavailable' ? { status: 'unavailable', detail: r.detail } : { status: r.kind }

/** Chiede la posizione al dispositivo (app installata o browser) e restituisce com'è andata. */
export function requestPosition(): Promise<PositionState> {
  if (isNativeApp()) return readNativePosition().then(fromNative)
  if (!('geolocation' in navigator)) return Promise.resolve({ status: 'unsupported' })
  return new Promise((resolve) =>
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ status: 'ok', point: { lat: pos.coords.latitude, lng: pos.coords.longitude } }),
      () => resolve({ status: 'denied' }),
    ),
  )
}

/** Chiede la posizione al dispositivo SOLO quando si chiama `ask()`. Serve a calcolare le distanze, non viene salvata. */
export function useMyPosition() {
  const [state, setState] = useState<PositionState>({ status: 'idle' })
  const ask = useCallback(() => {
    setState({ status: 'asking' })
    void requestPosition().then(setState)
  }, [])

  // Se il permesso è già stato dato in passato la posizione si legge da sola (nessuna finestra di richiesta);
  // altrimenti si aspetta che l'utente la chieda.
  useEffect(() => {
    if (isNativeApp()) {
      void nativePermissionGranted().then((granted) => granted && ask())
      return
    }
    if (!('permissions' in navigator)) return
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((status) => status.state === 'granted' && ask())
      .catch(() => undefined)
  }, [ask])

  return { state, ask }
}
