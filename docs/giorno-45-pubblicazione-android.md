# Giorno 45 – Preparazione alla pubblicazione Android

**Lettura scelta:** il workflow nuovo NON sta in `.github/workflows/` (il token del PC non ha il permesso `workflow`): è in `docs/pubblicazione/android.workflow.yml` e va copiato a mano (la guida spiega come). Nessuna spesa: l'AAB si produce gratis; l'unica spesa possibile (account Play Console) è solo descritta e lasciata a te.

## 1. Perché cambiare `build.gradle`
Tre pezzi in `android/app/build.gradle`:

```groovy
versionCode Integer.parseInt((project.findProperty('versionCode') ?: '1').toString())
versionName "${project.findProperty('versionName') ?: '1.0'}"
```
`project.findProperty` legge un parametro passato da riga di comando (`-PversionCode=42`). L'operatore `?:` ("Elvis") dà il valore di riserva se il parametro manca, così build a mano continuano a funzionare. Il Play Store rifiuta un `versionCode` già caricato: usare il numero dell'esecuzione del workflow (`github.run_number`) lo fa crescere da solo.

```groovy
signingConfigs { release {
    def storePath = System.getenv('FRIENZY_KEYSTORE_PATH')
    if (storePath && file(storePath).exists()) { storeFile ...; storePassword System.getenv(...) ... }
} }
buildTypes { release { if (signingConfigs.release.storeFile != null) { signingConfig signingConfigs.release } ... } }
```
La firma si legge da variabili d'ambiente: nel repo non c'è nessun segreto. Se le variabili mancano, `storeFile` resta vuoto e il rilascio non viene firmato (non si rompe niente). `System.getenv` = "leggi la variabile d'ambiente".

## 2. Il workflow (`docs/pubblicazione/android.workflow.yml`)
- Parte uguale a prima (APK di debug sempre, stessa configurazione web di Firebase) + `-PversionCode`/`-PversionName`.
- Passo `firma`: guarda se i **quattro** segreti esistono e scrive `presente=true/false` in `$GITHUB_OUTPUT`. I passi successivi hanno `if: steps.firma.outputs.presente == 'true'`: senza segreti si saltano e il workflow resta verde.
- Il file `.jks` si ricrea dal segreto in base64 dentro `$RUNNER_TEMP` (fuori dal repo), si compila con `./gradlew bundleRelease`, si carica l'AAB come artifact e alla fine (`if: always()`) si cancella la chiave dal runner.

## 3. Test (`src/release/publishing.test.ts`, 11 test)
Non possono far girare Gradle né GitHub, quindi controllano la "superficie": Gradle legge le 4 variabili e non contiene password scritte; il workflow passa le stesse variabili e legge i segreti con gli stessi nomi scritti nella guida; `.gitignore` ignora `*.jks`, `*.keystore`, `keystore.properties`, `*.bundle`; la versione è passata sia all'APK sia all'AAB; la config web di Firebase del workflow nuovo coincide riga per riga con quella attuale. Il YAML l'ho anche letto con un parser Python (14 passi, struttura valida).

## Errori e attenzioni
- In Groovy `versionCode (x).toInteger()` si legge come `versionCode(x)` e poi `.toInteger()` sul risultato: ho riscritto con `Integer.parseInt(...)`, che non è ambiguo.
- Ho aggiunto `*.bundle` a `.gitignore`: i file `.bundle` della consegna notturna non devono mai finire nel repo.

## Cosa NON è verificato
Gradle non è stato eseguito (nel cloud non c'è l'Android SDK) e il workflow non ha girato su GitHub: la prima esecuzione vera dirà se `bundleRelease` va a buon fine. Guida completa: `docs/pubblicazione.md`.

## Esercizio
Nella guida, al punto 3, ricava il valore di `ANDROID_KEYSTORE_BASE64` e prova a decodificarlo di nuovo (`base64 --decode`): il file torna uguale (controlla con `sha256sum`)? Poi scrivi un test che verifichi che `docs/pubblicazione.md` nomini tutte e quattro le variabili `FRIENZY_*`.
