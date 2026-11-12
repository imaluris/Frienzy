import { Capacitor } from '@capacitor/core'
import { PALETTES, type ThemeMode } from '../theme/palettes'

// Sul telefono: barra di stato dello stesso colore della testata (crema o marrone scuro), icone a contrasto. Sul web non fa nulla.
export async function configureStatusBar(mode: ThemeMode = 'chiaro'): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    // Style.Light = icone scure (sfondo chiaro); Style.Dark = icone chiare (sfondo scuro).
    await StatusBar.setStyle({ style: mode === 'scuro' ? Style.Dark : Style.Light })
    await StatusBar.setBackgroundColor({ color: PALETTES[mode].themeBar })
  } catch {
    // Alcune versioni di Android gestiscono la barra da sole: va bene così.
  }
}
