# Giorno 42 – Modifica evento e condivisione

**Lettura scelta (nessuno poteva rispondere):** "modifica con avviso ai partecipanti" senza spendere → l'avviso passa dalla scheda *Avvisi* già esistente (nessuna Cloud Function, nessun invio push nuovo). La condivisione usa il pannello del telefono con un link che contiene solo l'id dell'evento.

## Perché queste scelte
- **Logica pura in `src/events/editRules.ts`**: `canEdit` (chi/quando), `validateEdit` (campi + posti ≥ confermati), `diffEdit` (cosa è cambiato davvero), `describeChanges` (frase in italiano). Sono funzioni senza accesso ai dati: si testano in un attimo.
- **Servizio `editEvent.ts`**: legge l'evento, controlla, conta i confermati, scrive *solo* i campi cambiati più `modificatoIl` e `modifiche`. Se non cambia nulla non scrive e non avvisa.
- **Avviso agli iscritti**: l'evento ora può avere `modificatoIl` e `modifiche` (elenco dei campi toccati). `buildAlerts` crea un avviso "«Cena» è cambiato – L'organizzatore ha aggiornato data e ora" per chi è confermato o ha una richiesta, per 7 giorni. Usa l'interruttore *Risposte* già presente (nessuna nuova preferenza). La chiave include l'istante della modifica: una seconda modifica torna "nuova".
- **Regole Firestore (`validEventEdit`)**: cambiano solo titolo, descrizione, data, posti, stato e i due campi di avviso; i posti non scendono sotto il contatore dei confermati; la nuova data è nel futuro; `modificatoIl` deve essere l'ora del server (`request.time`), quindi non si falsifica. Tipo, zona, posizione e approvazione restano bloccati.
- **Condivisione**: `src/config/links.ts` costruisce `https://<base>/evento/<id>`; la base viene da `VITE_WEB_BASE_URL` (valore finto in `.env.example`). Il pannello del telefono riceve `url`; se manca, negli appunti va testo + link. L'evento pubblico non contiene l'indirizzo esatto, quindi non può finire nel testo.

## Codice, pezzo per pezzo
```ts
// editRules.ts – la data del form ha precisione al minuto
if (dataOra && input.dataOra !== toInputValue(event.dataOra)) { ... }
```
## Errore incontrato
Il primo test della schermata segnava `dataOra` come modificata anche cambiando solo il titolo: l'evento aveva secondi e millisecondi, il campo `datetime-local` no. Soluzione: confrontare al minuto (e test dedicato).

## Screenshot guardati
`72-modifica-evento` e `73-modifica-evento-errore` (390x844). Dopo un primo giro lo spazio tra i campi era doppio (margine del campo + `gap`): tolto il `gap`. Ora allineamenti, gerarchia e pulsante principale sono ordinati; presentabile.

## Esercizio
Aggiungi a `describeChanges` il caso di un evento in cui cambia solo la descrizione e scrivi il test; poi prova a far comparire un avviso anche per l'annullamento dell'evento (suggerimento: guarda `isLive` in `buildAlerts`).

## Cosa resta ad Andrea
Eseguire `npm run test:rules` (nuovo file `rules-tests/eventEdit.rules-test.ts`, non eseguito dal cloud) e impostare `VITE_WEB_BASE_URL` con l'indirizzo web vero. Il link `/evento/<id>` apre l'app solo quando saranno configurati i link profondi (App Links): non fatto qui. L'invio push per le modifiche non c'è: l'avviso compare in *Avvisi*.
