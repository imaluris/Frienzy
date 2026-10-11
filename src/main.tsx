import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { applyTheme } from './config/theme'
import { createFirebaseServices } from './firebase/createServices'
import './styles.css'

applyTheme(document.documentElement)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App services={createFirebaseServices()} />
  </StrictMode>,
)
