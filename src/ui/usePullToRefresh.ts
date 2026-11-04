import { useRef, useState, type TouchEvent } from 'react'
import { dampenPull, PULL_THRESHOLD, shouldRefresh } from './pullState'

/**
 * Tira per aggiornare: attivo solo se la pagina è in cima. Restituisce la tirata corrente,
 * se sta aggiornando e i tre gestori del tocco da mettere sul contenitore.
 */
export function usePullToRefresh(onRefresh: () => Promise<unknown>) {
  const startY = useRef<number | null>(null)
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const onTouchStart = (e: TouchEvent) => {
    startY.current = window.scrollY <= 0 && !refreshing ? e.touches[0].clientY : null
  }
  const onTouchMove = (e: TouchEvent) => {
    if (startY.current === null) return
    const next = dampenPull(e.touches[0].clientY - startY.current)
    // Se il dito risale sotto il punto di partenza o la pagina ha cominciato a scorrere, la tirata si ferma.
    if (next === 0 || window.scrollY > 0) {
      startY.current = null
      return setPull(0)
    }
    setPull(next)
  }
  const onTouchEnd = async () => {
    const wasPulling = startY.current !== null
    startY.current = null
    if (!wasPulling) return setPull(0)
    if (!shouldRefresh(pull)) return setPull(0)
    setPull(PULL_THRESHOLD)
    setRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setRefreshing(false)
      setPull(0)
    }
  }

  return { pull, refreshing, handlers: { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel: onTouchEnd } }
}
