# Giorno 27 – Cluster, filtri compatti, verifica finale

**Lettura scelta:** il task comprende tre cose decise da Andrea: raggruppare i marker in cluster, compattare i filtri dell'elenco, provare le classi Firebase sul progetto vero. Poi la verifica finale con un elenco onesto.

## Cluster dei marker
- Libreria `leaflet.markercluster` (+ tipi) da npm: funziona offline, niente file esterni.
- In `EventMap` il gruppo di marker è ora un `L.markerClusterGroup` invece di un `LayerGroup`: stessa API (`addLayer`, `clearLayers`), quindi il resto del codice non cambia. `iconCreateFunction` disegna il cerchio col numero in senape (testo scuro: la coppia di contrasto "testo su accento" esisteva già).
- Toccando un cluster la mappa si avvicina e i marker si separano; i popup dei singoli marker sono invariati. Visto in `09-mappa` (cluster "7" più il trekking isolato) e `23-mappa-cluster-aperto`.

## Filtri compatti
- `FiltersBar` ora è una sola riga di tipi che scorre di lato; date e distanza sono in `FiltersMore`, un `<details>` chiuso ("Data e distanza") con un numerino se ci sono filtri attivi (`countMoreFilters`, testata). L'elenco comincia subito sotto: `02-eventi` mostra gli eventi ben visibili; `22-filtri-aperti` il pannello aperto.
- Perché `<details>`: è nativo, accessibile, non serve stato React. Tutti i test dei filtri esistenti passano senza modifiche.

## Giro con Firebase vero: BLOCCATO
Ho provato a registrare un account di prova con la configurazione web pubblica. La rete di questo ambiente ha risposto 403 (negato dalla policy di uscita) per `identitytoolkit.googleapis.com` e non ha raggiunto neanche `firestore.googleapis.com`. Come da regola, non ho insistito né aggirato il blocco. **Nessun dato è stato creato nel progetto Firebase**, quindi non c'è nulla da cancellare. Conseguenza: le classi in `src/firebase/` restano compilate ma mai eseguite.

## Verificato e non verificato (elenco onesto)
**Verificato con controlli automatici:** build senza avvisi, lint, 194 test, contrasto dei colori; regole di sicurezza solo come test scritti (`test:rules` richiede l'emulatore, che qui non funziona, quindi non rieseguiti in questo giro).
**Verificato con dati in memoria e screenshot (Chromium, 390x844):** accesso/registrazione, profilo, elenco, dettaglio, partecipazione (libera, con approvazione, piena, annullata), pannello organizzatore, crea evento, mappa con cluster e popup, filtri.
**Non verificato:** Firebase vero (accesso, scrittura/lettura, regole pubblicate, transazione dei posti); telefono Android (installazione, GPS e permesso posizione, tastiera, gesto indietro, notifiche push); sfondo reale della mappa; uso con più persone; foto profilo (non esistono: Storage richiede il piano a pagamento).
Nota sugli screenshot: nelle immagini a pagina intera la barra in basso compare a metà pagina; è un effetto dello screenshot lungo, non dell'app.

## Esercizio
In `FiltersMore` aggiungi un pulsante "Azzera filtri" dentro il pannello che rimette `NO_FILTERS`; scrivi un test che attiva una data, lo preme e controlla che il numerino sparisca.

## Aggiunta: scheda Profilo ridisegnata
Dopo la Fase 2 Andrea ha giudicato la scheda Profilo spoglia e sbilanciata (avatar solo a sinistra, grande vuoto, Debug ed Esci come link nudi). Ora `ProfileView` ha tre card: fascia colorata (sfumatura terracotta-senape) con avatar centrato e bordo bianco, nome ed età; "Chi sono" e "Cosa mi piace" con il pulsante Modifica a tutta larghezza; una card Account con Esci ben visibile e Debug più discreto. Stili in `src/styles/profile-view.css`. Il test di registrazione cercava il testo "Ada, 30 anni" in un solo elemento: ora nome ed età sono in due righe e il test li controlla separatamente (`findByText('Ada')` e `/^3[01] anni$/`). Screenshot `18-profilo-scheda` rifatto e guardato.
