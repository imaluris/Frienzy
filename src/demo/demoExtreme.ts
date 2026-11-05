import type { UserProfile } from '../domain/user'
import type { DemoEventSpec } from './demoEvents'

// Dati al limite per la revisione grafica (solo con VITE_DEMO_EXTREME=1): titolo lunghissimo, zona lunghissima,
// 30 posti quasi tutti presi, nomi lunghi. Servono a vedere se le schermate reggono testi e numeri estremi.
const NAMES = ['Alessandra Maria Concetta De Santis Ferretti', 'Bo', 'Chiara', 'Dario', 'Elena', 'Fabio', 'Greta', 'Hugo', 'Irene', 'Jacopo']

export const EXTREME_PROFILES: UserProfile[] = Array.from({ length: 28 }, (_, i) => ({
  uid: `extreme-${i}`,
  nome: NAMES[i % NAMES.length] + (i >= NAMES.length ? ` ${i}` : ''),
  dataNascita: new Date(new Date().getFullYear() - (20 + (i % 30)), 5, 3),
  bio: i === 0 ? 'Una biografia molto lunga '.repeat(8).trim() : '',
  interessi: ['aperitivo'],
  fotoUrl: '',
  creatoIl: new Date(),
}))

export const EXTREME_SPEC: DemoEventSpec = {
  tipo: 'aperitivo',
  titolo: 'Grande aperitivo di benvenuto per tutti i nuovi amici del quartiere',
  descrizione: 'Una descrizione molto lunga che continua per più righe. '.repeat(6).trim(),
  giorni: 1, ora: 19,
  zona: 'Quartiere Isola, tra Porta Garibaldi, Via Borsieri e il Bosco Verticale, Milano',
  lat: 45.4894, lng: 9.1911, indirizzo: 'Via Pastrengo 5, scala B, interno 12, citofono Rossi-Bianchi',
  max: 30, approvazione: false, organizzatore: 'extreme-0', confermati: EXTREME_PROFILES.slice(1).map((p) => p.uid),
}
