# Giorno 15 – I miei eventi, le mie iscrizioni, ritiro e annullamento

## Lettura scelta
"Annullamento" l'ho letto come: l'organizzatore porta l'evento a `stato = 'annullato'` (l'evento non si cancella, come già dicono le regole). "Ritiro" è: chi è iscritto toglie la **propria** partecipazione, in qualunque stato (richiesta, confermato, rifiutato). Dopo l'annullamento le iscrizioni restano nei dati: nell'elenco appaiono come "Evento annullato" e ci si può ritirare comunque.

## Perché queste scelte
- **Stessa ricetta dei giorni 10 e 11**: la decisione è una funzione pura (`decideWithdraw`, `decideCancel`), usata sia dal repository in memoria sia da quello Firebase. I due non possono dare risposte diverse.
- **`withdraw` nel repository**, non `setStatus`: il ritiro cancella il documento e, se era confermato, deve abbassare il contatore dei posti. Le due cose devono avvenire insieme, quindi transazione (Firestore) o un solo passo senza `await` in mezzo (memoria).
- **Annullare usa `events.update`** che già esiste: non serve un metodo nuovo, basta il controllo dei permessi prima (`cancelEvent`).
- **`buildMine` pura**: dati tutti gli eventi e le mie partecipazioni, restituisce le due liste. Così si testa senza schermata e senza caricamenti.
- **Regole**: un confermato che si ritira deve abbassare il contatore di 1 nello stesso batch; l'organizzatore può togliere solo richieste e rifiutati (non occupano posti, quindi non c'è un contatore da correggere).

## Il codice, pezzo per pezzo
- `decideWithdraw(participation)`: se non c'è → errore "Iscrizione non trovata"; altrimenti `ok` e `liberaPosto = stato === 'confermato'`.
- `MemoryParticipationRepository.withdraw`: in memoria il numero di confermati si **conta** dalle righe, quindi togliere la riga basta a liberare il posto.
- `FirestoreParticipationRepository.withdraw` (scritto, non eseguito): dentro `runTransaction` legge contatore e partecipazione, decide, poi `tx.delete` e, se serve, `tx.set` del contatore con `Math.max(0, n - 1)` (mai sotto zero).
- `decideCancel(event, actorUid)`: evento assente, non sei l'organizzatore, già annullato → errori con il motivo; altrimenti `ok`. `cancelEvent` legge l'evento, decide, poi `update(..., { stato: 'annullato' })`.
- `buildMine`: filtra gli eventi con `organizzatoreId === uid`; per le iscrizioni cerca l'evento in una `Map` per id, salta quelle orfane e quelle degli eventi che organizzo; ordina per data.
- `useMine`: carica in un `useEffect`; `reload` incrementa un numero (`version`) che è nelle dipendenze dell'effetto, così l'effetto riparte e rilegge.
- `MyEventsScreen`: la funzione `run` esegue un'azione, mostra il motivo se fallisce, e in ogni caso ricarica le liste.
- `firestore.rules`: nuovo `allow update` su `contatori` con `confermati == seatsNow - 1` e `withdrawsConfirmed` (la partecipazione esisteva confermata e **dopo** il batch non esiste più, `!existsAfter`); il `delete` di `partecipanti` per un confermato richiede `seatsAfter == seatsNow - 1`.

## Errori incontrati
All'inizio build, lint e test non partivano: mancavano le dipendenze nella sessione (`node_modules`). Risolto con `npm ci`. Nessun altro errore.
Il test delle regole "ritira la propria partecipazione" usava un confermato senza contatore: con la nuova regola fallirebbe, quindi l'ho cambiato in una richiesta e ho aggiunto un blocco di test apposta per il ritiro da confermato (non eseguiti qui: serve l'emulatore).

## Esercizio
L'organizzatore oggi non può togliere un confermato. Scrivi `removeParticipant(eventId, uid, actorUid)`: quale funzione pura servirebbe (pensa a `decideWithdraw`)? Quale regola dovrebbe cambiare in `contatori`, visto che chi scrive non è l'utente tolto?
