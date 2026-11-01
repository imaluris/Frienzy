import { Icon } from '../ui/Icon'

// Passo 4: spiega a cosa serve la posizione PRIMA che compaia la richiesta del telefono.
export function StepLocation() {
  return (
    <>
      <div className="location-art" aria-hidden="true">
        <span className="location-ring ring-a" />
        <span className="location-ring ring-b" />
        <span className="location-pin"><Icon name="navigation" size={32} filled /></span>
      </div>
      <h2 className="step-title centered">Trova uscite vicino a te</h2>
      <p className="step-hint centered">
        Con la posizione possiamo mostrarti quanto sono lontani gli eventi. La usiamo solo mentre l'app è aperta e non la salviamo. Puoi cambiare idea quando vuoi dalle impostazioni del telefono.
      </p>
    </>
  )
}
