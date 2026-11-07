# Giorno 35: segnala e blocca

**Lettura scelta (nessuno poteva rispondere):** nell'app non esiste una schermata di "profilo altrui": le altre persone si vedono solo nell'elenco "Chi c'è" del dettaglio evento. Quindi la voce di menu "profilo altrui" è stata messa lì, con un pulsante a tre puntini accanto a ogni persona (tranne te). Nel dettaglio evento c'è un secondo menu "Altre azioni" nella barra in alto, che manca sui tuoi eventi.

## Perché queste scelte
- **Il blocco vale nei due sensi.** Se blocco Anna, io non vedo i suoi eventi e lei non vede i miei; lei non può chiedere di partecipare. Per questo una funzione unica, `hiddenUids`, unisce "chi ho bloccato" e "chi ha bloccato me".
- **Dove si fa rispettare.** Chiedere di partecipare è bloccato *davvero*: nella regola condivisa `decideJoin`, nella transazione Firebase e nelle regole Firestore (`blockedBetween`). Nascondere eventi e persone invece è un filtro dell'app (non esiste una query Firestore "tutti gli eventi tranne questi"). Onestamente: chi smanetta con strumenti da sviluppatore potrebbe ancora leggere un evento pubblico; la cosa che conta (iscriversi) è protetta lato server.
- **Compromesso di riservatezza.** Il documento `blocchi/{chi}_{chi}` lo può leggere anche il bloccato, perché solo così il suo telefono può nascondere gli eventi dell'altro. Quindi tecnicamente il bloccato *potrebbe* scoprire di esserlo. È una scelta consapevole, scritta qui.
- **Segnalazioni a senso unico.** `segnalazioni` si può solo creare: nessun utente le rilegge (le guarda chi gestisce l'app dalla console Firebase). Il segnalato non sa nulla.

## Il codice, pezzo per pezzo
- `src/safety/reasons.ts`: elenco fisso dei motivi (`as const` per avere il tipo giusto) e le scritte da mostrare.
- `src/safety/report.ts`: `checkReport` è una funzione pura: motivo valido, non segnalare se stessi, dettagli al massimo 300 caratteri, "Altro" richiede almeno 3 caratteri di spiegazione. `submitReport` la usa e poi chiama il repository.
- `src/safety/blocking.ts`: le tre funzioni pure del filtro (`hiddenUids`, `withoutBlockedEvents`, `withoutBlockedPeople`); restituiscono nuovi array senza toccare quelli ricevuti.
- `blockRepository.ts` + versione in memoria + `firestoreBlockRepository.ts`: stesso contratto, due implementazioni. Su Firestore l'id del documento è `chiBlocca_chiÈBloccato`, così le regole possono controllarlo senza fare query.
- `BlocksContext.tsx`: come per i salvati, un solo posto tiene l'elenco, così elenco eventi, mappa, dettaglio e profilo concordano. Senza provider (test dei singoli schermi) nessuno è bloccato.
- `useUpcomingEvents` filtra con `hidden`: eventi, mappa e Salvati cambiano tutti insieme. `loadEventPeople` riceve `hidden` e salta le persone nascoste.
- `joinDecision.ts`: nuovo campo `blocked`; in memoria si legge *prima* dei conteggi, così dopo l'ultimo `await` controllo e scrittura restano nello stesso passo (l'atomicità della versione in memoria).
- `firestore.rules`: `blockedBetween(a, b)` con `exists()`; per `blocchi` la lettura singola (`get`) controlla l'id, quella a elenco (`list`) controlla i campi, perché una query non può "provare" la condizione sull'id.
- Interfaccia: `SafetyMenu` (il menu e i passi che seguono), `ReportSheet` (motivi come righe grandi da 48px, contatore dei caratteri), `BlockedSheet` (elenco con "Sblocca", dal Profilo).

## Errori incontrati
- Un test aspettava per 5 secondi un pulsante che per l'organizzatore non esiste: ho sostituito l'attesa con quella dell'intestazione "Chi c'è".
- Nella prima versione la finestra di segnalazione tagliava "Annulla" in fondo: ho accorciato l'introduzione e il campo di testo.
- Il messaggio "è stato bloccato" andava al maschile anche per "Sara": ora "Hai bloccato Sara".
- Nel passo screenshot del Profilo il messaggio di conferma copriva il titolo della finestra: il passo ora aspetta che sparisca.

## Cosa si vede negli screenshot (47-52)
Menu "Altre azioni" in tre voci (due segnala, una blocca in rosso), finestra di segnalazione completa con "Altro" e testo, conferma di blocco con pulsante rosso grande, menu di una persona, elenco dei bloccati con "Sblocca". Tutto dentro lo stile: finestre dal basso, righe da 48px, icone vettoriali. Difetto residuo: l'icona della bandiera è lo stesso segno per evento e persona.

## Non verificato
`npm run test:rules` (regole di blocchi e segnalazioni, in `rules-tests/safety.rules-test.ts`) non è eseguibile dal cloud: va lanciato con l'emulatore.

## Esercizio per Andrea
In `reasons.ts` aggiungi il motivo `'minorenne'` ("Sembra avere meno di 18 anni"). Quali altri due file devi aggiornare perché l'app e le regole lo accettino? (Suggerimento: cerca `'truffa'` in tutto il progetto.)
