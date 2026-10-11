# Giorno 4 – Registrazione, login e logout

**Lettura scelta:** il task dice "schermate e logica, testate con il repository in memoria". Ho letto che la registrazione crea **solo l'account** (email + password): data di nascita, bio e interessi arrivano al task 5 (Profilo). Per testare serviva anche un `AuthService` finto, quindi ho scritto `MemoryAuthService` accanto agli altri servizi in memoria.

## Perché queste scelte

- **Validazione separata dalle schermate** (`validation.ts`): sono funzioni pure che restituiscono un messaggio o `null`. Si testano senza disegnare nulla.
- **Errori tradotti in un solo posto** (`errorMessages.ts`): Firebase mette un `code` sugli errori (`auth/email-already-in-use`…). La versione in memoria usa gli *stessi codici*, così le schermate non sanno quale delle due sta usando.
- **Servizi passati dall'alto** (`ServicesContext`): `main.tsx` crea i servizi Firebase, i test passano quelli in memoria. Le schermate chiamano `useServices()` e basta.
- **Un solo form per due schermate** (`AuthForm`): login e registrazione cambiano solo titolo, campo "ripeti password" e azione.

## Codice pezzo per pezzo

### `auth/validation.ts`
`validateEmail` usa un'espressione regolare semplice (`qualcosa@qualcosa.qualcosa`, niente spazi): controlla la forma, non l'esistenza della casella. `validateRegistration` concatena i controlli con `??`: restituisce il *primo* errore trovato; se tutti danno `null` vince l'ultimo controllo, quello sulla conferma.

### `auth/memoryAuthService.ts`
Tiene gli account in una `Map` (email in minuscolo → uid e password). Due comportamenti copiano Firebase di proposito: dopo `register` l'utente è già dentro, e `onChange` avvisa subito il nuovo ascoltatore con lo stato attuale. `setUid` è l'unico punto che cambia l'utente e avvisa tutti.

### `auth/useSession.ts`
Un *hook* React: si iscrive a `auth.onChange` dentro `useEffect` e restituisce `{ ready, uid }`. `ready` è `false` finché Firebase non ci dice se c'è già qualcuno (evita di far lampeggiare la schermata di login). La funzione restituita da `onChange` è anche la "pulizia" dell'effect.

### `screens/AuthForm.tsx`
Tiene in `useState` email, password, conferma, errore e `busy`. In `handleSubmit`: `preventDefault()` ferma il ricaricamento della pagina, poi valida; se c'è un problema lo mostra e si ferma, altrimenti chiama `onSubmit` in `try/catch/finally` (il `finally` riabilita il pulsante in ogni caso). L'errore ha `role="alert"`, utile ai lettori di schermo e ai test.

### `App.tsx`
`Router` sceglie tra "Caricamento", `HomeScreen` (collegato) e `LoggedOut` (login o registrazione).

## Errori incontrati
- **Il test del logout falliva**: dopo l'uscita si tornava alla schermata *Registrati* invece che al login. Lo stato "sto registrando" stava in `Router`, che non sparisce mai. L'ho spostato nel componente `LoggedOut`: quando l'utente entra, `LoggedOut` viene smontato e perde lo stato; al prossimo logout riparte da zero. Lezione: lo stato vive nel componente che deve "dimenticarlo".
- Il mio repository locale era indietro rispetto a `origin/main`: ho fatto un fast-forward prima di scrivere codice.

## Esercizio
Aggiungi in `validation.ts` la regola "la password deve contenere almeno un numero" (nuova funzione + test in `validation.test.ts`). Poi decidi dove chiamarla in `validateRegistration`: prima o dopo il controllo sulla lunghezza? Come cambia il messaggio mostrato?
