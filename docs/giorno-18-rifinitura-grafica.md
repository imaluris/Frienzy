# Giorno 18 – Icona, manifest PWA, controllo del contrasto

## Lettura scelta
"Icona segnaposto" = un SVG semplice disegnato a mano (fumetto terracotta, F bianca, scintilla senape), non definitivo. Il "manifest PWA" è il file che permette di installare il sito come app; un'icona SVG sola basta per un segnaposto (le PNG a più misure si possono aggiungere dopo). Il "build pulito" = nessun avviso.

## Perché queste scelte
- **Il contrasto è una funzione pura** (`contrastRatio`, formula WCAG 2) in `src/config/contrast.ts`: testabile e riusabile.
- **Le coppie da controllare stanno in un solo elenco** (`contrastPairs.ts`) e leggono i colori da `appConfig`: se cambi la palette il controllo si adegua.
- **Lo stesso controllo gira in due modi**: come test Vitest e come script (`npm run check:contrast`), che esce con errore se una coppia non passa.
- **Il controllo ha trovato due problemi veri**: il bianco sui pulsanti terracotta fa 3.09 (serve 4.5) e i titoli terracotta sullo sfondo crema fanno 2.94. Ho tenuto la palette (è fissa) e cambiato l'uso: testo scuro sui pulsanti (5.09), titoli in verde bosco (7.11).

## Il codice, pezzo per pezzo
- `channel` converte un canale 0–255 nella sua parte di luminanza (curva sRGB); `luminance` li combina con i pesi 0.2126/0.7152/0.0722; `contrastRatio` fa `(chiaro + 0.05) / (scuro + 0.05)`.
- `PAIRS`: nome, colore del testo, sfondo, minimo (4.5 testo, 3 per bordi/simboli). `checkContrast` restituisce `ok` per ciascuna.
- `scripts/check-contrast.ts`: stampa le righe e fa `process.exit(1)` se qualcuna fallisce. Node 22 esegue direttamente il TypeScript; per questo gli import in quella catena finiscono in `.ts` e `tsconfig.json` ha `allowImportingTsExtensions`.
- `public/icon.svg`: tre forme (`path`) sovrapposte, colori dalla palette.
- `public/manifest.webmanifest` + tre righe in `index.html` (icona, manifest, colore della barra). Un test controlla che il manifest resti uguale alla config.
- `vite.config.ts`: soglia dell'avviso sul peso dei file alzata a 1100 kB, perché Firebase e Leaflet da soli pesano circa 1 MB.

## Errori incontrati
Nessun errore di esecuzione; il vero "errore" era il contrasto insufficiente, risolto come sopra.

## Esercizio
Aggiungi alla lista `PAIRS` la coppia "testo su accento" ma con il bianco al posto del testo scuro e guarda cosa dice lo script. Poi prova a cambiare `primary` in `config/app.ts` con un colore più chiaro: quali coppie falliscono?
