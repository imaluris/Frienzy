# Giorno 39: presenza e voti

**Lettura scelta del task.** "Presenza e voti" l'ho letto così: (1) dopo l'inizio dell'evento l'organizzatore segna ogni confermato come *è venuto* o *non c'era*; (2) ogni confermato può dare **un solo voto** da 1 a 5 stelle con un'etichetta **facoltativa** presa da una lista fissa; (3) nel Profilo compare un riepilogo: eventi fatti, affidabilità in percentuale e, per chi organizza, il voto medio ricevuto. "Dopo la data dell'evento" significa "dal momento in cui l'evento è cominciato".

## Perché queste scelte
- **Due raccolte di primo livello** (`presenze/{evento}_{uid}` e `valutazioni/{evento}_{uid}`) invece di sotto-raccolte dell'evento: il riepilogo del profilo deve cercare "tutte le presenze di questa persona", e una query `where('uid', '==', ...)` su una raccolta di primo livello è semplice ed economica.
- **L'id del documento è `evento_uid`**: garantisce *una sola* valutazione per persona e per evento senza bisogno di controlli in più. Le regole permettono solo `create` per i voti (mai `update`), quindi non si può votare due volte.
- **La presenza si può correggere** (l'organizzatore può sbagliare un tocco), il voto no.
- **Affidabilità** = presenze / presenze segnate. Sotto 3 presenze segnate si mostra "Presto" e una spiegazione: con 1 sola presenza il risultato sarebbe 0% o 100% e sarebbe ingiusto.
- **Nessun dato sensibile**: le presenze contengono solo "presente/assente"; i voti li leggono solo chi ha votato e l'organizzatore dell'evento (per questo il voto medio compare solo nel *proprio* profilo).
- **Logica in funzioni pure** (`decide.ts`, `reliability.ts`): le stesse regole sono applicate dal repository in memoria, dal repository Firestore (messaggi chiari) e dalle regole Firestore (sicurezza vera).

## Il codice, pezzo per pezzo
- `src/attendance/types.ts`: tipi `Presence` e `Rating`, la lista fissa `RATING_LABELS` e `docId()`.
- `src/attendance/decide.ts`: `decideMarkPresence` e `decideRating` restituiscono `{ ok: true }` oppure `{ ok: false, reason }`. Controllano organizzatore, evento non annullato, evento già iniziato (`hasEnded`), partecipazione confermata, voto non duplicato, stelle intere da 1 a 5, etichetta valida.
- `src/attendance/reliability.ts`: `reliability()` (eventi fatti, percentuale arrotondata, soglia `MIN_MARKED = 3`) e `starsSummary()` (media con un decimale).
- `attendanceRepository.ts` (interfaccia), `memoryAttendanceRepository.ts` (test e demo; l'orologio `now` si può iniettare), `src/firebase/firestoreAttendanceRepository.ts` (scritto, non eseguito).
- Schermate: `FeedbackLink` (la riga nel dettaglio: "Chi è venuto?" per l'organizzatore, "Com'è andata?" per il confermato, "Hai votato N stelle" dopo), `PresenceSheet`, `RatingSheet`, `StarPicker` (cinque pulsanti radio da 48px), `ProfileTrust` (riepilogo nel Profilo), hook `usePresenceList` e `useTrust`.
- `firestore.rules`: blocchi `presenze` e `valutazioni`; test in `rules-tests/attendance.rules-test.ts` (non eseguibili dal cloud).
- Demo: `src/demo/demoPast.ts` crea quattro eventi già passati con presenze e voti d'esempio.

## Errori incontrati
- Il test del demo contava gli eventi: aggiornato perché ora ci sono anche quelli passati.
- Prima copia dei numeri degli screenshot (57-61) in conflitto con quelli del task 38: rinominati 62-66.
- Guardando lo screenshot ho trovato un difetto già presente: un evento di ieri mostrava "Oggi" (`friendlyWhen` trattava i giorni passati come oggi). Ora dice "Ieri" per ieri e la data per gli altri giorni passati.
- Le stelle avevano un'ombra da pulsante: tolta con `box-shadow: none`.
- Aggiunto `SHOTS_ONLY` allo script degli screenshot per rifare solo alcune schermate.

## Cosa si vede negli screenshot (62-66)
La finestra "Chi è venuto?" ha righe chiare con avatar e due pulsanti grandi, quello scelto è pieno. Il voto ha cinque stelle senape scuro, etichette a pillola, pulsante di invio che resta spento senza stelle. Nel Profilo la scheda con 2 eventi fatti, 67% e 4,5 stelle sta bene sotto le statistiche. Difetti rimasti: nel dettaglio di un evento passato la barra in basso offre ancora "Ritirati" / "Gestisci evento" e la frase "Sei dei nostri" (da rivedere); i voti restano dopo l'eliminazione dell'account.

## Esercizio
Cambia `MIN_MARKED` in `reliability.ts` da 3 a 5 e lancia `npm test`: quale test si rompe e perché? Poi aggiungi un test che verifica che con 5 presenze segnate la percentuale compare.
