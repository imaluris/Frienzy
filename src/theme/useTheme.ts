import { useSyncExternalStore } from 'react'
import { getChoice, getMode, setChoice, subscribe } from './store'

export function useTheme() {
  const choice = useSyncExternalStore(subscribe, getChoice)
  const mode = useSyncExternalStore(subscribe, getMode)
  return { choice, mode, setChoice }
}
