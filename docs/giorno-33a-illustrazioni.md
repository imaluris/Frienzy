# Giorno 33a – Illustrazioni e copertine originali

## Lettura scelta
Il task chiede copertine "ricche" per i 7 tipi, varianti ripetibili dall'id, sei illustrazioni per gli stati vuoti, il benvenuto nuovo e i coriandoli. Ho scelto di disegnare tutto come **componenti React che restituiscono SVG** (niente file immagine): pesano pochi KB, si ridimensionano senza sgranare e i colori arrivano dalla palette del progetto. Le miniature della lista nella mappa (`EventRow`) restano col vecchio gradiente + emoji: sono quadratini da 72px dove un'illustrazione non si leggerebbe.

## Perché queste scelte
- **Varianti dall'id**: una copertina deve restare uguale ogni volta che la rivedi (altrimenti l'evento "cambia faccia"), ma due aperitivi diversi non devono essere identici. Quindi non uso `Math.random()`: trasformo l'id in un numero (`hashString`, FNV-1a) e lo uso come seme di un generatore ripetibile (`makeRng`, mulberry32). Stesso seme = stessa sequenza di numeri = stesso disegno.
- **Tela 400x240 con `preserveAspectRatio="xMidYMid slice"`**: l'SVG riempie il riquadro tagliando i bordi, come una foto con `object-fit: cover`. Per questo il soggetto sta al centro (y tra 40 e 200): la scheda dell'elenco è larga e bassa, il dettaglio è più alto.
- **Id interni unici**: ogni SVG ha gradienti con un id. Se due copertine nella stessa pagina usassero lo stesso id, la seconda userebbe il gradiente della prima. Uso `useId()` di React per dare a ogni istanza un prefisso diverso.

## Il codice, pezzo per pezzo
- `src/art/seed.ts`: `hashString`, `makeRng` (restituisce `next`, `between`, `int`, `pick`) e `rngFor(id)`.
- `src/art/shapes.tsx`: pezzi riusati (Sparkle, Hill, Sun, Pine, RoundTree, StringLights).
- `src/art/scenes/*.tsx`: una scena per tipo. Ognuna sceglie una palette con `rng.pick`, posiziona alcuni elementi con `rng.between` e disegna a strati: cielo, sfondo, soggetto, dettagli. Aperitivo: tramonto, bicchieri e lucine. Cena: lampada, candela e piatti. Mostra: quadri astratti e visitatore. Trekking: montagne, pini e bandierina. Passeggiata: parco, panchina e palloncino. Sport: campo, porta e pallone. Altro: festa con festoni e palloncini.
- `src/art/CoverArt.tsx`: sceglie la scena dal tipo e passa il generatore legato a `tipo:id`.
- `src/ui/EventCover.tsx`: ora accetta `seedId` e mostra `CoverArt` + badge data. `EventCard` e `EventHero` passano `event.id`.
- `src/art/empty/*` e `EmptyArt.tsx`: sei illustrazioni (nessun evento, nessun risultato, nessuna iscrizione, nessun evento organizzato, errore, offline) su una macchia morbida colorata. `EmptyState` ora riceve `art` invece di `icon`.
- `src/ui/LoadFailed.tsx`: se il caricamento fallisce mostra l'illustrazione "offline" quando `navigator.onLine` è falso, altrimenti quella dell'errore.
- `src/screens/WelcomeArt.tsx` + `WelcomeFriend.tsx`: benvenuto rifatto con tramonto, colline, casetta, lucine e tre amici che brindano (il vecchio era semplice).
- `src/art/Confetti.tsx` + `styles/confetti.css`: 36 pezzi con posizione, ritardo, deriva e rotazione calcolati con un seme; cadono con un'animazione CSS e non intercettano i tocchi (`pointer-events: none`). Con "riduci animazioni" non compaiono. Li mostra `ActionBar` solo quando l'iscrizione è confermata subito (non per le richieste).

## Errori incontrati e come li ho risolti
1. **Nella galleria di prova i cieli erano tutti viola**: renderizzavo ogni copertina separatamente e tutte avevano lo stesso id di gradiente, quindi vinceva il primo. Nell'app non succede (ogni istanza ha il suo `useId`); ho corretto la galleria rinominando gli id e ho ricontrollato.
2. **Soggetti tagliati in basso** (bicchieri, piatti): nella scheda bassa i bordi superiore e inferiore si tagliano. Ho alzato tavolo, bicchieri e piatti dentro la fascia centrale.
3. **Dettaglio evento con 16px di margine ai lati** (difetto già presente, visto negli screenshot): il contenitore `.screen` aggiunge padding. Ho aggiunto la classe `screen-bleed` (padding 0) quando è aperto il dettaglio, così la copertina è a tutta larghezza.

## Cosa ho visto negli screenshot (390x844)
Elenco: schede con copertine diverse per tipo, badge data leggibile sopra l'illustrazione, cuore ben visibile. Dettaglio: copertina a tutta larghezza, titolo leggibile sulla sfumatura scura, barra azione fissa. Benvenuto: scena calda e leggibile, ma resta un vuoto tra il testo e i pulsanti (era già noto, lo tratta il 33c). Ricerca senza risultati: lente con X su macchia gialla e frase. Coriandoli: pezzi colorati che cadono sopra la copertina con il toast di conferma. Giudizio: presentabile. Difetti rimasti: le varianti di Trekking e Sport differiscono poco tra loro (colori simili); la scintilla bianca vicino al badge data in qualche copertina è parzialmente coperta; gli stati errore/offline non sono catturabili nella demo, li ho controllati in una galleria temporanea.

## Test
`src/art/art.test.tsx`: stesso id = stessa copertina per tutti e 7 i tipi, id diversi = varianti, tipi diversi = disegni diversi, hash e generatore ripetibili e nei limiti, sei illustrazioni vuote disegnate, coriandoli ripetibili e dentro lo schermo.

## Esercizio per Andrea
In `src/art/scenes/Trekking.tsx` aggiungi un quarto cielo all'elenco `SKIES` (per esempio un'alba rosata), poi apri due eventi di trekking e guarda se compare. Domanda: perché lo stesso evento mostra sempre lo stesso cielo anche se la scelta usa `rng.pick`?
