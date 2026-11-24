import { beforeEach, describe, expect, it, vi } from 'vitest'

const geo = vi.hoisted(() => ({
  checkPermissions: vi.fn(),
  requestPermissions: vi.fn(),
  getCurrentPosition: vi.fn(),
}))
const settings = vi.hoisted(() => ({ open: vi.fn().mockResolvedValue({ status: true }) }))

vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => true } }))
vi.mock('@capacitor/geolocation', () => ({ Geolocation: geo }))
vi.mock('capacitor-native-settings', () => ({
  NativeSettings: settings,
  AndroidSettings: { ApplicationDetails: 'application_details', Location: 'location' },
  IOSSettings: { App: 'app' },
}))

import { readNativePosition } from './nativePosition'

const perm = (location: string) => ({ location, coarseLocation: location })
const fix = { coords: { latitude: 45.46, longitude: 9.19 } }

describe('posizione sull\'app installata', () => {
  beforeEach(() => { vi.clearAllMocks(); settings.open.mockResolvedValue({ status: true }) })

  it('permesso già dato: legge la posizione senza chiedere nulla', async () => {
    geo.checkPermissions.mockResolvedValue(perm('granted'))
    geo.getCurrentPosition.mockResolvedValue(fix)
    expect(await readNativePosition()).toEqual({ kind: 'ok', point: { lat: 45.46, lng: 9.19 } })
    expect(geo.requestPermissions).not.toHaveBeenCalled()
    expect(settings.open).not.toHaveBeenCalled()
  })

  it('mai chiesto: compare la richiesta del telefono e, se accettata, legge la posizione', async () => {
    geo.checkPermissions.mockResolvedValue(perm('prompt'))
    geo.requestPermissions.mockResolvedValue(perm('granted'))
    geo.getCurrentPosition.mockResolvedValue(fix)
    expect((await readNativePosition()).kind).toBe('ok')
    expect(settings.open).not.toHaveBeenCalled()
  })

  it('rifiutato adesso: nessuna impostazione aperta, si riprova al tocco successivo', async () => {
    geo.checkPermissions.mockResolvedValue(perm('prompt'))
    geo.requestPermissions.mockResolvedValue(perm('denied'))
    expect(await readNativePosition()).toEqual({ kind: 'denied' })
    expect(settings.open).not.toHaveBeenCalled()
  })

  it('permesso bloccato: apre le impostazioni dell\'app', async () => {
    geo.checkPermissions.mockResolvedValue(perm('denied'))
    expect(await readNativePosition()).toEqual({ kind: 'settings' })
    expect(settings.open).toHaveBeenCalledWith({ optionAndroid: 'application_details', optionIOS: 'app' })
    expect(geo.requestPermissions).not.toHaveBeenCalled()
  })

  it('posizione del telefono spenta: apre le impostazioni di sistema', async () => {
    geo.checkPermissions.mockRejectedValue(new Error('Location services are not enabled'))
    expect(await readNativePosition()).toEqual({ kind: 'services' })
    expect(settings.open).toHaveBeenCalledWith({ optionAndroid: 'location', optionIOS: 'app' })
  })

  it('altro errore (per esempio tempo scaduto): nessuna impostazione aperta', async () => {
    geo.checkPermissions.mockResolvedValue(perm('granted'))
    geo.getCurrentPosition.mockRejectedValue(new Error('Timeout expired'))
    expect(await readNativePosition()).toEqual({ kind: 'error' })
    expect(settings.open).not.toHaveBeenCalled()
  })
})
