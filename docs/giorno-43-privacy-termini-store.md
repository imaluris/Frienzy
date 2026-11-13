# Giorno 43 – Privacy, termini e materiale per lo store

**Lettura scelta (nessuno poteva rispondere):** i testi legali sono pagine web statiche in `public/` (privacy, termini) che l'app apre dal Profilo e dalla registrazione; l'accettazione si registra nel profilo con data e versione; la maggiore età si dichiara con una casella in più della data di nascita. Tutto è una **bozza**: i campi tra parentesi quadre ([nome del titolare], [indirizzo email di assistenza]) e la revisione legale restano ad Andrea. Il task è stato fatto dopo quello del 42, in un giorno a parte.

## Perché queste scelte
- **Pagine web, non schermate dell'app.** Il Play Store vuole comunque un indirizzo web per la privacy; scrivere il testo una volta sola evita due versioni diverse. Il prezzo è che i link funzionano quando le pagine sono pubblicate (e `VITE_WEB_BASE_URL` punta lì): finché il valore è il segnaposto, i link portano a un indirizzo finto.
- **Versione dei testi in un solo punto** (`TERMS_VERSION` in `src/legal/consent.ts`). Un test legge le due pagine e controlla che la riga "Versione 2026-11" coincida: se cambi i testi e dimentichi di alzare la versione, il test ti ferma.
- **Consenso nel documento del profilo** (`consenso: { versione, accettatoIl, maggiorenne }`), perché esiste già e le regole sul profilo lo proteggono. I profili vecchi non hanno il campo: restano validi, `isConsentCurrent` dice se serve richiederlo di nuovo (non è collegato a una schermata: sarà utile quando cambierà la versione).
- **Regole Firestore**: alla creazione il consenso è obbligatorio (`validConsent`: tre chiavi esatte, versione non vuota, data, `maggiorenne == true`); in modifica non si può togliere né alterare in modo non valido, ma un profilo vecchio può aggiungerlo. Così nemmeno un client modificato può creare un account senza accettare. Test emulatore scritti, non eseguiti.

## Il codice, pezzo per pezzo
- `src/legal/consent.ts`: `validateConsent` (prima la maggiore età, poi i termini), `buildConsent` (lancia se mancano le spunte), `isConsentCurrent`.
- `src/legal/ConsentBoxes.tsx`: le due caselle, con link che si aprono in una scheda nuova (`target="_blank" rel="noopener noreferrer"`) per non perdere il form. Il messaggio d'errore sta sotto le caselle e si porta in vista con `scrollIntoView` perché il pulsante Continua è fisso in basso e lo coprirebbe.
- `src/legal/LegalLinks.tsx`: scheda "Informazioni" nel Profilo.
- `saveProfile(..., consent?)`: il consenso nuovo vince, altrimenti si conserva quello esistente, così "Modifica profilo" non lo cancella.
- `converters.ts`: scrittura/lettura del campo con `Timestamp`.
- `OnboardingFlow`: `validateProfileStep(input)` poi `validateConsent(checks)`; i due errori sono separati, così un errore sulle caselle non colora di rosso il campo Nome.
- `docs/store/`: `scheda.md` (testi con limiti controllati da un test), `sicurezza-dati.md`, `classificazione-contenuti.md`, `screenshot.md`, `feature-graphic.svg/.png` (1024×500, generato da `npm run store:graphic` con il marchio dell'app).

## Errori incontrati
1. Nello script degli screenshot avevo definito due volte la stessa funzione e perso la chiamata a `onboarding` (il primo giro è fallito subito): corretto.
2. Primo giro di screenshot: tra le due caselle c'era un vuoto (il `label` globale ha `margin-bottom`) e il messaggio d'errore finiva sotto il pulsante fisso. Corretti con `margin: 0` e lo scorrimento automatico.
3. **Difetto già presente, trovato guardando gli screenshot**: se il permesso di posizione è già concesso, `useMyPosition` legge la posizione da sola appena la schermata compare, e l'effetto di `OnboardingFlow` chiamava `finish()` subito, già sul passo del profilo: errore sul nome (si vede anche nel vecchio screenshot 27) e, con il profilo compilato, la registrazione avrebbe saltato interessi e spiegazione. Ora l'effetto agisce solo quando `step === 'posizione'`; test `permissionGranted.test.tsx` (fallisce con il codice vecchio).
4. Due nomi di screenshot nell'elenco dello store non esistevano: lo ha scoperto il test `storeListing`, che controlla che ogni file elencato esista.

## Screenshot guardati
`74-registrazione-consenso-errore`, `75-registrazione-consenso-ok`, `76-profilo-informazioni` (e le versioni scure). Vedi l'elenco dei difetti nella sezione sotto.

## Esercizio
Scrivi una funzione pura `needsReconsent(profile)` che usa `isConsentCurrent` e decidi dove nell'app chiamarla (suggerimento: guarda dove `ProfileGate` decide cosa mostrare dopo l'accesso).

## Cosa resta ad Andrea
- Pubblicare `public/` a un indirizzo web e impostare `VITE_WEB_BASE_URL`; completare i campi tra parentesi quadre; far rivedere i testi da un professionista.
- Eseguire `npm run test:rules` (nuovi test sul consenso, non eseguibili dal cloud).
- Controllare le risposte per "Sicurezza dei dati" e per la classificazione: sono preparate dal codice ma la responsabilità è dello sviluppatore.
- Rifare gli screenshot dal telefono vero e creare l'account di prova per la revisione di Google.
