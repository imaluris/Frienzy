import type { UserProfile } from '../domain/user'

// Identificativi fissi: servono alle iscrizioni d'esempio e agli screenshot.
export const DEMO_UID = 'demo-io'

function birth(anniFa: number): Date {
  const d = new Date()
  return new Date(d.getFullYear() - anniFa, 3, 12)
}

// Persone inventate per la modalità demo (nessun dato reale).
export const DEMO_PROFILES: UserProfile[] = [
  { uid: DEMO_UID, nome: 'Andrea', dataNascita: birth(29), bio: 'Amo le passeggiate e il buon caffè.', interessi: ['passeggiata', 'aperitivo', 'mostra'], fotoUrl: '', creatoIl: new Date() },
  { uid: 'demo-giulia', nome: 'Giulia', dataNascita: birth(27), bio: 'Organizzo aperitivi in riva al fiume.', interessi: ['aperitivo', 'cena'], fotoUrl: '', creatoIl: new Date() },
  { uid: 'demo-marco', nome: 'Marco', dataNascita: birth(34), bio: 'Trekking ogni weekend.', interessi: ['trekking', 'sport'], fotoUrl: '', creatoIl: new Date() },
  { uid: 'demo-sara', nome: 'Sara', dataNascita: birth(31), bio: 'Musei, mostre e cene tra amici.', interessi: ['mostra', 'cena'], fotoUrl: '', creatoIl: new Date() },
  { uid: 'demo-luca', nome: 'Luca', dataNascita: birth(25), bio: 'Calcetto il giovedì sera.', interessi: ['sport', 'altro'], fotoUrl: '', creatoIl: new Date() },
]
