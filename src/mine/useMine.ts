import { useCallback, useEffect, useState } from 'react'
import type { Services } from '../firebase/createServices'
import { loadMine } from './loadMine'
import type { Mine } from './buildMine'

const EMPTY: Mine = { organized: [], joined: [] }

/** Carica le mie liste; `reload` le rilegge dopo un annullamento o un ritiro. */
export function useMine(services: Services, uid: string) {
  const [state, setState] = useState<{ loading: boolean; failed: boolean; mine: Mine }>({ loading: true, failed: false, mine: EMPTY })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let active = true
    loadMine(services.events, services.participations, uid)
      .then((mine) => active && setState({ loading: false, failed: false, mine }))
      .catch(() => active && setState({ loading: false, failed: true, mine: EMPTY }))
    return () => {
      active = false
    }
  }, [services, uid, version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])
  return { ...state, reload }
}
