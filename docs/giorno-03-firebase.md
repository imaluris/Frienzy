# Giorno 3 – Implementazione Firebase dietro le interfacce

**Lettura scelta:** il task dice "repository reali su Firestore, wrapper di Auth, config da env". Ho letto "wrapper di Auth" come una nuova interfaccia `AuthService` (come i repository) con l'implementazione Firebase accanto. Nulla di questo codice viene eseguito qui: si compila e si testano solo le parti pure (config e convertitori).

## Perché queste scelte

- **Interfacce prima, Firebase dopo.** L'app parla con `UserRepository`, `EventRepository`, `ParticipationRepository`, `AuthService`. Solo `src/firebase/createServices.ts` sa che dietro c'è Firebase. Per i test si usa la memoria; per cambiare database basta riscrivere quella cartella.
- **File piccoli, uno per responsabilità:** `config.ts` (legge le variabili), `app.ts` (avvia Firebase), `converters.ts` (Date ⇄ Timestamp), un file per ogni repository.
- **Config da variabili d'ambiente.** Vite espone solo le variabili che iniziano con `VITE_`. `.env.example` contiene valori *finti*; il tuo `.env` vero è nel `.gitignore`.
- **Date solo ai bordi.** Firestore usa `Timestamp`; il resto dell'app usa `Date`. La conversione avviene solo in `converters.ts`, così è testabile senza Firebase.

## Codice pezzo per pezzo

### `config.ts`
`KEYS` collega ogni campo della config al nome della variabile. `readFirebaseConfig(env)` prende l'ambiente come *parametro* (non legge `import.meta.env` da sé): è una funzione pura, quindi nel test le passo un oggetto qualsiasi. Se manca qualcosa, l'errore elenca i nomi mancanti, molto più utile di un generico "undefined".

### `app.ts`
`firebaseApp()` inizializza Firebase una sola volta (`getApps().length`), poi `db()` e `auth()` restituiscono Firestore e Auth. Sono funzioni, non costanti: l'inizializzazione avviene solo quando serve davvero, non appena si importa il file. Così i test che non toccano Firebase non richiedono la config.

### `converters.ts`
Coppie `…ToData` / `…FromData`. Due dettagli:
- `userFromData` filtra gli interessi con `isEventTypeId`: se in database finisce un id sconosciuto, l'app non si rompe.
- La partecipazione salva anche `uid` ed `eventId` dentro il documento. Serve alla ricerca "le mie iscrizioni" (vedi sotto).

### `firestoreEventRepository.ts`
`create` usa un **batch**: scrive l'evento pubblico e `privato/luogo` insieme, o tutti e due o nessuno. L'id lo genera Firestore (`doc(collection(...))`) e `creatoIl` è `serverTimestamp()`, cioè l'ora del server, non del telefono. Dopo la scrittura rileggo l'evento per restituirlo completo.

### `firestoreParticipationRepository.ts`
`listByUser` usa `collectionGroup('partecipanti')`: cerca in tutte le sotto-raccolte con quel nome, filtrando `uid`. Per questo `uid` sta nel documento.

### `firebaseAuthService.ts`
Tre funzioni di Firebase (`createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, `signOut`) nascoste dietro `AuthService`. `onChange` avvolge `onAuthStateChanged` e restituisce la funzione per smettere di ascoltare.

## Errori incontrati
- `update` del repository eventi: la prima versione convertiva la data con un trucco di tipo (`as NewEvent`) poco leggibile. L'ho sostituita con una conversione diretta `Timestamp.fromDate`.

## Da sapere (per quando proverai l'app)
- La ricerca `collectionGroup` può richiedere di abilitare un indice per il gruppo `partecipanti` nella console Firestore; se manca, l'errore nel browser contiene il link per crearlo.
- Le regole di sicurezza arrivano al task 6: finché non ci sono, Firestore in produzione rifiuta (o accetta, secondo come l'hai creato) le scritture.

## Esercizio
In `converters.ts` aggiungi un test in `firebase.test.ts`: un evento con `dataOra` il 29 febbraio 2028 deve tornare identico dopo `newEventToData` → `eventFromData`. Poi prova a togliere `.filter(isEventTypeId)` in `userFromData` e osserva quale test fallisce.
