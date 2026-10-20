# Giorno 12 – Profili visibili nell'evento

## Lettura scelta
Il task dice "si mostrano organizzatore e partecipanti confermati". L'ho letto così: (1) una funzione pura decide *chi* è visibile; (2) un profilo "pubblico" porta solo ciò che si può mostrare (età, mai la data di nascita); (3) il dettaglio evento mostra l'elenco. La visibilità non dipende da chi guarda: richieste e rifiutati non compaiono per nessuno (nemmeno per l'organizzatore: la gestione delle richieste è un'altra schermata, futura).

## Perché queste scelte
- **Cartella `src/people`**: un posto solo per questa responsabilità, file corti.
- **`visiblePeople` pura**: prende evento e partecipazioni, restituisce uid e ruolo. Niente accesso ai dati, quindi si testa con due righe.
- **`PublicProfile` senza `dataNascita`**: la conversione `toPublicProfile` calcola l'età e butta la data. Se la schermata riceve solo `PublicProfile`, *non può* mostrarla per errore.
- **`listConfirmed` nel repository**: le regole del task 6 lasciano leggere ai non organizzatori solo i confermati, quindi la query Firestore deve filtrare `stato == 'confermato'`. Metterlo nell'interfaccia rende l'unico percorso corretto anche l'unico disponibile.
- **Chi non ha profilo viene saltato**: meglio un elenco più corto che una schermata rotta.

## Il codice, pezzo per pezzo
- `publicProfile.ts`: tipo `PublicProfile` e `toPublicProfile(profile, ruolo, today)`; usa `calculateAge` del task 5. `today` è un parametro per rendere i test indipendenti dall'orologio.
- `visiblePeople.ts`: parte da una lista con l'organizzatore, poi aggiunge i `confermato` saltando chi è già stato visto (un `Set`), così l'organizzatore non compare due volte anche se ha una partecipazione.
- `loadEventPeople.ts`: `listConfirmed` → `visiblePeople` → `getById` per ognuno (in parallelo con `Promise.all`) → `toPublicProfile`. Il `filter` finale con `p is PublicProfile` toglie i `null` e dice a TypeScript che non ce ne sono più.
- `useEventPeople.ts`: hook che chiama il caricamento quando l'evento è pronto. Il flag `active` evita di aggiornare lo stato dopo che la schermata è stata chiusa.
- `EventPeople.tsx`: solo presentazione; non mostra nulla se l'elenco è vuoto.
- Repository: `listConfirmed` in memoria (filtro su `listByEvent`) e in Firestore (`query` con `where('stato', '==', 'confermato')`, scritto e compilato, non eseguito).

## Errori incontrati
Nessuno bloccante. Nota: la query Firestore con `where` su `stato` in una sola sotto-raccolta non richiede indici compositi.

## Esercizio
In `people.test.ts` aggiungi un test: un partecipante con `stato: 'rifiutato'` e un profilo esistente non deve comparire. Poi prova a togliere il `Set` da `visiblePeople` e vedi quale test fallisce: perché l'organizzatore compariva due volte?
