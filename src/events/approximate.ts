// Posizione approssimata: quella che vedono tutti. Due decimali ≈ 1 km.

const DECIMALS = 2

export function approximateCoordinate(value: number): number {
  const factor = 10 ** DECIMALS
  return Math.round(value * factor) / factor
}
