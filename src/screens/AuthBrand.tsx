import { appConfig } from '../config/app'

// Marchio in cima alle schermate di accesso e registrazione.
export function AuthBrand() {
  return (
    <header className="auth-brand">
      <img className="auth-logo" src={appConfig.icon} alt="" />
      <h1 className="brand">{appConfig.name}</h1>
      <p className="auth-tagline">Organizza uscite dal vivo e fai nuove amicizie.</p>
    </header>
  )
}
