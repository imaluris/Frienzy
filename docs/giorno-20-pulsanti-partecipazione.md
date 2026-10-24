# Giorno 20 – Pulsanti di partecipazione

## Lettura scelta
Il task chiede di collegare alla schermata di dettaglio le funzioni già esistenti (`joinEvent`, `respondToRequest`, `withdrawFromEvent`, `cancelEvent`). Ho scelto di **non toccare le regole** (posti, permessi): restano nelle funzioni pure e nelle transazioni. Il nuovo codice decide solo *cosa mostrare* e *chiama* le funzioni. La grafica fine arriva nei task 21-24: qui i pulsanti sono funzionanti e puliti, ma lo stile è ancora quello di base.

## Perché queste scelte
- **Una funzione pura per scegliere la vista** (`decideView`): dati evento, utente, la sua iscrizione e il numero di confermati restituisce una parola (`partecipa`, `chiedi`, `pieno`, `richiesta`, `confermato`, `rifiutato`, `annullato`, `chiuso`, `organizzatore`). Le funzioni pure si testano senza schermo.
- **Pieno solo se libero**: con approvazione la richiesta non occupa posti (come in `decideJoin`), quindi anche a posti finiti si può chiedere.
- **Errori dopo il click**: se i posti finiscono mentre l'utente preme (qualcuno arriva prima), il repository risponde "Posti esauriti" e la schermata lo mostra in un messaggio; poi ricarica i dati.
- **Un contatore `version`** nel dettaglio: a ogni azione sale di uno e fa ricaricare evento, persone, luogo e iscrizione. Più semplice che aggiornare a mano ogni pezzo.

## Il codice, pezzo per pezzo
- `src/participation/participationView.ts`: la funzione `decideView` (vedi sopra). L'ordine dei controlli conta: prima l'organizzatore, poi la propria iscrizione, poi lo stato dell'evento, infine posti.
- `src/participation/useEventParticipation.ts`: hook che carica i dati. L'organizzatore legge *tutte* le iscrizioni (e i nomi di chi ha chiesto); gli altri solo la propria (`get`) e i confermati (`listConfirmed`), perché le regole di Firestore non permettono altro.
- `src/participation/useRunAction.ts`: piccolo hook che esegue un'azione, tiene `busy` (spegne i pulsanti, evita doppi click) ed `error`; alla fine chiama `onDone` anche se è fallita, perché i dati potrebbero essere cambiati.
- `src/screens/ParticipationActions.tsx`: pulsanti per chi non organizza (Partecipa / Chiedi di partecipare / Ritirati / Ritira la richiesta) e frasi informative.
- `src/screens/OrganizerActions.tsx`: richieste con Accetta/Rifiuta (con `aria-label` col nome, utile ai test e all'accessibilità), posti occupati e Annulla evento.
- `EventDetailScreen.tsx`: sceglie quale dei due pannelli mostrare. `useExactPlace` ha ora un parametro `refreshKey` così l'indirizzo compare appena si è confermati.
- Demo: aggiunto "Brunch della domenica" (organizzato da Andrea, con due richieste) per vedere il pannello; due nuovi screenshot (15, 16, 17).

## Errori incontrati
Nessuno bloccante. Un test creava un evento di troppo (resto del setup): innocuo, ma da pulire se lo si riscrive.

## Cosa ho visto negli screenshot
- `05-dettaglio-pieno`: messaggio "Posti esauriti", nessun pulsante: chiaro.
- `15-dopo-partecipa`: frase di conferma e pulsante "Ritirati" (bordo verde); compare anche l'indirizzo esatto.
- `17-organizzatore-richieste`: richieste con Accetta (terracotta) e Rifiuta (bordo), poi Annulla evento. Leggibile; all'inizio il pulsante secondario era troppo vicino al link "Torna all'elenco" e l'ho distanziato.
- Difetti rimasti (task successivi): dettaglio ancora un lungo elenco di paragrafi, nessun avatar, nessuna barra a schede.

## Esercizio per Andrea
In `participationView.ts` aggiungi la vista `'iniziato'` per un evento già passato (usa `event.dataOra < new Date()`), poi in `ParticipationActions.tsx` aggiungi la frase da mostrare e un test in `participationView.test.ts`.
