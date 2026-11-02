import type { CapacitorConfig } from '@capacitor/cli'
import { appConfig } from './src/config/app'

// Nome e appId vengono dall'unico file di configurazione dell'app.
const config: CapacitorConfig = {
  appId: appConfig.appId,
  appName: appConfig.name,
  webDir: 'dist',
  plugins: {
    // Barra di stato color crema (come la testata dell'app) con icone scure.
    StatusBar: { style: 'LIGHT', backgroundColor: appConfig.colors.background },
  },
}

export default config
