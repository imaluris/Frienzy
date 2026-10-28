# Giorno 25 – Crea evento (punto sulla mappa, tipo con emoji, errori accanto ai campi)

**Lettura scelta:** il task chiede tre cose sul form "Crea evento": scegliere il punto toccando la mappa, scegliere il tipo con tasti con emoji, mostrare gli errori accanto a ogni campo. Latitudine e longitudine non si scrivono più a mano: le riempie il tocco sulla mappa. L'indirizzo esatto resta un campo di testo separato dalla zona (già era così nel dominio).

## Perché queste scelte
- **Errori per campo, non uno solo.** Prima `validateEvent` restituiva solo il *primo* errore. Ora `validateEventFields` (`src/events/fieldErrors.ts`) riusa le stesse funzioni di `validation.ts` ma raccoglie un messaggio per campo in un oggetto. `validateEvent` resta com'è: `createEvent` lo usa ancora come ultima difesa.
- **Il punto è un "campo" come gli altri**: la chiave `punto` nell'oggetto errori. Se mancano lat e lng il messaggio è "Tocca la mappa…", altrimenti si controllano i limiti.
- **La mappa nasce una volta sola.** In `PointPicker` il primo `useEffect` (dipendenze `[]`) crea la mappa Leaflet; un secondo `useEffect` sposta il segnaposto quando cambia il valore. Se ricreassi la mappa a ogni tocco, perderesti zoom e posizione. `onPick` passa da un `useRef` così il click handler vede sempre l'ultima funzione senza ricreare la mappa.
- **Tile assenti**: se i tasselli non si caricano la mappa è grigia ma il tocco funziona lo stesso (si vede nello screenshot).
- **Componenti piccoli**: `Field` (etichetta + campo + errore), `TypeSelector` (gruppo `radiogroup` con `aria-checked`), `LocationField` (mappa + testo di conferma + errore), `PointPicker` (Leaflet). `CreateEventScreen` li compone.

## Codice, pezzo per pezzo
- `change(field, patch)` in `CreateEventScreen`: aggiorna il valore e cancella l'errore di quel campo, così l'errore sparisce appena si corregge.
- `handleSubmit`: calcola gli errori; se ce n'è anche uno si ferma senza chiamare il servizio; altrimenti `createEvent`. Il tocco sulla mappa scrive `lat/lng` come testo con 6 decimali (`toFixed(6)`), perché `EventInput` è tutto testo.
- `aria-invalid` sui campi sbagliati colora il bordo di rosso (regola già in `forms.css`); il messaggio ha `role="alert"`.
- Stili nuovi in `src/styles/create.css` (importato da `styles.css`, 20 righe).

## Errori incontrati
1. Il test usava `listUpcoming`, che non esiste: il metodo giusto è `list()`. Risolto dopo l'errore di `tsc`.
2. Nello screenshot la casella "Le richieste vanno approvate" era attaccata al testo: `label.inline` (specificità più alta) vinceva su `.approval`. Ho scritto `label.approval`.
3. Sotto la mappa compariva due volte "Tocca la mappa…" (suggerimento + errore). Ora il suggerimento appare solo dopo che il punto è scelto.

## Cosa ho visto negli screenshot (390x844)
- `10-crea-evento`: griglia di 4 tasti con emoji, aperitivo scelto in verde; campi con suggerimenti sotto le etichette; presentabile.
- `19-crea-errori`: messaggi rossi sotto titolo, data, mappa, zona, indirizzo; bordi rossi. Leggibile.
- `20-crea-compilato`: tasto "cena" scelto, segnaposto 🍽️ sulla mappa, testo "Punto scelto".
- Nota: nelle immagini a pagina intera la barra in alto e quella in basso compaiono a metà pagina: è un effetto dello screenshot lungo con elementi fissi, non un difetto dell'app. La data mostra `mm/dd/yyyy` perché Chromium è in inglese; sul telefono usa il formato italiano.
- Difetto noto ancora aperto: i filtri in cima all'elenco eventi occupano molto spazio (da compattare nel task 27 se serve).

## Verifiche
`npm run build`, `lint`, `test` (188 test, 9 nuovi tra `fieldErrors.test.ts` e `createEvent.test.tsx`) e `check:contrast` passano. La mappa vera è sostituita da un finto tasto nei test, perché Leaflet non disegna in jsdom; il tocco reale sulla mappa è provato solo da Playwright negli screenshot.

## Esercizio
Aggiungi una regola: la data dell'evento non può essere oltre un anno da oggi. Scrivi `validateDateTime` più severa in `validation.ts`, un test in `fieldErrors.test.ts`, e controlla che il messaggio compaia sotto "Data e ora".
