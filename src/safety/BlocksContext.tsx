import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useServices } from '../app/ServicesContext'
import { hiddenUids } from './blocking'

interface BlocksValue {
  /** Persone che ho bloccato. */
  blockedByMe: string[]
  /** Persone da non mostrare: quelle che ho bloccato e quelle che hanno bloccato me. */
  hidden: ReadonlySet<string>
  block: (otherUid: string) => Promise<void>
  unblock: (otherUid: string) => Promise<void>
}

const EMPTY: BlocksValue = { blockedByMe: [], hidden: new Set(), block: async () => {}, unblock: async () => {} }
const BlocksContext = createContext<BlocksValue>(EMPTY)

// Tiene in un posto solo chi è bloccato, così elenco, mappa, dettaglio e profilo restano d'accordo.
export function BlocksProvider({ uid, children }: { uid: string; children: ReactNode }) {
  const { blocks } = useServices()
  const [blockedByMe, setBlockedByMe] = useState<string[]>([])
  const [blockedMe, setBlockedMe] = useState<string[]>([])

  const reload = useCallback(async () => {
    const [mine, theirs] = await Promise.all([blocks.listBlockedBy(uid), blocks.listBlockers(uid)])
    setBlockedByMe(mine)
    setBlockedMe(theirs)
  }, [blocks, uid])

  useEffect(() => {
    void reload().catch(() => undefined) // se la lettura fallisce l'app funziona come senza blocchi
  }, [reload])

  const block = useCallback(async (otherUid: string) => { await blocks.block(uid, otherUid); await reload() }, [blocks, uid, reload])
  const unblock = useCallback(async (otherUid: string) => { await blocks.unblock(uid, otherUid); await reload() }, [blocks, uid, reload])

  const value = useMemo<BlocksValue>(
    () => ({ blockedByMe, hidden: hiddenUids(blockedByMe, blockedMe), block, unblock }),
    [blockedByMe, blockedMe, block, unblock],
  )
  return <BlocksContext.Provider value={value}>{children}</BlocksContext.Provider>
}

/** Senza provider (test dei singoli schermi) nessuno è bloccato. */
export const useBlocks = (): BlocksValue => useContext(BlocksContext)
