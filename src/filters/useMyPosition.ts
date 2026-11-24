import { useCallback, useEffect, useState } from 'react'
import type { LatLng } from '../events/geohashDecode'
import { isNativeApp, nativePermissionGranted, readNativePosition, type NativeResult } from './nativePosition'

export type PositionState =
  | { status: 'idle' | 'asking' | 'denied' | 'unsupported' | 'settings' | 'services' }
  | { status: 'ok'; point: LatLng }

const fromNative = (r: NativeResult): PositionState =>
  r.kind === 'ok' ? { status: 'ok', point: r.point } : { status: r.kind === 'error' ? 'denied' : r.kind }

/** Chiede la posizione al dispositivo SOLO quando si chiama `ask()`. Serve a calcolare le distanze, non viene salvata. */
export function useMyPosition() {
  const [state, setState] = useState<PositionState>({ status: 'idle' })
  const ask = useCallback(() => {
    setState({ status: 'asking' })
    if (isNativeApp()) {
      void readNativePosition().then((r) => setState(fromNative(r)))
      return
    }
    if (!('geolocation' in navigator)) return setState({ status: 'unsupported' })
    navigator.geolocation.getCurrentPosition(
      (pos) => setState({ status: 'ok', point: { lat: pos.coords.latitude, lng: pos.coords.longitude } }),
      () => setState({ status: 'denied' }),
    )
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
