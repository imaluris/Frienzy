# Giorno 2 – Modello e livello dati

**Lettura scelta:** il "repository" è un'interfaccia TypeScript (un contratto) con due implementazioni possibili: una in memoria (oggi, per i test) e una Firebase (task 3). Le date nel codice sono oggetti `Date`; la conversione verso Firestore la farà l'implementazione Firebase.

## Perché queste scelte
- **Interfacce (repository)**: il resto dell'app chiede "salva questo utente" senza sapere dove finisce. Così i test girano senza internet e si può cambiare database senza toccare le schermate.
- **Implementazione in memoria**: usa una `Map` (dizionario chiave → valore). Veloce, nessuna configurazione.
- **Copie difensive**: quando salviamo o restituiamo un oggetto ne facciamo una copia (`{ ...x }`). Altrimenti chi riceve l'oggetto potrebbe modificarlo e cambiare "di nascosto" i dati salvati, cosa che con un vero database non succede.
- **Id e orologio iniettati**: `newId` e `now` sono parametri del costruttore con un valore di default. Nei test passo valori fissi (`() => 'e1'`) e ottengo risultati prevedibili.

## Il codice, pezzo per pezzo
- `src/domain/eventTypes.ts` → lista dei tipi con `as const`; da lì `EventTypeId` ricava il tipo "uno di questi 7 testi". `isEventTypeId` è un *type guard*: dopo `if (isEventTypeId(x))` TypeScript sa che `x` è valido. Gli stessi id servono per gli interessi del profilo.
- `src/domain/user.ts`, `event.ts`, `participation.ts` → la forma dei dati. `NewEvent = Omit<FrienzyEvent, 'id' | 'stato' | 'creatoIl'>` significa "come un evento, ma senza i campi che assegna il repository". `ExactPlace` è il luogo esatto, tenuto separato perché avrà regole di lettura diverse.
- `src/data/*Repository.ts` → le tre interfacce. Ogni metodo è `async` (restituisce una `Promise`) perché Firebase lo sarà.
- `src/data/memory/*` → le implementazioni. `MemoryParticipationRepository` usa la chiave `eventId/uid`: stessa idea del percorso Firestore e impedisce due iscrizioni dello stesso utente.
- `memory.test.ts` e `eventTypes.test.ts` → 14 test su creazione, lettura, elenco, errori e isolamento delle copie.

## Errori incontrati
Nessuno: build, lint e test sono passati al primo giro.

## Esercizio
In `memory.test.ts` aggiungi un test che verifica che `MemoryEventRepository.list()` restituisca un array vuoto su un repository nuovo. Poi prova a rompere la copia difensiva (togli `{ ...found }` in `getById`) e guarda quale test fallisce.
