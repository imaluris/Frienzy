import { useEffect, useState } from 'react'
import type { Services } from '../firebase/createServices'
import type { ChatMessage } from './message'

export type ChatStatus = 'loading' | 'ready' | 'denied'

/** Segue la chat in tempo reale e carica i nomi degli autori. `denied` = non hai (più) accesso. */
export function useChat(services: Services, eventId: string, uid: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [status, setStatus] = useState<ChatStatus>('loading')
  const [names, setNames] = useState<Record<string, string>>({})

  useEffect(() => {
    setStatus('loading')
    return services.chat.subscribe(
      eventId,
      uid,
      (list) => { setMessages(list); setStatus('ready') },
      () => setStatus('denied'),
    )
  }, [services, eventId, uid])

  // Per ogni autore nuovo si chiede il nome al profilo; chi non ha profilo resta "Qualcuno".
  useEffect(() => {
    const missing = [...new Set(messages.map((m) => m.authorUid))].filter((id) => !(id in names))
    if (missing.length === 0) return
    let active = true
    void Promise.all(missing.map(async (id) => [id, (await services.users.getById(id).catch(() => null))?.nome ?? 'Qualcuno'] as const)).then((pairs) => {
      if (active) setNames((old) => ({ ...old, ...Object.fromEntries(pairs) }))
    })
    return () => { active = false }
  }, [messages, names, services])

  return { messages, status, names }
}
