# Giorno 17 – Workflow GitHub Actions per l'APK di debug

## Lettura scelta
"Rendere scaricabile" l'APK l'ho letto come: caricarlo come *artifact* della run (si scarica dalla pagina Actions del repo, resta 90 giorni). Non creo release né pubblico nulla. Il workflow parte a ogni push su `main` e a mano (`workflow_dispatch`).

## Perché queste scelte
- **Tutto in un file** `.github/workflows/android.yml`, a passi piccoli e con nomi in italiano.
- **Il secret non entra mai nel repo**: un passo scrive `GOOGLE_SERVICES_JSON` in `android/app/google-services.json` (file ignorato da git). Se il secret manca, il passo lo dice e si compila lo stesso: il plugin Gradle del task 16 si applica solo se il file esiste.
- **Build web con valori finti** per le variabili Firebase, come in locale: serve solo a far compilare.
- **Java 21** perché il plugin Android di Gradle usato da Capacitor 8 lo richiede.

## Il codice, pezzo per pezzo
- `on: push (main) + workflow_dispatch`: quando parte.
- `setup-node` con `cache: npm` e `npm ci`: installazione ripetibile e veloce.
- Passo "Ricrea google-services.json": il secret arriva in una variabile d'ambiente (mai scritto nella riga di comando, così non finisce nei log); `printf '%s'` lo scrive senza alterarlo.
- `npm run build` poi `npx cap sync android`: porta la web app dentro il progetto Android.
- `./gradlew assembleDebug --no-daemon` dentro `android/`: compila l'APK. `gradlew` è nel repo con permesso di esecuzione (100755).
- `upload-artifact`: pubblica `app-debug.apk` col nome `frienzy-debug-apk`.

## Errori incontrati
Nessuno: il push dei workflow è stato accettato e la run è finita con `success` (verificata con `gh api repos/imaluris/Frienzy/actions/runs`), con l'artifact `frienzy-debug-apk`. Nota: la run è senza secret finché non lo aggiungi tu, quindi quell'APK non riceve notifiche.

## Esercizio
Aggiungi un passo che esegua `npm test` prima della compilazione, così un test rotto blocca l'APK. Dove lo metteresti rispetto a `npm run build`?
