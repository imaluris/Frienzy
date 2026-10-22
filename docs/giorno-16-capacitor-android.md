# Giorno 16 – Capacitor Android, token delle notifiche, schermata Debug

## Lettura scelta
"Gestire le notifiche" l'ho letto come: chiedere il permesso, registrarsi, ricevere il **token**, ricordare l'ultima notifica arrivata ad app aperta e mostrare tutto nella schermata Debug. Il token **non** viene ancora salvato su Firestore (servirebbero modello dati e regole nuovi): per ora si legge e si copia a mano.

## Perché queste scelte
- **Capacitor** avvolge l'app web (la cartella `dist`) in un'app Android. `capacitor.config.ts` prende nome e appId da `src/config/app.ts`: resta un solo posto dove cambiarli.
- **Stessa ricetta degli altri giorni**: un'interfaccia (`PushService`), una versione vera (`CapacitorPushService`, scritta ma non eseguibile qui) e una finta (`MemoryPushService`) per i test. Nel `Services` c'è ora anche `push`.
- **Stato come funzione pura** (`pushReducer`): dato lo stato e un evento restituisce il nuovo stato. Si testa senza telefono.
- **Il permesso si chiede con un pulsante**, non all'avvio: Android 13+ vuole un gesto dell'utente, ed è più educato.
- **Plugin Gradle di Google Services condizionale**: se `android/app/google-services.json` non esiste (non sta mai nel repo) il progetto resta valido, solo senza notifiche.

## Il codice, pezzo per pezzo
- `pushService.ts`: l'interfaccia. `isSupported()` è `false` nel browser; `onToken/onError/onNotification` restituiscono una funzione per smettere di ascoltare.
- `pushState.ts`: `PushState` (stato, token, errore, ultima notifica) e `pushReducer` con uno `switch` sugli eventi. Il permesso "prompt" (non deciso) vale come "negato": non registriamo nulla.
- `capacitorPushService.ts`: `checkPermissions` poi, solo se serve, `requestPermissions`; `register()` avvia la registrazione e il token arriva dall'evento `registration`. Il metodo privato `listen` evita di ripetere tre volte `addListener` e il suo "togli ascolto".
- `usePush.ts`: un `useEffect` mette gli ascoltatori e li toglie all'uscita (return); `enable` è il callback del pulsante.
- `DebugScreen.tsx`: mostra stato, token (`wordBreak: break-all` perché è lunghissimo), ultima notifica. Il pulsante è disattivato se non supportato. Raggiungibile dal link "Debug" nella home.
- `AndroidManifest.xml`: aggiunto `POST_NOTIFICATIONS` (obbligatorio da Android 13).
- `android/app/build.gradle`: `if (file('google-services.json').exists()) { apply plugin: ... }`. Il modello di Capacitor usava un `try/catch` che faceva lo stesso in modo meno leggibile.
- `.gitignore` già escludeva `google-services.json`; ho verificato con `git check-ignore`.

## Errori incontrati
- Il primo `npm i` dei pacchetti Capacitor è andato in timeout dei 2 minuti di Bash: l'ho rilanciato in due passi (prima i pacchetti dell'app, poi quelli di sviluppo) con un timeout più lungo.
- All'avvio il repo era in "detached HEAD" e indietro di un commit: `git checkout main` e `git pull --ff-only`.
- Non ho compilato l'APK (niente Android SDK qui): `npx cap sync` finisce senza errori, che è il criterio del task.

## Esercizio
Aggiungi al `pushReducer` un evento `{ type: 'reset' }` che riporta lo stato a quello iniziale, e un test. Poi pensa: dove salveresti il token per poter mandare notifiche a un utente preciso, e quale regola di sicurezza servirebbe perché solo lui possa scriverlo?
