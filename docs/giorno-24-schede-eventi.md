# Giorno 24 – Schede evento e stati vuoti

**Lettura scelta:** il task chiede card per elenco e dettaglio, badge e stati vuoti. Nell'elenco non conosco i posti già occupati (servirebbe una query per ogni evento), quindi la scheda mostra il massimo ("Fino a 8 persone"); il conteggio reale resta nel dettaglio dell'organizzatore.

## Perché queste scelte
- **Un solo componente per le schede** (`src/ui/EventCard.tsx`) usato da Eventi e I miei eventi: se cambi l'aspetto, cambia ovunque.
- **Logica fuori dal componente**: `src/events/badges.ts` decide le etichette (Annullato / Su approvazione / Accesso libero) con una funzione pura, facile da testare.
- **Tutta la scheda è un pulsante** (area di tocco grande, adatta al telefono). Il footer ("Annulla evento", "Ritirati") è fuori dal pulsante: un pulsante dentro un altro pulsante non è HTML valido.

## Il codice, pezzo per pezzo
- `format.ts`: `formatShortDate` usa `Intl.DateTimeFormat('it-IT')` due volte (giorno e ora) e toglie i punti ("ott." → "ott"). `describePlacesShort` è la frase dei posti.
- `badges.ts`: se l'evento è annullato restituisce solo quel badge (ha la precedenza), altrimenti sceglie in base a `richiedeApprovazione`.
- `EventCard.tsx`: riquadro con emoji colorato per tipo (`type-trekking` ecc. in CSS), titolo, data, zona e posti, badge. `note` aggiunge un badge (es. "Confermato" nelle iscrizioni).
- `EmptyState.tsx`: emoji grande più una frase, al posto del semplice paragrafo grigio.
- `EventInfo.tsx`: parte alta del dettaglio con emoji grande, titolo, badge e righe Quando / Zona / Indirizzo / Posti. L'indirizzo compare solo se `place` esiste, cioè solo per organizzatore e confermati: la regola di privacy non è cambiata.
- `event-card.css`: nuovo file di stili; il vecchio `.event-item` è stato tolto da `lists.css`.

## Errori incontrati
- Nel modificare l'import del dettaglio era rimasta una riga orfana (`from '../events/format'`): il build l'ha segnalata e l'ho tolta.
- Il test sul dettaglio cercava il testo "Zona: Navigli"; ora zona ed etichetta sono su due righe, quindi cerca "Navigli".

## Cosa ho visto negli screenshot (390x844)
- Elenco: schede bianche con ombra leggera, emoji su fondo tenue, badge beige o senape; molto più ordinato di prima.
- Dettaglio: icona grande, titolo, righe con icone, "Chi c'è" con avatar; pulsante Partecipa ben visibile.
- I miei eventi: l'evento annullato è sbiadito con badge rosso chiaro.
- Difetti rimasti (per gravità): 1) i filtri in cima all'elenco occupano quasi mezzo schermo, da compattare; 2) la barra a schede compare a metà pagina solo negli screenshot a pagina intera (effetto dello strumento, non dell'app); 3) i campi data mostrano il formato americano mm/dd/yyyy dentro Chromium.

## Controlli
Build, lint e 179+ test passano (nuovi: badge e formati brevi); `check:contrast` verde con 3 coppie nuove.

## Esercizio
Aggiungi un badge "Ultimi posti" in `badges.ts` quando `maxPartecipanti` è 4 o meno, e scrivi il test in `badges.test.ts`. Poi controlla nello screenshot dove finisce.
