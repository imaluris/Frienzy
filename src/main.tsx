import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { applyTheme } from './config/theme'
import type { Services } from './firebase/createServices'
import '@fontsource-variable/nunito/wght.css'
import './styles.css'

applyTheme(document.documentElement)

// Con VITE_DEMO=1 l'app parte con servizi in memoria e dati d'esempio (nessun Firebase).
// Gli import sono dinamici: nella modalità demo il codice Firebase non viene nemmeno eseguito.
async function chooseServices(): Promise<Services> {
  if (import.meta.env.VITE_DEMO === '1') {
    return (await import('./demo/createDemoServices')).createDemoServices()
  }
  return (await import('./firebase/createServices')).createFirebaseServices()
}

void chooseServices().then((services) => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App services={services} />
    </StrictMode>,
  )
})
