import { Capacitor } from '@capacitor/core'
import { Geolocation } from '@capacitor/geolocation'
import { AndroidSettings, IOSSettings, NativeSettings } from 'capacitor-native-settings'
import type { LatLng } from '../events/geohashDecode'

// Posizione sull'app installata (Capacitor). Nel browser si usa invece navigator.geolocation (vedi useMyPosition).

/** Esito di una richiesta di posizione sul telefono. */
export type NativeResult =
  | { kind: 'ok'; point: LatLng }
  | { kind: 'denied' }    // l'utente ha appena rifiutato la richiesta del telefono
  | { kind: 'settings' }  // permesso bloccato: ho aperto le impostazioni dell'app
  | { kind: 'services' }  // la posizione del telefono è spenta: ho aperto le impostazioni di sistema
  | { kind: 'error' }

export const isNativeApp = () => Capacitor.isNativePlatform()

function openAppSettings() {
  return NativeSettings.open({ optionAndroid: AndroidSettings.ApplicationDetails, optionIOS: IOSSettings.App })
}

function openLocationSettings() {
  return NativeSettings.open({ optionAndroid: AndroidSettings.Location, optionIOS: IOSSettings.App })
}

const isGranted = (s: { location: string; coarseLocation: string }) => s.location === 'granted' || s.coarseLocation === 'granted'

/** True se il permesso è già stato dato (nessuna finestra di richiesta). */
export async function nativePermissionGranted(): Promise<boolean> {
  try { return isGranted(await Geolocation.checkPermissions()) } catch { return false }
}

/**
 * Chiede il permesso se serve e legge la posizione.
 * - mai chiesto: compare la richiesta del telefono;
 * - rifiutato in modo definitivo: la richiesta non può più comparire, quindi si aprono le impostazioni dell'app;
 * - posizione del telefono spenta: si aprono le impostazioni di sistema.
 */
export async function readNativePosition(): Promise<NativeResult> {
  try {
    let status = await Geolocation.checkPermissions()
    if (status.location === 'prompt' || status.location === 'prompt-with-rationale') {
      status = await Geolocation.requestPermissions()
      if (!isGranted(status)) return { kind: 'denied' }
    }
    if (!isGranted(status)) {
      await openAppSettings()
      return { kind: 'settings' }
    }
    const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: false, timeout: 10000 })
    return { kind: 'ok', point: { lat: pos.coords.latitude, lng: pos.coords.longitude } }
  } catch (e) {
    if (/location services/i.test(e instanceof Error ? e.message : String(e))) {
      await openLocationSettings().catch(() => undefined)
      return { kind: 'services' }
    }
    return { kind: 'error' }
  }
}
