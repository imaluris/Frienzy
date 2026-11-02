import { appConfig } from '../config/app'
import { LogoMark } from './LogoMark'

// Schermata di avvio web: stesso aspetto della splash Android (fondo terracotta, marchio, nome) finché si controlla l'accesso.
export function BrandSplash() {
  return (
    <main className="brand-splash" aria-busy="true" aria-label="Caricamento">
      <LogoMark size={128} tone="brand" />
      <h1>{appConfig.name}</h1>
    </main>
  )
}
