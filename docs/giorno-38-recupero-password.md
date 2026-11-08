# Giorno 38: recupero password e verifica email

**Lettura scelta (nessuno poteva rispondere):** la verifica email *non blocca* l'uso dell'app: compare un avviso nel Profilo con i pulsanti "Rinvia l'email" e "Ho confermato". Bloccare chi non ha ancora cliccato il link avrebbe fatto perdere utenti per poco; resta una decisione da riprendere se si vorrà renderla obbligatoria. L'email di conferma parte da sola alla registrazione.

## Perché queste scelte
- **Messaggio uguale per ogni indirizzo valido.** "Se esiste un account con questa email, ti abbiamo inviato un link": così nessuno può scoprire chi è iscritto provando indirizzi a caso. La versione in memoria si comporta allo stesso modo (nessun errore per un indirizzo sconosciuto, ma neanche email "spedita").
- **Attesa tra due invii (60 secondi).** Evita raffiche di richieste e il blocco del server (`auth/too-many-requests`). La regola dei secondi è una funzione pura, `resendWaitSeconds`, che riceve l'ora da fuori: si testa senza aspettare.
- **L'invio alla registrazione è "di più".** Se l'email di conferma non parte (rete assente) la registrazione resta valida: `.catch(() => undefined)`; il Profilo la proporrà di nuovo.
- **Stato aggiornato dal server.** In Firebase `emailVerified` non si aggiorna da solo: `isEmailVerified()` fa `user.reload()` prima di rispondere, così "Ho confermato" funziona anche se il link è stato aperto su un altro telefono.

## Il codice, pezzo per pezzo
- `authService.ts`: tre metodi nuovi nel contratto (`sendPasswordReset`, `sendVerificationEmail`, `isEmailVerified`).
- `memoryAuthService.ts`: ogni account ha `verified` e un contatore di invii; `sentEmails` elenca cosa sarebbe partito (i test lo guardano); `confirmEmail` simula il clic sul link; dopo 5 invii risponde `auth/too-many-requests`, come Firebase.
- `firebaseAuthService.ts`: usa `sendPasswordResetEmail`, `sendEmailVerification` e `reload()` (scritto, non eseguito); lingua italiana.
- `emailActions.ts`: `requestPasswordReset` (controlla l'indirizzo con `validateEmail`, poi chiede l'invio) e `resendWaitSeconds`.
- `useCooldown.ts`: piccolo hook con un orologio che ticchetta ogni secondo solo mentre c'è un'attesa.
- `ForgotPasswordScreen.tsx`: una domanda sola (l'email); dopo l'invio mostra il messaggio e il pulsante diventa "Puoi rinviarlo tra N s". `LoginScreen` ha il link "Password dimenticata?", `App.tsx` un modo `forgot` (la freccia indietro torna all'accesso).
- `VerifyEmailBanner.tsx`: appare nel Profilo solo se la verifica è `false` (se non si riesce a saperlo, nessun avviso: meglio niente di uno sbagliato).

## Errori incontrati
- La prima versione dei pulsanti dell'avviso andava a capo (il link finiva sotto): ho accorciato "Invia di nuovo l'email" in "Rinvia l'email" e ridotto i margini del link.
- Lo screenshot dell'avviso partiva a pagina scorsa (il clic porta il pulsante in vista): il passo ora risale in cima prima di scattare.

## Cosa si vede negli screenshot (18, 57, 58, 59)
Schermata "Password dimenticata?" nella stessa scheda dell'accesso; dopo l'invio un riquadro verde con l'icona della busta e il pulsante disattivato "Puoi rinviarlo tra 60 s"; nel Profilo un riquadro senape "Conferma la tua email" con i due pulsanti sulla stessa riga. Presentabile. Difetto residuo: l'avviso occupa spazio sopra le statistiche finché non si conferma.

## Non verificato
Firebase vero: l'invio reale delle email, il testo del messaggio (si modifica dalla console, sezione Authentication → Modelli) e il comportamento di `reload()`.

## Esercizio
Cambia `RESEND_COOLDOWN_MS` a 30 secondi e aggiorna il test in `emailActions.test.ts` (i numeri 60 e 45): quali righe devi toccare?
