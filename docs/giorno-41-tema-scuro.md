# Giorno 41: Tema scuro

**Lettura scelta:** il tema scuro è una palette a sé (non "colori invertiti"), con impostazione Chiaro / Scuro / Automatico nel Profilo, mappa scurita con un filtro CSS, illustrazioni attenuate e controllo del contrasto che copre entrambi i temi. Non ho potuto fare domande, quindi ho deciso io: la scelta è salvata in `localStorage` (solo su quel telefono, nessun dato su Firebase).

## Perché queste scelte

1. **Una sola fonte per i colori: `src/theme/palettes.ts`.** Prima i colori stavano metà in `tokens.css`, metà "sparsi" nei file CSS (`#fff`, `#ece3d8`, `rgba(...)`). Un tema scuro non si fa con un `filter: invert`: bisogna che ogni colore abbia un *ruolo* (sfondo, scheda, testo, testo sul pulsante...) e due valori. Ho quindi creato un tipo `Palette` con tutti i ruoli e due oggetti `LIGHT` e `DARK`.
2. **I CSS leggono solo variabili.** `cssVars.ts` trasforma le voci della palette in variabili (`surface2` → `--color-surface-2`) e `apply.ts` le scrive su `<html>`. Cambiare tema = riscrivere le variabili: nessun componente deve saperlo.
3. **Ruoli "on-..."** (`--color-on-primary`, `--color-on-secondary`, `--color-on-error`, `--color-ink`): nel chiaro il testo sul pulsante terracotta è scuro, ma nel tema scuro il *testo normale* diventa chiaro. Se i pulsanti usassero `--color-text`, avrebbero testo chiaro su terracotta (illeggibile). Il ruolo "testo sul colore pieno" è quindi separato dal "testo normale". Lo stesso per il verde: nel tema scuro diventa un verde salvia chiaro (leggibile come testo) e il testo sopra i chip pieni diventa scuro.
4. **Quattro livelli di superficie** nel tema scuro (`background`, `surface`, `surface2`, `surface3`): le ombre quasi non si vedono sul marrone scuro, quindi la separazione la fanno la luminosità e i bordi. Le ombre usano `--shadow-rgb` e `--shadow-k` (nel scuro sono nere e 2,4 volte più forti).
5. **Nessun lampo chiaro all'avvio.** Un piccolo script in `index.html` legge la scelta salvata e mette `data-theme="scuro"` prima che l'app parta.
6. **Barra di stato Android** (`nativeBars.ts`): colore e stile delle icone seguono il tema (`Style.Dark` = icone chiare).

## Il codice, pezzo per pezzo

- `src/theme/preference.ts`: `resolveMode(choice, systemDark)` è una funzione pura (Automatico segue il telefono). `readChoice`/`writeChoice` non si rompono se `localStorage` è bloccato.
- `src/theme/store.ts`: piccolo archivio osservabile. `initTheme()` legge la scelta, ascolta `prefers-color-scheme` e applica il tema; `setChoice()` salva e riapplica. `useTheme.ts` lo espone a React con `useSyncExternalStore`.
- `src/screens/AppearanceSettings.tsx`: la scheda "Aspetto" (tre pulsanti `role="radio"` con icona sole/luna/telefono).
- `src/theme/contrastPairs.ts`: `pairsFor(palette)` elenca le coppie testo/sfondo realmente usate; `checkContrast()` le controlla per **tutti e due** i temi. `npm run check:contrast` stampa `[chiaro]`/`[scuro]`.
- `src/styles/theme.css`: stile della scheda e adattamenti scuri: `.leaflet-tile-pane` con `invert + hue-rotate` (solo le tessere: i segnaposto stanno in un altro livello e non cambiano) e le illustrazioni con `brightness(0.85)`.
- `scripts/shots/audit.ts` (`npm run audit`): apre ogni schermata demo e confronta il colore *calcolato* di ogni testo con lo sfondo effettivo. Serve a trovare ciò che il file delle coppie non sa.

## Errori incontrati

- **Titoli delle card invisibili** negli screenshot scuri: le card sono `<button>` e ereditavano `color: var(--color-on-primary)` (scuro) dal pulsante base, ma avevano sfondo scheda scuro. Contrasto 1,09:1. Il test delle coppie non poteva accorgersene: l'ho trovato guardando le immagini e poi con `npm run audit`. Fix: colore esplicito su `.event-card-title`, `.rail-card-title`, `.big-chip`, `.badge-neutral`.
- **Conflitto di classe `.switch`**: la scheda Notifiche (task 40) usava `.switch` per l'interruttore, ma la stessa classe è usata dai paragrafi "Non hai un account? Registrati" nelle schermate di accesso: ricevevano larghezza 52px e sfondo beige. Ho rinominato l'interruttore in `.toggle-switch` / `.toggle-knob`.
- **Coppie di contrasto troppo severe**: avevo aggiunto controlli del 3:1 per bordi decorativi che il tema chiaro non ha mai rispettato; li ho tolti (non sono testo) e ho tenuto solo quelli sui simboli.
- Node esegue il TypeScript direttamente: gli import in `scripts/` e nei file che importano devono avere estensione `.ts`.

## Cosa ho visto negli screenshot (70 scuri in `docs/screenshots/scuro/`)

Elenco eventi, dettaglio, chat, Crea evento, Miei eventi, Profilo (scheda Aspetto), benvenuto: leggibili, testi chiari su marrone, copertine attenuate ma vive, pulsante terracotta con testo scuro, barra a schede con pillola verde scuro. Difetti rimasti: sfondo mappa non verificabile nel cloud (le tessere non si caricano: il filtro scuro va visto sul telefono) e il segnaposto con sfondo mappa assente copre la scritta (già noto).

## Esercizio per Andrea

In `palettes.ts` cambia `DARK.background` da `#17120e` a `#000000` (nero puro stile OLED), lancia `npm run check:contrast` e poi guarda un'immagine con `SHOTS_THEME=scuro SHOTS_ONLY='^02' npm run shots`. Quali coppie cambiano contrasto? Perché le schede restano distinguibili dallo sfondo solo grazie ai bordi?
