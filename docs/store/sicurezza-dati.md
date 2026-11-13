# Modulo "Sicurezza dei dati" (Data safety) – risposte suggerite

Risposte preparate dal codice com'è oggi. Vanno controllate da Andrea prima dell'invio: Google considera responsabile lo sviluppatore. Servizi usati: Firebase Authentication, Cloud Firestore, Firebase Cloud Messaging (tutti di Google, trattano i dati per conto dello sviluppatore).

## Domande generali

| Domanda | Risposta |
|---|---|
| L'app raccoglie o condivide dati utente? | Sì |
| Tutti i dati sono cifrati in transito? | Sì (HTTPS/TLS di Firebase) |
| Si può chiedere la cancellazione dei dati? | Sì: dall'app (Profilo → Elimina account) e dalla pagina `eliminazione-account.html` |

## Dati raccolti

| Categoria Google | Dato | Raccolto | Condiviso con terzi | Scopo | Facoltativo |
|---|---|---|---|---|---|
| Info personali | Nome | Sì | No (visibile ad altri utenti dentro l'app) | Funzionalità dell'app, account | No |
| Info personali | Indirizzo email | Sì | No | Gestione dell'account | No |
| Info personali | Altre info (data di nascita → età, bio, interessi) | Sì | No (agli utenti si mostra solo l'età) | Funzionalità dell'app | No (bio e interessi facoltativi) |
| Posizione | Posizione approssimativa | Sì, solo se l'utente la consente: per mostrare eventi vicini; con gli inviti attivi si salva solo una zona di circa 5 km | No | Funzionalità dell'app | Sì |
| Messaggi | Altri messaggi in-app (chat degli eventi) | Sì | No (visibili a organizzatore e confermati dell'evento) | Funzionalità dell'app | No |
| Attività nell'app | Eventi creati, iscrizioni, eventi salvati, presenze e voti, segnalazioni e blocchi | Sì | No | Funzionalità dell'app, sicurezza | No |
| ID dispositivo o altri ID | Token per le notifiche (FCM) | Sì, solo se si attivano le notifiche | No | Notifiche | Sì |

## Dati NON raccolti

Foto e video, audio, file, contatti, calendario, cronologia di navigazione, informazioni finanziarie, informazioni sulla salute, SMS e registro chiamate, app installate, crash log e diagnostica (non c'è nessun servizio di crash reporting né di analisi), posizione precisa (la posizione esatta di un evento è scritta dall'organizzatore a mano e non è la posizione del telefono).

## Pratiche di sicurezza da dichiarare

- Dati cifrati in transito: sì.
- Possibilità di richiedere la cancellazione: sì (link all'eliminazione account).
- Nessuna vendita di dati e nessuna pubblicità.
- Programma "Families": non partecipa (app solo per 18+).
