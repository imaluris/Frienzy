import type { ParticipationRepository } from '../data/participationRepository'
import type { UserRepository } from '../data/userRepository'
import type { FrienzyEvent } from '../domain/event'
import { withoutBlockedPeople } from '../safety/blocking'
import { toPublicProfile, type PublicProfile } from './publicProfile'
import { visiblePeople } from './visiblePeople'

/** Carica i profili pubblici di organizzatore e confermati. Chi non ha ancora un profilo, e chi è bloccato (`hidden`), viene saltato. */
export async function loadEventPeople(
  users: Pick<UserRepository, 'getById'>,
  participations: Pick<ParticipationRepository, 'listConfirmed'>,
  event: FrienzyEvent,
  today: Date = new Date(),
  hidden: ReadonlySet<string> = new Set(),
): Promise<PublicProfile[]> {
  // Si chiedono solo i confermati: per Firestore è anche l'unica query che le regole permettono a chi non organizza.
  const confirmed = await participations.listConfirmed(event.id)
  const people = withoutBlockedPeople(visiblePeople(event, confirmed), hidden)
  const profiles = await Promise.all(
    people.map(async (person) => {
      const profile = await users.getById(person.uid)
      return profile ? toPublicProfile(profile, person.ruolo, today) : null
    }),
  )
  return profiles.filter((p): p is PublicProfile => p !== null)
}
