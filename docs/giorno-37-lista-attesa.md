# Giorno 37: lista d'attesa

**Lettura scelta (nessuno poteva rispondere):** con un evento pieno, il pulsante diventa "Mettiti in lista d'attesa" *anche* se l'evento richiede approvazione (prima, con approvazione, si poteva inviare una richiesta anche a posti finiti). Quando si libera un posto, il primo in lista diventa "confermato" (evento libero) oppure "richiesta" (evento con approvazione), come chiede la descrizione del task.

## Perché queste scelte
- **Stato nuovo, non campo nuovo.** `inAttesa` è un valore in più di `ParticipationStatus` (il campo era già testuale proprio per questo). Niente migrazioni.
- **Tutte le decisioni sono funzioni pure** in `src/participation/waitlist.ts`, come per `decideJoin`: memoria e Firestore usano lo stesso codice e non possono dare risposte diverse.
- **Ordine di arrivo stabile.** `waitlistOrder` ordina per `creatoIl`; se due persone arrivano nello stesso istante decide l'uid. Senza questo secondo criterio l'ordine potrebbe cambiare da una lettura all'altra.
- **La lista non occupa posti.** I "confermati" restano il contatore dei posti; `inAttesa` non lo tocca.
- **Promozione nella stessa operazione del ritiro.** Se la promozione fosse un secondo passo, in mezzo qualcuno potrebbe prendere il posto liberato. Per questo `decideWithdraw` restituisce anche `promuovi` e il repository scrive ritiro + promozione insieme.

## Il codice, pezzo per pezzo
- `waitlist.ts`: `waitlistOrder` (ordina), `waitlistPosition` (posizione da 1 oppure `null`), `pickPromotion` (chi sale e con quale stato; nessuno se la lista è vuota o l'evento non è aperto), `decideWaitlist` (si entra solo se l'evento è aperto, pieno, non bloccato, non organizzatore e non già iscritti).
- `withdrawDecision.ts`: ora riceve un oggetto `{ participation, event, all }`. Se chi esce era confermato calcola `liberaPosto` e `promuovi`; se era in lista o in richiesta non cambia nulla per gli altri.
- `memoryParticipationRepository.ts`: `joinWaitlist`, `waitlistPosition` e `withdraw` con promozione. Dopo l'unico `await` tutto è sincrono, quindi atomico.
- `firestoreParticipationRepository.ts`: in una transazione web non si possono fare query, quindi la coda vive in un documento `events/{id}/contatori/attesa` con il campo `coda` (uid in ordine). Mettersi in lista aggiunge in fondo, uscire toglie, il ritiro di un confermato legge la testa della coda e promuove. Se il promosso diventa "confermato" il contatore dei posti **non** si scrive (uno esce, uno entra); se diventa "richiesta" scende di 1.
- `firestore.rules`: funzioni `joinsWaitlist`, `leavesWaitlist`, `promotesFirst`, `withdrawsConfirmedAndPromotes`; la coda si modifica solo nei tre casi, sempre insieme alla partecipazione corrispondente nello stesso batch. Solo il primo della coda può essere promosso e solo se l'evento è aperto.
- Interfaccia: `participationView` ha il nuovo stato `attesa`; `actionBar.ts` il pulsante "Mettiti in lista d'attesa" e "Esci dalla lista" (con conferma dal basso); `statusNote` mostra "Sei 2° in lista d'attesa"; la posizione la carica `useEventParticipation`; nei "Miei eventi" la scritta è "In lista d'attesa".

## Errori incontrati
- La regola vecchia sul ritiro pretendeva sempre "contatore -1": con la promozione a "confermato" il contatore resta uguale, quindi ho aggiunto il caso alternativo (solo quando sale il primo e l'evento non richiede approvazione).
- Un test esistente diceva che con approvazione si vedeva "Chiedi di partecipare" anche a evento pieno: l'ho aggiornato alla nuova regola (pieno vince).
- Nella prima schermata il messaggio "Posti esauriti" era rosso come un divieto; ora è senape ("in attesa"), perché è un invito.
- Nello screenshot dell'uscita il messaggio di conferma copriva la finestra: il passo ora aspetta che sparisca.
- Un test della chat (non legato a questo task) falliva una volta su venti: cercava il nome dell'organizzatore prima che fosse caricato. Ora lo aspetta (`findByText`).

## Cosa si vede negli screenshot (05, 55, 56)
Evento pieno con riquadro senape "Posti esauriti: se qualcuno si ritira, la lista d'attesa ti dà la precedenza" e pulsante terracotta "Mettiti in lista d'attesa"; dopo il tocco "Sei 2° in lista d'attesa" con pulsante "Esci dalla lista"; la finestra "Uscire dalla lista d'attesa?" con "Sì, esci" e "No, resta". Presentabile. Difetto residuo: l'etichetta del pulsante va su due righe.

## Non verificato
I test delle regole (`rules-tests/waitlist.rules-test.ts`) sono scritti ma non eseguiti: l'emulatore Firestore non si scarica da qui. Da lanciare con `npm run test:rules`.

## Esercizio
In `waitlist.test.ts` aggiungi un test: tre persone in lista, la prima esce, poi un confermato si ritira. Chi deve salire? Scrivi prima la risposta, poi controlla con il test.
