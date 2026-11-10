import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { db, loadContact, sendTo } from './admin'
import { inviteTargets, type InviteCandidate } from './logic/invites'
import { inviteMessage } from './logic/messages'
import { tokensFor } from './logic/recipients'
import { toEvent } from './remindersJob'

// Evento nuovo → invito a chi ha gli inviti accesi, interessi in comune e zona vicina.
// Prima restringo con i primi 4 caratteri del geohash (cella ~20 km), poi la logica pura controlla il raggio.
// Serve l'esenzione dell'indice per la collection group "notifiche" sul campo `zona` (vedi docs/giorno-40).
export const inviteNearby = onDocumentCreated('events/{eventId}', async (trigger) => {
  const data = trigger.data?.data()
  if (!data || data.stato !== 'aperto') return
  const ev = toEvent(trigger.params.eventId, data)
  const prefix = ev.geohash.slice(0, 4)
  const near = await db.collectionGroup('notifiche').where('zona', '>=', prefix).where('zona', '<=', `${prefix}`).get()
  const uids = near.docs.map((d) => d.ref.parent.parent?.id).filter((id): id is string => !!id && id !== ev.organizzatoreId)

  const excluded = await loadExcluded(ev.id, ev.organizzatoreId, uids)
  const candidates: InviteCandidate[] = []
  for (const uid of uids) {
    if (excluded.has(uid)) continue
    const [contact, profile] = await Promise.all([loadContact(uid), db.doc(`users/${uid}`).get()])
    candidates.push({ ...contact, interessi: (profile.data()?.interessi as string[] | undefined) ?? [], zona: String(contact.device.zona ?? '') })
  }
  const targets = inviteTargets({ event: ev, candidates, excluded })
  await sendTo(tokensFor(targets, 'inviti'), inviteMessage(ev))
})

/** Chi non va invitato: già iscritti e bloccati in un senso o nell'altro rispetto all'organizzatore. */
async function loadExcluded(eventId: string, organizerId: string, uids: string[]): Promise<Set<string>> {
  const out = new Set<string>()
  const people = await db.collection(`events/${eventId}/partecipanti`).get()
  people.docs.forEach((p) => out.add(p.id))
  const [byOrg, ofOrg] = await Promise.all([
    db.collection('blocchi').where('blockerId', '==', organizerId).get(),
    db.collection('blocchi').where('blockedId', '==', organizerId).get(),
  ])
  byOrg.docs.forEach((d) => out.add(String(d.data().blockedId)))
  ofOrg.docs.forEach((d) => out.add(String(d.data().blockerId)))
  return new Set([...out].filter((id) => uids.includes(id)))
}
