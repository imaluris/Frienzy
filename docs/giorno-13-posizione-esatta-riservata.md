# Giorno 13 – Posizione esatta riservata

## Lettura scelta
"Nel repository solo organizzatore e confermati leggono il luogo esatto": l'ho letto come un nuovo metodo `getExactPlace(eventId, viewerUid)` dell'interfaccia `EventRepository`, che restituisce `null` a chiunque altro. Ho anche mostrato l'indirizzo nel dettaglio, ma solo se il metodo lo restituisce. Le regole di sicurezza (task 6) già vietavano la lettura ai non autorizzati: qui si aggiunge la stessa regola dentro il livello dati.

## Perché queste scelte
- **Regola pura `canSeeExactPlace`** (`src/place/placeAccess.ts`): evento, uid di chi guarda e sua partecipazione → vero/falso. Un'unica definizione, facile da testare, uguale a `isOrganizer || isConfirmed` di `firestore.rules`.
- **`null` e non errore**: chi non può vedere il luogo non deve capire se esiste. Anche su Firestore l'errore `permission-denied` diventa `null`.
- **Il repository in memoria deve conoscere le iscrizioni**: gli viene passata una funzione `findParticipation`. Perché non l'archivio delle iscrizioni direttamente? Perché le iscrizioni già dipendono dagli eventi: due oggetti che si conoscono a vicenda sono un nodo. Una funzione che guarda l'altro oggetto *solo quando serve* spezza il nodo.
- **Senza quella funzione** (`new MemoryEventRepository()`) vede il luogo solo l'organizzatore: il default è il più restrittivo.

## Il codice, pezzo per pezzo
- `canSeeExactPlace`: senza `viewerUid` → no; organizzatore → sì; altrimenti serve una partecipazione *dello stesso utente* con stato `confermato` (controllo `participation.uid === viewerUid`, per non fidarsi di una partecipazione altrui).
- `MemoryEventRepository.getExactPlace`: se evento o luogo mancano → `null`; cerca la partecipazione solo se c'è un utente; applica la regola; restituisce una **copia** del luogo (`{ ...place }`) così nessuno può modificare il dato salvato.
- `createMemoryServices`: crea `events` con la funzione `(eventId, uid) => participations.get(...)`; `participations` esiste già quando la funzione viene chiamata.
- `FirestoreEventRepository.getExactPlace`: legge `events/{id}/privato/luogo`; scritto e compilato, non eseguito. `placeFromData` in `converters.ts` converte il documento.
- `useExactPlace` + riga "Indirizzo" in `EventDetailScreen`.

## Errori incontrati
Il build ha dato `TS7022: 'events' implicitly has type 'any'`: `events` e `participations` si citano a vicenda e TypeScript non riesce a dedurre i tipi. Risolto scrivendo il tipo a mano (`const events: MemoryEventRepository = ...`).

## Esercizio
Nel test "ruoli diversi" aggiungi un utente `diana` che si iscrive e poi viene rifiutata dopo essere stata confermata? Non si può (le decisioni sono definitive, task 11): spiega perché guardando `decideResponse`, poi scrivi il test che lo dimostra.
