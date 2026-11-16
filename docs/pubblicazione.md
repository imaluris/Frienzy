# Pubblicare Frienzy su Android

Guida passo-passo. Tutto quello che si può fare gratis è segnato come tale; l'unica spesa possibile è l'account sviluppatore di Google Play (vedi il punto 5). Senza quella spesa l'app si può comunque distribuire come APK (punto 8).

## Come funziona (in breve)
- Il workflow di GitHub compila **sempre** un APK di debug (come ora).
- Se nel repo ci sono i quattro segreti della firma, compila **anche** un **AAB firmato**, il formato che chiede il Play Store.
- Il numero di versione cresce da solo: `versionCode` = numero dell'esecuzione del workflow, `versionName` = `1.0.<numero>`. Il Play Store rifiuta un AAB con un `versionCode` già usato, per questo non si scrive a mano.
- La chiave di firma non sta MAI nel repo (`*.jks` e `*.keystore` sono in `.gitignore`): vive sul tuo PC e nei segreti di GitHub.

## 1. Copiare il workflow (una volta)
Il token del PC non può pubblicare file in `.github/workflows/`, quindi il file nuovo è in `docs/pubblicazione/android.workflow.yml`. Copialo sopra `.github/workflows/android.yml` (sostituisce quello attuale; la configurazione web di Firebase è identica) e fai commit e push. Puoi anche farlo dal sito di GitHub: apri `.github/workflows/android.yml`, matita "Edit", incolla il contenuto, "Commit changes".

## 2. Creare la chiave di firma (una volta, gratis)
Serve Java (`keytool`). Da un terminale, in una cartella FUORI dal progetto:

```
keytool -genkeypair -v -keystore frienzy-release.jks -alias frienzy -keyalg RSA -keysize 2048 -validity 10000
```

Ti chiede due password (del file e della chiave: puoi usare la stessa) e alcuni dati. **Conserva il file e le password in un posto sicuro (gestore di password + una copia di riserva).** Con Play App Signing (punto 6) Google custodisce la chiave finale e questa è solo la "chiave di caricamento", recuperabile chiedendo un reset a Google; però è meglio non perderla.

## 3. Mettere i segreti su GitHub (una volta, gratis)
Su GitHub: repo `imaluris/Frienzy` → Settings → Secrets and variables → Actions → New repository secret. Crea questi quattro:

| Nome | Valore |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | il file `.jks` convertito in testo (vedi sotto) |
| `ANDROID_KEYSTORE_PASSWORD` | la password del file |
| `ANDROID_KEY_ALIAS` | `frienzy` (l'alias scelto sopra) |
| `ANDROID_KEY_PASSWORD` | la password della chiave |

Per convertire il file in testo: su Windows PowerShell `[Convert]::ToBase64String([IO.File]::ReadAllBytes("frienzy-release.jks")) | Set-Clipboard` (lo copia negli appunti); su Mac/Linux `base64 -w0 frienzy-release.jks`.

(Resta anche il segreto `GOOGLE_SERVICES_JSON` per le notifiche, come prima.)

## 4. Ottenere l'AAB
GitHub → Actions → l'ultima esecuzione "Android" → in fondo "Artifacts": `frienzy-release-aab` (file `app-release.aab`, da caricare sul Play Store) e `frienzy-debug-apk` (per provare sul telefono). Se manca `frienzy-release-aab`, nel log del passo "Controlla se la firma è configurata" c'è scritto che un segreto manca.

## 5. Account sviluppatore Google Play (DECISIONE TUA: ha un costo)
Per pubblicare sul Play Store serve un account Google Play Console. **Ha una tassa di iscrizione una tantum** (a oggi circa 25 dollari, da verificare sulla pagina ufficiale di Play Console prima di pagare). Non c'è un abbonamento annuale, ma è una spesa e richiede un metodo di pagamento: la regola del progetto è "zero spese", quindi decidi tu. Se non vuoi spendere, salta al punto 8.

Per un account personale nuovo Google ha richiesto un **test chiuso** prima della pubblicazione pubblica (negli ultimi anni: almeno 12 tester per 14 giorni). Le regole cambiano: leggi i requisiti aggiornati nella console prima di organizzare i tester.

## 6. Primo caricamento
1. Play Console → Crea app: nome "Frienzy", lingua italiano, app (non gioco), gratuita.
2. Dichiarazioni: usa le risposte già pronte in `docs/store/` (scheda, sicurezza dei dati, classificazione dei contenuti). Rileggile: sei tu a dichiararle.
3. Privacy policy: l'indirizzo web della pagina `public/privacy.html` (devi prima pubblicare `public/` a un indirizzo web: vedi `docs/giorno-43-privacy-termini-store.md`). Stesso discorso per la pagina di eliminazione account (`public/eliminazione-account.html`) con l'email di assistenza vera.
4. Account di prova per la revisione: crea un account Frienzy di prova e scrivi email e password nelle "Istruzioni di accesso" per Google.
5. Test → Test chiuso → Crea release: attiva Play App Signing quando richiesto, carica `app-release.aab`, scrivi le note di versione, salva.
6. Aggiungi i tester (indirizzi email Google o una lista), invia la release in revisione e passa il link di invito ai tester.
7. Passati i requisiti del test chiuso: Produzione → Crea release → carica un AAB più recente (il `versionCode` deve essere maggiore) → Invia.

Per ogni aggiornamento: fai push su `main`, scarica il nuovo AAB e caricalo in una nuova release.

## 7. Prima di caricare: lista di controllo
- Prova l'APK di debug sul telefono (login, crea evento, mappa, chat, notifiche).
- Regole Firestore pubblicate (`firebase deploy --only firestore:rules` dal PC, comprese le raccolte nuove dei task 40-44).
- Testi legali rivisti e campi tra parentesi quadre completati.
- Screenshot veri dal telefono (vedi `docs/store/screenshot.md`).

## 8. Distribuire l'APK senza Play Store (nessuna spesa)
1. Da GitHub → Actions scarica `frienzy-debug-apk` (zip con `app-debug.apk`) e mandalo agli amici con il canale che preferisci (messaggio, link di Drive).
2. Sul telefono di chi lo riceve: aprire il file; Android chiede di consentire l'installazione da "questa fonte" (Impostazioni → app → Installa app sconosciute). È una procedura normale per app fuori dallo store.
3. Limiti: nessun aggiornamento automatico (va reinviato l'APK nuovo), compare l'avviso "app non verificata", e l'APK di debug non è firmato con la tua chiave di rilascio. Per distribuirlo in modo più ordinato puoi usare le "Release" di GitHub (repo pubblico, gratuito): allega l'APK a una release e condividi il link.
4. Per un APK firmato con la tua chiave (aggiornabile sopra le versioni precedenti) dalla stessa chiave del punto 2: in Android Studio, Build → Generate Signed App Bundle/APK → APK, oppure `./gradlew assembleRelease` con le quattro variabili `FRIENZY_*` impostate.

## Variabili usate da Gradle
`FRIENZY_KEYSTORE_PATH`, `FRIENZY_KEYSTORE_PASSWORD`, `FRIENZY_KEY_ALIAS`, `FRIENZY_KEY_PASSWORD` (le imposta il workflow dai segreti sopra). Parametri `-PversionCode` e `-PversionName` per il numero di versione.
