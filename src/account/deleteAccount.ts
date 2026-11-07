import type { Services } from '../firebase/createServices'
import { cancelEvent } from '../events/cancelEvent'
import { planDeletion } from './deletionPlan'

/**
 * Le fasi, nell'ordine in cui avvengono. L'ordine è importante:
 *  1. password: si controlla per prima, così se è sbagliata non si è toccato nulla;
 *  2-4. messaggi, eventi, iscrizioni: finché si è ancora iscritti/organizzatori le regole lo permettono;
 *  5-6. salvati e blocchi (dati solo miei); 7. profilo;
 *  8. account di accesso per ULTIMO: dopo non si è più autorizzati a scrivere su Firestore.
 */
export const DELETION_STEPS = ['password', 'messaggi', 'eventi', 'iscrizioni', 'salvati', 'blocchi', 'profilo', 'account'] as const
export type DeletionStep = (typeof DELETION_STEPS)[number]

/** Errore con la fase in cui è avvenuto; `cause` è l'errore originale (serve per tradurre quelli di accesso). */
export class AccountDeletionError extends Error {
  constructor(readonly step: DeletionStep, readonly cause: unknown) {
    super(`Eliminazione interrotta alla fase "${step}"`)
  }
}

type Ports = Pick<Services, 'auth' | 'users' | 'events' | 'participations' | 'chat' | 'saved' | 'blocks'>

/** Eventi futuri che verrebbero annullati: serve alla finestra di conferma ("Verranno annullati N eventi"). */
export async function countEventsToCancel(services: Pick<Ports, 'events' | 'auth'>, now: Date = new Date()): Promise<number> {
  const uid = services.auth.currentUid()
  if (!uid) return 0
  const plan = planDeletion({ uid, events: await services.events.list(), participations: [], now })
  return plan.eventsToCancel.length
}

/**
 * Elimina l'account di chi è collegato: profilo, iscrizioni, messaggi propri, salvati, blocchi, e per ultimo l'accesso.
 * Gli eventi organizzati e futuri vengono annullati. Se una fase fallisce lancia AccountDeletionError e si ferma:
 * le fasi già fatte restano fatte e riprovare riparte da dove serve.
 */
export async function deleteAccount(services: Ports, password: string, now: Date = new Date(), onStep: (step: DeletionStep) => void = () => {}): Promise<void> {
  const uid = services.auth.currentUid()
  if (!uid) throw new AccountDeletionError('password', new Error('Nessun utente collegato'))
  let current: DeletionStep = 'password'
  const run = async (step: DeletionStep, action: () => Promise<unknown>) => {
    current = step
    onStep(step)
    try { await action() } catch (e) { throw new AccountDeletionError(current, e) }
  }

  await run('password', () => services.auth.reauthenticate(password))
  const plan = planDeletion({ uid, events: await services.events.list(), participations: await services.participations.listByUser(uid), now })
  await run('messaggi', () => Promise.all(plan.chatEventIds.map((id) => services.chat.removeOwn(id, uid))))
  await run('eventi', () => Promise.all(plan.eventsToCancel.map((id) => cancelEvent(services.events, id, uid))))
  await run('iscrizioni', async () => { for (const id of plan.withdrawEventIds) await services.participations.withdraw(id, uid) })
  await run('salvati', () => services.saved.clear(uid))
  await run('blocchi', () => services.blocks.unblockAll(uid))
  await run('profilo', () => services.users.delete(uid))
  await run('account', () => services.auth.deleteAccount())
}
