import { Capacitor } from '@capacitor/core'

export type HapticKind = 'tap' | 'success' | 'warning'

// Vibrazione leggera sul telefono (plugin Capacitor Haptics). Sul web, o se il plugin dà errore, non fa nulla:
// la vibrazione è un di più, mai una condizione perché l'azione riesca.
export async function haptic(kind: HapticKind): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  try {
    const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics')
    if (kind === 'tap') await Haptics.impact({ style: ImpactStyle.Light })
    else await Haptics.notification({ type: kind === 'success' ? NotificationType.Success : NotificationType.Warning })
  } catch {
    // ignorato di proposito
  }
}
