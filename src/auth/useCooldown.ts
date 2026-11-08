import { useEffect, useState } from 'react'
import { resendWaitSeconds } from './emailActions'

/** Conto alla rovescia per "Invia di nuovo": `start()` quando si invia, `seconds` i secondi che mancano. */
export function useCooldown() {
  const [lastSent, setLastSent] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (lastSent === null) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [lastSent])
  return { seconds: resendWaitSeconds(lastSent, now), start: () => { setLastSent(Date.now()); setNow(Date.now()) } }
}
