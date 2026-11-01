# Giorno 32 – Mappa e Crea evento da app vera

**Lettura scelta:** il task è stato fatto per intero in un solo giro (mappa + Crea a passi), senza spezzarlo. La mappa a schermo intero nasconde l'intestazione e lascia la barra a schede; "Centra su di me" è il pulsante tondo che sale e scende con la scheda.

## Parte 1 – Mappa
- `src/map/typeColors.ts`: un colore per tipo di evento (stesso tono di partenza della copertina). `markers.ts` ora porta anche `color`.
- `src/map/pinHtml.ts`: funzione pura che produce l'HTML del segnaposto a goccia (colore + emoji; classe `is-selected` per ingrandirlo). Emoji e colore vengono solo da costanti: nessun testo utente finisce nell'HTML. Testata.
- `src/map/EventMap.tsx`: tre effetti separati. Il primo crea la mappa una volta; il secondo ridisegna i marker quando cambiano gli eventi (e adatta la vista); il terzo reagisce solo alla selezione: rimette normale il vecchio segnaposto, ingrandisce il nuovo (`setIcon`, `setZIndexOffset`) e sposta la mappa con `panTo`. Le funzioni di callback stanno in un `ref` così i marker non vengono ricreati a ogni render. Toccando lo sfondo si deseleziona.
- `src/map/sheetSnap.ts`: logica pura delle tre altezze (chiusa, metà, estesa): `stepSnap`, `tapSnap` (tocco sulla maniglia), `dragSnap` (trascinamento sopra 24px). Testata.
- `MapSheet.tsx`: la maniglia riconosce il trascinamento con i pointer events e il tocco con `onClick` (così funziona anche da tastiera). A metà mostra la riga dell'evento scelto e il pulsante "Vedi evento"; estesa mostra la lista. `MapTop.tsx`: ricerca e chip per tipo sopra la mappa, riusando `searchEvents` e `filterEvents`. `EventRow.tsx`: riga compatta.
- Il vecchio popup (`popup.ts`) è stato tolto: la scheda lo sostituisce.
- Test in `mapScreen.test.tsx` con la mappa finta (Leaflet non disegna in jsdom).

## Parte 2 – Crea evento a passi
- `src/create/createSteps.ts`: sei passi (tipo, testo, quando, dove, posti, riepilogo). `stepErrors` filtra gli errori già esistenti (`validateEventFields`) sui soli campi del passo; `firstInvalidStep` serve da rete di sicurezza al momento di pubblicare; `bumpSeats` gestisce i tasti più/meno. Tutto testato.
- `CreateEventScreen.tsx` tiene lo stato; `CreateStepBody.tsx` disegna i cinque passi con campi; `CreateSummary.tsx` mostra l'anteprima con la vera `EventCard` (costruita da `buildEvent`) e ciò che resta privato. `ProgressBars.tsx` è l'indicatore condiviso (ora usato anche dalla registrazione).
- `PointPicker` usa lo stesso segnaposto a goccia, del colore del tipo scelto.

## Errori incontrati
- Il test dei posti non trovava il valore: la `label` avvolge due pulsanti e il campo, quindi `getByLabelText` restituiva il primo controllo. Ho usato `getByRole('textbox')`.
- Nelle righe della lista i contenuti si schiacciavano: la griglia dentro un contenitore a altezza fissa restringeva le righe. Risolto con `grid-auto-rows: max-content` e `flex: none` sulla riga.
- La barra di avanzamento si allargava nel percorso Crea perché ereditava `flex: 1` dalla registrazione.
- Gli screenshot cadevano nel banner "sfondo non disponibile": ora il banner non intercetta i tocchi.

## Cosa si vede negli screenshot
Mappa con ricerca e chip, segnaposto a goccia colorati (selezionato più grande), scheda chiusa/a metà/estesa, passi di Crea con una sola azione principale e pulsanti fissi sopra la barra a schede, riepilogo con la scheda in anteprima. Difetti rimasti: senza internet lo sfondo della mappa è grigio (nel telefono vero si vedranno le tessere), e la scheda estesa lascia vedere solo una parte della mappa.

## Esercizio
In `sheetSnap.ts` aggiungi uno `snapAfterSelect()` che restituisce sempre `'half'` e usalo in `MapScreen.select`; poi aggiungi il test.
