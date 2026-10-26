# Giorno 22 – Navigazione a schede

Lettura scelta: "Debug e Esci nel profilo" significa che Debug ed Esci stanno nella scheda Profilo; la schermata di primo accesso (profilo ancora da completare) mantiene Esci perché lì non c'è la barra.

## Perché queste scelte
Prima la home era un elenco di pulsanti e ogni schermata aveva il suo "Indietro", gestito da sei variabili `useState` in `ProfileGate`. Con cinque sezioni è fragile. Ora lo stato è uno solo: **una scheda attiva** più, al massimo, **una schermata aperta sopra** (dettaglio evento, debug, modifica profilo). Toccare una scheda chiude sempre la schermata sopra: comportamento identico alle app che conosci.

## Il codice, pezzo per pezzo
- `src/nav/navState.ts`: funzioni pure. `Nav = { tab, overlay }`. `selectTab` azzera l'overlay, `openEvent/openDebug/openEdit` lo impostano, `goBack` lo chiude, `titleOf` dà il titolo dell'intestazione. Essendo pure si provano senza React (`navState.test.ts`).
- `src/nav/TabBar.tsx`: `<nav>` con cinque pulsanti; la scheda attiva ha `aria-current="page"` (serve ai lettori di schermo e agli stili: `.tab[aria-current='page']`).
- `src/nav/AppHeader.tsx`: titolo + pulsante freccia con `aria-label="Indietro"` solo se c'è qualcosa a cui tornare.
- `src/nav/AppShell.tsx`: tiene `useState<Nav>` e con due `switch` sceglie il contenuto (prima l'overlay, poi la scheda).
- `src/screens/ProfileView.tsx`: la scheda Profilo (nome, età mai data di nascita, bio, interessi, Modifica, Debug, Esci).
- `ProfileGate` ora fa solo: caricamento → profilo mancante → `AppShell`. `HomeScreen` è stato eliminato.
- Le schermate hanno perso `onBack` e il proprio titolo (lo dà l'intestazione). `src/styles/nav.css`: barra fissa in basso con `env(safe-area-inset-bottom)` per i telefoni con barra gestuale, intestazione `sticky`.

## Errori incontrati
- `npm run build` all'inizio falliva perché mancava `node_modules`: bastava `npm ci`.
- Un test cercava "Ciao Ada, 30 anni" nella vecchia home: ora l'età sta nel Profilo, quindi il test tocca prima la scheda Profilo. Stesso per il test del Debug. Il test del dettaglio ora usa "Indietro".
- Gli script degli screenshot cliccavano pulsanti della vecchia home: aggiornati, tolto `01-home`, aggiunto `18-profilo-scheda`.

## Cosa ho visto negli screenshot (390x844)
Barra in basso con cinque schede leggibili e scheda attiva evidenziata (filetto terracotta in alto, testo verde); intestazione con freccia nel dettaglio; scheda Profilo ordinata. Nota: nello screenshot a pagina intera dell'elenco la barra appare a metà immagine perché è `fixed` e la cattura "lunga" la disegna alla posizione del primo schermo: è un effetto della cattura, non dell'app. Difetti residui (a carico dei task 23-25): il filtro per date mostra "mm/dd/yyyy" in inglese, i filtri occupano molto spazio, le schede evento sono ancora semplici.

## Esercizio
In `navState.ts` aggiungi una funzione `openEventFromMap` che apre un evento ricordando da quale scheda arrivi, e scrivi due test. Poi prova a cambiare l'ordine delle schede in `TabBar.tsx`: cosa ti dice che il resto continua a funzionare?
