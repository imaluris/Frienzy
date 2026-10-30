import type { ParticipationRepository } from '../data/participationRepository'
import type { UserRepository } from '../data/userRepository'
import type { FrienzyEvent } from '../domain/event'

/** Chi c'è a un evento, in forma compatta per le schede dell'elenco. */
export interface Attendance {
  /** Nomi di organizzatore (per primo) e confermati che hanno un profilo: servono agli avatar. */
  names: string[]
  /** Quanti posti sono occupati (i confermati; l'organizzatore non occupa un posto). */
  confirmed: number
}

/** Carica la presenza per un evento. Un profilo mancante non rompe nulla: quella persona resta solo contata. */
export async function loadAttendance(
  participations: Pick<ParticipationRepository, 'listConfirmed'>,
  users: Pick<UserRepository, 'getById'>,
  event: FrienzyEvent,
): Promise<Attendance> {
  const confirmed = await participations.listConfirmed(event.id)
  const uids = [event.organizzatoreId, ...confirmed.map((p) => p.uid)]
  const profiles = await Promise.all(uids.map((uid) => users.getById(uid)))
  return { names: profiles.flatMap((p) => (p ? [p.nome] : [])), confirmed: confirmed.length }
}
