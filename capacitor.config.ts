import type { CapacitorConfig } from '@capacitor/cli'
import { appConfig } from './src/config/app'

// Nome e appId vengono dall'unico file di configurazione dell'app.
const config: CapacitorConfig = {
  appId: appConfig.appId,
  appName: appConfig.name,
  webDir: 'dist',
}

export default config
