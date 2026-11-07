import { useEffect, useState } from 'react'
import { useServices } from '../app/ServicesContext'
import { useToast } from '../feedback/ToastContext'
import { useBlocks } from '../safety/BlocksContext'
import { Avatar } from '../ui/Avatar'
import { BottomSheet } from '../ui/BottomSheet'

// Elenco delle persone bloccate, con "Sblocca". I nomi si leggono dai profili (chi non ha profilo è "Utente").
export function BlockedSheet({ onClose }: { onClose: () => void }) {
  const { users } = useServices()
  const { blockedByMe, unblock } = useBlocks()
  const { show } = useToast()
  const [names, setNames] = useState<Record<string, string>>({})

  useEffect(() => {
    let active = true
    void Promise.all(blockedByMe.map(async (id) => [id, (await users.getById(id).catch(() => null))?.nome ?? 'Utente'] as const)).then((pairs) => {
      if (active) setNames(Object.fromEntries(pairs))
    })
    return () => { active = false }
  }, [blockedByMe, users])

  async function release(uid: string) {
    try {
      await unblock(uid)
      show(`Hai sbloccato ${names[uid] ?? 'Utente'}`)
    } catch {
      show('Non sono riuscito a sbloccare, riprova', 'warning')
    }
  }

  return (
    <BottomSheet title="Utenti bloccati" onClose={onClose}>
      {blockedByMe.length === 0 && <p className="sheet-text">Non hai bloccato nessuno.</p>}
      <ul className="menu-list">
        {blockedByMe.map((uid) => (
          <li key={uid} className="blocked-row">
            <Avatar name={names[uid] ?? 'Utente'} size="sm" />
            <strong>{names[uid] ?? 'Utente'}</strong>
            <button type="button" className="secondary" onClick={() => void release(uid)}>Sblocca</button>
          </li>
        ))}
      </ul>
    </BottomSheet>
  )
}
