# Giorno 34 – Chat dell'evento

**Lettura scelta:** la chat è un canale per evento (`events/{id}/messaggi`), leggibile e scrivibile solo da organizzatore e confermati. Chi non ha accesso vede un segnaposto nel dettaglio. L'organizzatore può cancellare qualsiasi messaggio; nessuno può modificarli. In un evento annullato si può leggere ma non più scrivere.

## Perché queste scelte
- **Le regole stanno in funzioni pure** (`src/chat/chatRules.ts`): `canUseChat`, `canDeleteMessage`, `checkMessageText`. Le stesse regole sono scritte in `firestore.rules`; avere una versione pura permette di provarle senza Firebase.
- **Il ruolo si calcola ogni volta** (`chatRoleOf`): organizzatore se `event.organizzatoreId == uid`, confermato se la partecipazione ha stato `confermato`, altrimenti `nessuno`. Chi lascia l'evento perde l'accesso perché al controllo successivo il ruolo non c'è più: non serve "revocare" nulla.
- **Interfaccia `ChatRepository`** con tre operazioni: `subscribe` (tempo reale, restituisce la funzione per smettere), `send`, `remove`. Come per gli altri repository, c'è la versione in memoria (test e demo) e quella Firestore (`onSnapshot`), che si compila ma non si esegue.

## Il codice, pezzo per pezzo
- `message.ts`: tipo `ChatMessage`, `ChatRole` e il limite di 500 caratteri.
- `memoryChatRepository.ts`: tiene i messaggi in una mappa per evento e un insieme di ascoltatori. Dopo ogni `send`/`remove` chiama `notify`, che ricontrolla il ruolo di ciascun ascoltatore: chi non ha più accesso riceve un errore e viene tolto. È così che si simula il "tempo reale".
- `firestoreChatRepository.ts`: `addDoc` con `serverTimestamp()` per l'ora (le regole richiedono `creatoIl == request.time`), `onSnapshot` con `orderBy('creatoIl')`, `deleteDoc` per cancellare. `serverTimestamps: 'estimate'` evita che il proprio messaggio appaia senza ora per un attimo.
- `groupMessages.ts`: dato l'elenco in ordine, decide per ogni messaggio se mostrare il nome (solo il primo di una serie dello stesso autore, mai sui miei) e il separatore del giorno ("Oggi", "Ieri", data).
- `useChat.ts`: si iscrive, tiene `messages`, `status` (`loading`/`ready`/`denied`) e una mappa uid → nome caricata dai profili.
- Schermate: `ChatScreen` (testata, elenco che scorre in fondo a ogni nuovo messaggio, conferma prima di cancellare con `ConfirmSheet`), `ChatBubble` (miei a destra in terracotta, altri a sinistra con avatar), `ChatComposer` (campo fisso in basso con area sicura, invio spento se vuoto, contatore vicino al limite), `ChatLink` (riga nel dettaglio, apribile o con il segnaposto).
- Navigazione: nuovo overlay `chat`; `goBack` dalla chat torna all'evento, non alla lista.
- Regole Firestore: `read` per organizzatore o confermato; `create` con `authorUid == request.auth.uid`, testo 1–500, data del server, nessun campo extra; `update` mai; `delete` solo organizzatore. Test in `rules-tests/chat.rules-test.ts` (da lanciare con `npm run test:rules`, non eseguibili dal cloud).

## Errori incontrati
- Il pulsante cestino compariva come cerchio vuoto: lo stile generico dei pulsanti ha `padding: 0 24px`, che in un pulsante largo 40px schiaccia l'icona a zero. Soluzione: `padding: 0` con selettore più specifico.
- Per lo stato "nessun messaggio" l'illustrazione disponibile era una lente d'ingrandimento, fuori luogo: ho disegnato `NoMessagesArt` (due fumetti) e aggiornato il test (otto illustrazioni).
- Un test di schermata è fallito una volta sola con tutta la suite in parallelo (attesa di 1 secondo troppo corta): ora il file usa `asyncUtilTimeout` di 5 secondi.

## Cosa si vede negli screenshot (41–46)
Chat con fumetti ben distinti e nomi solo sul primo di una serie; segnaposto nel dettaglio con bordo tratteggiato; conferma di cancellazione dal basso; stato vuoto illustrato; campo di scrittura con testo lungo che cresce. Giudicati presentabili.

## Esercizio
Aggiungi un limite di frequenza lato app: impedisci di inviare più di un messaggio ogni secondo in `ChatComposer` (suggerimento: tieni in uno `useRef` l'ora dell'ultimo invio) e scrivi un test con i timer finti di Vitest.
