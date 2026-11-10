# Giorno 40 – Notifiche: promemoria, avvisi e inviti

Lettura scelta: i task dicono "Cloud Functions NON eseguite", quindi ho scritto il codice dei server e la logica che decide *chi* avvisare come funzioni pure testate, e nell'app gli interruttori nel Profilo. Il token del telefono e la zona approssimata vengono salvati dall'app; le funzioni li leggono.

## Perché queste scelte
- **Logica pura separata dai trigger.** Decidere "a chi mando cosa e quando" è la parte che può sbagliare; i trigger (`onSchedule`, `onDocumentCreated`) sono solo colla. Così la logica si testa senza Firebase (`functions/src/logic/logic.test.ts`, 14 test, girano con il normale `npm test`).
- **`functions/` è un pacchetto a parte** (suo `package.json`, `tsconfig.json`). Non può importare da `src/`, quindi `geo.ts` è una copia ridotta del decodificatore di geohash dell'app.
- **Zona, non posizione.** Per gli inviti l'app salva solo un geohash di 5 caratteri (cella di ~5 km) in `users/{uid}/notifiche/dispositivo`, e solo se "Inviti vicino a te" è acceso. Le regole rifiutano zone più lunghe di 5 caratteri.
- **Inviti spenti di partenza**, gli altri tre accesi: gli inviti hanno bisogno della posizione, quindi li accende la persona.
- **Messaggi senza dati di profilo**: l'invito contiene solo titolo e zona dell'evento.

## Il codice, pezzo per pezzo
- `src/notifications/prefs.ts`: tipo con i quattro interruttori, valori di partenza, etichette, `normalizePrefs` (chiavi mancanti o non booleane tornano al default).
- `notificationRepository.ts` + versione in memoria + `firebase/firestoreNotificationRepository.ts`: stesso schema degli altri repository (interfaccia, memoria per i test, Firestore scritto ma non eseguito). Aggiunto a `Services`; l'eliminazione account cancella anche questi due documenti (nella fase "salvati").
- `device.ts`: `buildDevice(token, posizione, inviti)` decide cosa salvare; senza token niente, zona vuota se inviti spenti o posizione ignota.
- `useNotificationPrefs.ts`: carica e cambia un interruttore alla volta; se il salvataggio fallisce lo rimette com'era (stesso schema del cuore dei salvati).
- `screens/NotificationSettings.tsx`: scheda nel Profilo; pulsante "Attiva le notifiche" (riusa `usePush`), quattro interruttori `role="switch"`, richiesta della posizione solo quando si accendono gli inviti.
- `firestore.rules`: `users/{uid}/notifiche/preferenze` (4 booleani, nient'altro) e `dispositivo` (token ≤ 1024, zona ≤ 5, data del server). Test in `rules-tests/notifications.rules-test.ts` (scritti, non eseguiti).
- `functions/src/logic/`: `reminders.ts` (finestre 23–24 h e 1–2 h, segno "già inviato"), `recipients.ts` (organizzatore + confermati, preferenze, token senza doppioni), `invites.ts` (interessi, raggio 25 km, esclusi, più vicini per primi, max 50), `messages.ts`.
- `functions/src/*Job.ts`: `sendReminders` (ogni 15 minuti), `notifyNewRequest`, `notifyAnswer`, `inviteNearby`; `admin.ts` ha `loadContact` e `sendTo`.

## Errori incontrati
- Nessun blocco. Un'attenzione: un evento creato 5 ore prima non deve ricevere "domani": per questo il promemoria 24 h ha una finestra stretta (test dedicato).

## Cosa ho visto negli screenshot
`60-profilo-notifiche` e `61-notifiche-inviti` (390x844): scheda coerente con le altre (stessi raggi e ombre), icona campanella a contorno, righe da 56 px con testo a sinistra e interruttore a destra, contrasto verde bosco su crema buono, nessun testo tagliato. Presentabili. Nel demo il pulsante "Attiva le notifiche" appare perché il servizio finto le supporta.

## Limiti noti
- Gli inviti cercano per cella di 4 caratteri del geohash: chi vive in una cella vicina ma diversa non è trovato.
- Nessuna notifica per i messaggi di chat né per chi sale dalla lista d'attesa (solo "risposte" quando passa a confermato).

## Passi di deploy (per Andrea, piano Blaze)
1. Passa il progetto Firebase al piano Blaze.
2. `cd functions && npm install`, poi `firebase deploy --only functions` (build automatica con `npm run deploy`).
3. Crea l'esenzione dell'indice: Firestore → Indici → Esenzioni → raccolta `notifiche`, campo `zona`, ambito *Collection group*, abilita Crescente.
4. `firebase deploy --only firestore:rules`.
5. Prova con due account: iscrizione con approvazione (avviso all'organizzatore), accettazione (avviso al richiedente), evento tra poco più di 1–2 ore (promemoria), inviti con zona accesa.

## Esercizio
In `functions/src/logic/reminders.ts` aggiungi un promemoria a 30 minuti (`'30m'`): serve una nuova finestra in `WINDOWS`, il tipo `ReminderKind`, un flag in `SentFlags`, e un test in `logic.test.ts`. Quale altro file va toccato?
