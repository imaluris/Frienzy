# Giorno 26 – Mappa rifinita

**Lettura scelta:** "popup verso il dettaglio" = toccando un marker si apre un piccolo popup (titolo, data, zona) con il pulsante "Apri evento". "Centra su di me" chiede la posizione solo quando si preme il pulsante. "Tile assenti gestite" = se lo sfondo non si carica la mappa resta usabile e un avviso lo spiega.

## Perché queste scelte
- **Tre effetti separati in `EventMap`**: (1) crea la mappa una volta; (2) ridisegna i marker quando cambiano; (3) disegna "tu" quando arriva la posizione. Prima tutto era in un solo effetto: ogni cambio di dati rifaceva la mappa da capo, e col pulsante "centra" avrebbe perso zoom e posizione.
- **Popup con DOM, non con stringhe HTML** (`src/map/popup.ts`): il titolo lo scrive l'organizzatore. Con `innerHTML` un titolo come `<img onerror=…>` sarebbe codice eseguito (XSS). Con `createElement` + `textContent` resta solo testo. C'è un test che lo prova.
- **Permesso posizione solo su richiesta**: riuso `useMyPosition` (già usato dai filtri). Messaggi di errore in una funzione pura, `positionMessage`, testata.
- **Tile assenti**: `tiles.on('tileerror', …)` avvisa `MapScreen`, che mostra "Lo sfondo della mappa non si carica". Il fondo grigio della mappa e i marker restano.

## Codice, pezzo per pezzo
- `markers.ts`: `EventMarker` ha ora `when` (data breve) e `zone`, solo dati già pubblici (posizione approssimata, mai l'indirizzo esatto).
- `EventMap`: `layerRef` è un `LayerGroup`; `clearLayers()` svuota i vecchi marker senza toccare la mappa. Con più marker `fitBounds` con margine 64 li mostra tutti; con uno solo `setView` a zoom 14.
- `meRef`: un `circleMarker` verde bosco con bordo bianco; quando arriva `me` si sposta e la mappa si centra a zoom 14.
- `MapScreen`: pulsante "Centra su di me" in una riga sopra la mappa, avvisi sotto, e "Nessun evento in programma" sopra la mappa se la lista è vuota.
- Marker da 44px con ombra: dimensione minima comoda per il dito.

## Errori incontrati
1. Il pulsante sopra la mappa copriva il popup (z-index 1000 contro i 700 del popup). Poi, dando alla mappa `z-index: 2`, il pulsante spariva sotto. Soluzione pulita: il pulsante non è più sovrapposto, sta in una riga sopra la mappa.
2. Lo screenshot cliccava il primo marker, ma i marker demo si sovrappongono e uno copriva l'altro: ora lo script clicca il marker 🥾 (isolato).
3. Marker tagliati al bordo: margine di `fitBounds` portato da 48 a 64.
4. Pulsante e avvisi attaccati al bordo dello schermo: padding sul contenitore `.map-screen`.

## Cosa ho visto negli screenshot
`09-mappa`: marker tondi con emoji ben leggibili, pulsante in alto a destra, avviso sullo sfondo assente. `21-mappa-popup`: popup pulito con titolo, data, zona e pulsante terracotta. Limite visibile: gli eventi demo nello stesso quartiere si sovrappongono (non c'è raggruppamento in cluster); zoomando si separano.

## Verifiche
build, lint, 192 test (4 nuovi), contrasto OK. Non verificati: sfondo reale della mappa, GPS e permesso posizione sul telefono (non disponibili qui).

## Esercizio
Aggiungi in `positionMessage` un messaggio per lo stato `ok` ("Ti ho trovato!") e aggiorna il test: poi guarda come `MapScreen` lo mostra sotto la mappa.
