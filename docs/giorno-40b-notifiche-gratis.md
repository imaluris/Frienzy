# Giorno 40b – Notifiche senza spendere

**Lettura scelta.** Il task chiedeva tre pezzi nella stessa notte (A promemoria sul telefono, B scheda Avvisi, C notifiche a app chiusa con GitHub Actions). Ho fatto tutti e tre. Dove il testo lasciava libertà ho scelto: gli id dei promemoria sono un hash dell'evento; per ricordare le chiavi già inviate ho usato **un solo documento** `notificheInviate/stato` (e non una scheda per chiave): spiego il perché sotto. Il lavoro è stato fatto nel cloud e consegnato dalla cartella locale (il cloud non può fare push).

## Perché queste scelte
- **Cloud Functions → GitHub Actions.** Le Cloud Functions richiedono il piano Blaze (carta). Un workflow che gira ogni 15 minuti su un repo pubblico è gratis e può usare Firebase Cloud Messaging con le credenziali di amministrazione.
- **Promemoria locali.** Un promemoria "tra 2 ore" non ha bisogno di un server: il telefono sa già a cosa partecipi. Programmiamo gli avvisi con `@capacitor/local-notifications` e li ricalcoliamo ogni volta che i dati cambiano.
- **Avvisi in app senza ascolti continui.** Firestore gratuito conta le letture. Perciò niente `onSnapshot` su intere raccolte: si rilegge al ritorno in primo piano, all'apertura, tirando per aggiornare e ogni 60 secondi *solo* con l'app visibile.
- **Funzioni pure.** Decidere "cosa programmare / cosa mostrare / cosa inviare" è la parte che sbaglia; è tutta in funzioni pure testate (`planReminders`, `buildAlerts`, `plan`).

## Parte A – promemoria locali (`src/reminders/`)
- `planReminders(events, now)`: per ogni evento *aperto* crea due promemoria (24 h e 2 h prima); se il momento è già passato non lo crea. Un evento tra 5 ore ha solo quello da 2 ore.
- `reminderId(eventId, kind)`: hash FNV-1a a 31 bit. Stesso evento+tipo = stesso numero, così riprogrammare non crea doppioni (Android vuole un intero positivo).
- `reminderEvents(mine)`: quelli che organizzo + quelli in cui sono *confermato* (non richieste, rifiutati, lista d'attesa).
- `ReminderService` è un'interfaccia (supporto, permesso, sostituisci tutto, annulla) con una versione in memoria (test/demo) e una Capacitor. Nel browser `isSupported()` è falso e non succede nulla. Il metodo `replaceAll` annulla tutto ciò che è in coda e riprogramma: più semplice che calcolare le differenze.
- `syncReminders`: se l'interruttore "Promemoria" è spento → `cancelAll`; senza permesso → non programma; altrimenti `loadMine` → `planReminders` → `replaceAll`.
- `useReminderSync` (in `AppShell`) lo esegue all'avvio, al ritorno in primo piano (`native/foreground.ts`: `visibilitychange` più l'evento nativo di Capacitor) e quando arriva il segnale `notifyDataChanged()` (lo emette `useRunAction` dopo iscrizione, ritiro, accettazione, annullamento, e il Profilo quando cambi un interruttore). Il segnale ha un ritardo di 600 ms (debounce) per non ricalcolare dieci volte di fila.
- "Attiva le notifiche" nel Profilo chiede in un solo gesto anche il permesso dei promemoria (su Android 13+ è lo stesso permesso).

## Parte B – scheda Avvisi (`src/alerts/`, `src/screens/Alerts*.tsx`)
- `buildAlerts` produce tre tipi: *richieste* in attesa sui miei eventi (la chiave contiene il numero: se ne arriva un'altra torna "nuova"), *risposte* alle mie richieste (solo eventi con approvazione), *inviti* a eventi creati negli ultimi 7 giorni, nei miei interessi e, se la mia posizione è nota, entro 25 km. Il tipo coincide con il nome dell'interruttore: spegnerlo nasconde quegli avvisi.
- `loadAlerts` fa poche letture: eventi, mie iscrizioni, preferenze, "visti", blocchi, e una lettura delle iscrizioni per ogni mio evento futuro (solo se "Richieste" è acceso). Gli eventi di persone bloccate sono ignorati.
- `AlertsProvider` tiene gli avvisi in un posto solo: la campanella nella testata di Eventi (contatore) e la schermata leggono lo stesso stato. Il contatore conta gli avvisi *non visti*.
- I "visti": `SeenRepository` (interfaccia + memoria + Firestore `users/{uid}/notifiche/visti`, un elenco di chiavi, massimo 200 — `withSeen` tiene le ultime 200). Aprendo la schermata tutto diventa visto, ma ricordo cosa era nuovo per mostrare il puntino (`useState(() => seen)` fotografa l'elenco all'apertura).
- Nuova illustrazione `NoAlertsArt` (campanella che dorme) per lo stato vuoto.

## Parte C – notificatore (`notifier/`)
- Pacchetto a sé (CommonJS, `firebase-admin`). La logica pura viene da `functions/` (`geo`, `recipients`, `messages`, `invites`); il promemoria server è sparito.
- `plan(input)` → elenco di invii `{key, pref, recipients, message}`: nuova richiesta → organizzatore (`req:{evento}:{uid}`); accettata/rifiutata *solo con approvazione* → richiedente (`ans:…`); evento creato nelle ultime 24 h → persone con interessi e zona ≤ 25 km (`inv:{evento}:{uid}`), escludendo organizzatore, iscritti e bloccati nei due sensi. Nessuna chiave già inviata, nessun doppione.
- `applyBaseline`: se lo stato non esiste ancora (primissima esecuzione) si segnano tutte le chiavi come inviate **senza inviare** — niente valanga di notifiche su cose vecchie.
- `gather.ts` legge solo ciò che serve: eventi con **un solo filtro** (`dataOra > ora`), il resto in codice (nessun indice composto, che dal cloud non si crea); le iscrizioni solo per eventi con approvazione o nuovi; i dispositivi con una lettura della raccolta; preferenze e profili solo di chi serve.
- **Dispositivo a primo livello.** `users/{uid}/notifiche/dispositivo` → `dispositivi/{uid}`: così il notificatore legge tutti i token con una query semplice, senza esenzioni di collection group. Aggiornati repository, regole e test regole; la cancellazione account passa già da `notifications.clear`.
- **Stato in un solo documento.** Il testo parlava di una raccolta `notificheInviate`: l'ho tenuta come raccolta ma con **un solo documento** (`stato`, mappa chiave → ora). Con 96 esecuzioni al giorno, leggere una scheda per chiave avrebbe superato le 50.000 letture gratuite al giorno. Le chiavi più vecchie di 60 giorni si dimenticano (`mergeSent`).
- Invio con `sendEachForMulticast`; se la chiamata fallisce del tutto la chiave non si registra e si riprova al giro dopo.
- `notifier/notifiche.workflow.yml` (da copiare in `.github/workflows/notifiche.yml`, vedi "Passi per te"): `cron` ogni 15 minuti + avvio manuale; se il segreto `FIREBASE_SERVICE_ACCOUNT` non c'è, scrive che le notifiche sono spente ed esce con successo; altrimenti installa, compila, esegue. `concurrency` evita due esecuzioni insieme. `android.yml` non è toccato. Nel file il messaggio rimanda a questa nota.

## Errori incontrati
- Il test dell'organizzatore "senza telefono" passava `undefined` a un parametro con valore predefinito: JavaScript usa il default, quindi il telefono c'era. Soluzione: passare `''`.
- Il caricamento degli avvisi non vedeva inviti perché le preferenze di partenza hanno `inviti: false`: nel test le ho accese.

## Limiti onesti
- Un promemoria locale **non segue un cambio d'orario** finché l'app non si apre e ricalcola.
- Il controllo su GitHub ha qualche minuto di ritardo e **si sospende dopo 60 giorni** senza attività nel repo.
- Le letture di Firestore restano contate: con molti eventi e utenti conviene rallentare il `cron` (es. ogni ora).
- Chi sale dalla lista d'attesa in un evento *libero* non riceve né avviso né notifica (non c'è un dato che lo distingua da un'iscrizione diretta).
- Cloud Messaging non è provato con un telefono vero; l'emulatore Firestore non gira nel cloud (test regole scritti, non eseguiti).

## Cosa hai visto negli screenshot
`70` campanella con "4" sopra la testata; `71` schermata Avvisi con una richiesta, una risposta e due inviti (puntino terracotta = nuovo, icone con colori diversi); `72` tornando indietro il contatore sparisce; `73` stato vuoto con la campanella che dorme. Difetto minore: con la campanella il saluto "Buongiorno, Andrea" va su due righe.

## Passi per te
0. **Il workflow va copiato a mano.** La chiave (token) che il PC usa per il push non ha il permesso `workflow`, e GitHub rifiuta di creare file in `.github/workflows/` con un token così. Quindi il file è in `notifier/notifiche.workflow.yml`: copialo in `.github/workflows/notifiche.yml` (da PC con `git mv`, o dal sito di GitHub con "Add file"), oppure dai il permesso `workflow` al token e dillo a Claude. Finché non lo copi, nessuna notifica a app chiusa parte (promemoria locali e scheda Avvisi funzionano lo stesso).
1. Console Firebase → Impostazioni progetto → Account di servizio → *Genera nuova chiave privata*.
2. Su GitHub: Settings → Secrets and variables → Actions → nuovo segreto `FIREBASE_SERVICE_ACCOUNT` con il contenuto del file JSON (mai nel repo).
3. Pubblica le regole (`firebase deploy --only firestore:rules`): ci sono `dispositivi/{uid}` e `notifiche/visti`.
4. Sul telefono: "Attiva le notifiche" nel Profilo; su OnePlus imposta la batteria dell'app su "Nessuna restrizione".
5. Al primo giro il notificatore registra tutto senza inviare; dal secondo manda solo le novità.

## Esercizio
Aggiungi un terzo promemoria "30 minuti prima": basta una riga in `BEFORE` di `planReminders.ts` e il tipo in `types.ts`. Poi scrivi il test: un evento tra 40 minuti deve avere solo quello nuovo. Che cosa succede agli id? (Suggerimento: `reminderId` usa anche il tipo.)
