import { seatsInfo } from '../events/seats'

// Barra dei posti occupati + frase ("6 posti liberi", "Al completo") e, se pochi, il segnale "Ultimi posti".
export function SeatsMeter({ max, confirmed }: { max: number; confirmed: number }) {
  const seats = seatsInfo(max, confirmed)
  return (
    <span className={`seats seats-${seats.level}`}>
      <span className="seats-bar" aria-hidden="true"><span className="seats-fill" style={{ width: `${Math.round(seats.ratio * 100)}%` }} /></span>
      <span className="seats-label">{seats.level === 'low' ? `Ultimi posti · ${seats.label}` : seats.label}</span>
    </span>
  )
}
