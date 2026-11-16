# Giorno 44 – Costi e abusi

**Lettura scelta:** il task è molto largo; l'ho tenuto intero ma "minimo e solido": limiti di frequenza nelle regole Firestore, App Check spento finché manca la chiave, gestore centrale degli errori con "Riprova", registro locale. Tutto gratuito (Spark, reCAPTCHA v3).

## 1. Perché i limiti di frequenza stanno nelle regole
Senza Cloud Functions (a pagamento) non possiamo contare le azioni lato server. Le regole però possono leggere un documento *dopo* la scrittura (`getAfter`) e confrontare ore. Trucco:

- Ogni utente ha `limiti/{uid}` con tre campi: `ultimoEvento`, `ultimoMessaggio`, `ultimaSegnalazione` (ore del server).
- Creare un evento / un messaggio / una segnalazione è permesso **solo** se nello *stesso batch* il campo giusto di `limiti/{uid}` vale `request.time` (`limitStamped`).
- Il documento `limiti/{uid}` si aggiorna solo se dall'ultima volta è passato l'intervallo: eventi 60 s, messaggi 2 s, segnalazioni 30 s (`validLimits`/`limitStep`/`waited`).
- Il client non può barare: l'ora è `serverTimestamp()`, e un'ora diversa da `request.time` è rifiutata.

Codice dell'app: `src/firebase/limitStamp.ts` (`stampLimit(batch, uid, campo)`), usato nei tre repository Firestore (evento+luogo, messaggio, segnalazione) che ora scrivono con `writeBatch`. I numeri stanno anche in `src/limits/limits.ts`; `limits.test.ts` controlla che coincidano con le regole (se cambi uno e dimentichi l'altro, il test si rompe). `secondsToWait` è una funzione pura pronta per mostrare "aspetta N secondi".

Le dimensioni massime (titolo 100, descrizione 1000, messaggio 500, dettagli 300, posti 200, interessi 7…) c'erano già nelle regole dei task precedenti; non le ho cambiate.

**Eliminazione account:** `users.delete` ora toglie anche `limiti/{uid}`.

## 2. App Check
`src/firebase/appCheck.ts`: `appCheckSiteKey(env)` (pura, testata) e `activateAppCheck` che chiama `initializeAppCheck` con `ReCaptchaV3Provider`. Chiamata in `src/firebase/app.ts` subito dopo `initializeApp`. Senza `VITE_APPCHECK_SITE_KEY` (vuota in `.env.example`) non fa nulla: l'app funziona identica.

## 3. Gestore errori centrale (`src/errors/`)
- `describeError(e)` → `{kind, message, retryable, code}`. Mappa i codici Firebase (con o senza prefisso `firestore/`, `auth/`) in frasi italiane. Un errore con codice o testo "Firebase…" non arriva mai grezzo all'utente; i nostri errori (es. "Il messaggio è troppo lungo") passano così come sono.
- `errorLog.ts`: registro locale (ultimi 30) in `localStorage`, con `try/catch` perché può essere vietato. Salva solo *dove*, *tipo* e *codice*, mai il testo (potrebbe contenere email). `installGlobalErrorLog` cattura anche promesse rifiutate ed errori di script (chiamato in `main.tsx`).
- `errorMessage(e, dove)`: da usare nei `catch`; sostituisce il vecchio `e instanceof Error ? e.message : '…'` in sette punti (azioni di iscrizione, crea evento, chat, miei eventi, profilo, segnalazione, registrazione).
- `LoadFailed` ora ha il pulsante **Riprova** (prop `onRetry`) collegato a elenco eventi, salvati, miei eventi e avvisi.

## Errori incontrati
- Il test delle regole con l'emulatore non si può eseguire nel cloud (il jar dell'emulatore non si scarica): i test in `rules-tests/limits.rules-test.ts` sono scritti, non eseguiti. Ho aggiornato i test esistenti (eventi, chat, segnalazioni) perché ora creano come l'app, cioè con il timbro nel batch (helper `addWithLimit` in `rules-tests/env.ts`).

## Screenshot
`docs/screenshots/44-errore-riprova.png` (e versione scura): illustrazione dell'errore, frase rossa leggibile, pulsante "Riprova" con bordo verde. Presentabile; testo e pulsante ben centrati, contrasto verificato da `check:contrast` e a occhio nei due temi.

## Esercizio
In `src/errors/describeError.ts` aggiungi il codice `cancelled` (operazione annullata) con un messaggio tuo, poi scrivi il test in `errors.test.ts`. Poi prova: cosa succede se `LIMIT_SECONDS.ultimoMessaggio` diventa 5 e non cambi le regole? (Guarda quale test fallisce.)
