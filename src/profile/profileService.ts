import type { UserRepository } from '../data/userRepository'
import type { UserProfile } from '../domain/user'
import type { EventTypeId } from '../domain/eventTypes'
import { parseBirthDate } from './age'
import { validateProfile, type ProfileInput } from './validation'

/** Convalida e salva il profilo. Lancia un Error con il messaggio da mostrare se i dati non vanno bene. */
export async function saveProfile(
  users: UserRepository,
  uid: string,
  input: ProfileInput,
  today: Date = new Date(),
): Promise<UserProfile> {
  const problem = validateProfile(input, today)
  if (problem) throw new Error(problem)
  // Se il profilo esiste già, si conserva la data di creazione originale.
  const existing = await users.getById(uid)
  const profile: UserProfile = {
    uid,
    nome: input.nome.trim(),
    dataNascita: parseBirthDate(input.dataNascita) as Date, // già verificata da validateProfile
    bio: input.bio.trim(),
    interessi: input.interessi as EventTypeId[], // già verificati da validateProfile
    fotoUrl: input.fotoUrl,
    creatoIl: existing?.creatoIl ?? today,
  }
  await users.save(profile)
  return profile
}

/** Il contrario: dal profilo salvato ai valori da mettere nel form. */
export function toProfileInput(profile: UserProfile): ProfileInput {
  return {
    nome: profile.nome,
    dataNascita: profile.dataNascita.toISOString().slice(0, 10),
    bio: profile.bio,
    interessi: [...profile.interessi],
    fotoUrl: profile.fotoUrl,
  }
}
