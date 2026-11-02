import { Capacitor } from '@capacitor/core'
import { appConfig } from '../config/app'

// Sul telefono: barra di stato color crema con icone scure, come la testata dell'app. Sul web non fa nulla.
export async function configureStatusBar(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    await StatusBar.setStyle({ style: Style.Light })
    await StatusBar.setBackgroundColor({ color: appConfig.colors.background })
  } catch {
    // Alcune versioni di Android gestiscono la barra da sole: va bene così.
  }
}
