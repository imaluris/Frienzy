# Giorno 36: elimina account

**Lettura scelta (nessuno poteva rispondere):** "cancella profilo, iscrizioni, messaggi propri e account di accesso" l'ho letto come eliminazione vera dei dati personali di Andrea o di chiunque; gli eventi passati restano come storico (senza più il profilo dell'organizzatore) e quelli futuri organizzati vengono annullati, non cancellati (un evento non si cancella mai, come da regole).

## Perché queste scelte
- **Ordine delle operazioni.** È la parte delicata: dopo aver cancellato l'account di accesso non si è più autorizzati a scrivere su Firestore, quindi l'accesso va per ULTIMO. Prima di tutto si controlla la password (se è sbagliata non si è toccato niente). Poi, finché si è ancora iscritti o organizzatori (e le regole lo permettono): messaggi, annullamento eventi, ritiro dalle iscrizioni; quindi salvati, blocchi, profilo; infine l'account.
- **Riprovare è sicuro.** Il piano (`planDeletion`) si ricalcola dai dati attuali a ogni tentativo: se la rete cade a metà, la volta dopo ripartono solo le cose rimaste. L'errore dice a che fase si è fermato.
- **Due passi** nell'interfaccia: prima l'avviso (con il numero di eventi che verranno annullati), poi la password. "Torno indietro" è il pulsante sicuro.
- **Pagina web** `public/eliminazione-account.html`: il Play Store chiede un link con le istruzioni; Vite la copia nella build, quindi sarà raggiungibile all'indirizzo del sito dell'app.

## Il codice, pezzo per pezzo
- `src/account/deletionPlan.ts`: funzione pura. Dati: eventi, mie partecipazioni, data di oggi. Risultato: quali eventi annullare (solo i miei, futuri e non già annullati), in quali eventi pulire i messaggi (quelli che organizzo e quelli dove sono confermato: altrove non potrei nemmeno leggerli), da quali iscrizioni ritirarsi (tutte).
- `src/account/deleteAccount.ts`: esegue le fasi nell'ordine di `DELETION_STEPS`. L'helper `run` segna la fase corrente e, se qualcosa va storto, lancia `AccountDeletionError(fase, causa)`. `countEventsToCancel` serve alla finestra di conferma.
- Nuovi metodi nei contratti: `AuthService.reauthenticate/deleteAccount`, `UserRepository.delete`, `SavedRepository.clear`, `BlockRepository.unblockAll`, `ChatRepository.removeOwn`: ognuno con versione in memoria e Firestore. Su Firestore le cancellazioni multiple usano `deleteInBatches` (gruppi da 400, il limite è 500).
- Firebase Auth: `reauthenticateWithCredential` con la password, poi `deleteUser` (scritti ma non eseguiti: nel cloud non c'è Firebase vero).
- Regole: il profilo lo cancella solo il proprietario; un messaggio lo cancella l'organizzatore **o chi l'ha scritto** (prima solo l'organizzatore: ho aggiornato il test di regole della chat di conseguenza).
- `DeleteAccountSheet`: i due passi; l'errore "Password errata." è tradotto, quelli a metà dicono quale fase e che riprovare è sicuro. Se tutto va bene l'utente risulta scollegato e l'app torna da sola al benvenuto.

## Errori incontrati e come risolti
- Lo screenshot del secondo passo falliva: in Playwright `getByLabel('Password')` trova anche la finestra "Conferma con la password" (cerca per parte di testo): ho usato `exact: true`.
- La frase di avviso era grammaticalmente sbagliata al plurale ("2 eventi … che non è ancora passato"): ora cambia tra singolare e plurale.
- Il collegamento "Elimina account" restava verde: la regola `button.link` era più specifica della mia; ho scritto `button.link.danger-link`.

## Cosa si vede negli screenshot (53, 54, 18)
Avviso a finestra dal basso con pulsante rosso "Continua" e frase evidenziata sugli eventi da annullare; secondo passo con campo password in rosso e "Password errata."; nel Profilo il collegamento rosso "Elimina account" sopra "Debug". Difetto residuo: lo spazio tra i due collegamenti in fondo al Profilo è un po' ampio (tocco da 48px).

## Non verificato
Firebase Auth reale (nuova autenticazione e cancellazione dell'account) e `npm run test:rules` (regole su profilo e messaggi): vanno provati con Firebase e con l'emulatore. I segnalazioni/blocchi fatti da altri verso l'utente restano (lo dice la pagina web).

## Esercizio per Andrea
In `deleteAccount.ts` sposta la riga `await run('account', …)` prima di quella `'profilo'` e lancia i test: quale test diventa rosso, e perché nella realtà (con Firebase vero) sarebbe un ordine pericoloso?
