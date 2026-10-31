# Task 30: dettaglio evento da app vera

**Lettura scelta:** l'organizzatore ha il suo pannello in una finestra dal basso aperta dal pulsante "Gestisci evento" (con il numero di richieste in attesa), invece di una sezione dentro la pagina. La barra a schede sparisce nel dettaglio: due barre fisse impilate in basso sarebbero troppo pesanti, e si torna indietro con la freccia. La "mappa piccola" è una mappa Leaflet ferma con un cerchio attorno alla posizione APPROSSIMATA; nel cloud le tessere della mappa non si caricano, quindi negli screenshot si vede solo il cerchio su uno sfondo disegnato in CSS.

## Perché queste scelte
- **Logica fuori dai componenti.** Tre file di funzioni pure, tutte provate in `detailLogic.test.ts`: `detailScroll.ts` (parallasse e comparsa della barra), `actionBar.ts` (che pulsante mostrare per ogni situazione), `share.ts` (testo da condividere).
- **Un solo pulsante grande a destra.** `barModel(view)` associa a ognuna delle 9 situazioni (partecipa, chiedi, confermato, richiesta, organizzatore, pieno, annullato, chiuso, rifiutato) un'etichetta, un'azione e se serve conferma. Le situazioni senza azione mostrano un pulsante spento con la spiegazione ("Al completo", "Annullato").
- **Conferma solo dove si perde qualcosa.** Ritirarsi, ritirare la richiesta e annullare l'evento passano da una finestra dal basso con il pulsante sicuro ("No, resta") ben visibile. "Partecipa" no: è facile da rifare.
- **Evento annullato = annullato per tutti.** `effectiveView` trasforma qualsiasi situazione in "annullato": chi aveva un posto non deve vedere "Ritirati", l'organizzatore non deve vedere "Gestisci".
- **Indietro e Condividi sempre raggiungibili.** Sono in una barra fissa (`DetailTopBar`) che da trasparente diventa piena, con il titolo, quando la copertina esce dallo schermo.
- **Condividere non rivela il luogo.** `buildShareText` usa solo titolo, quando e zona; l'indirizzo esatto non è nemmeno nei dati dell'evento.

## Il codice, pezzo per pezzo
- `parallaxOffset(scrollY, reduce)`: 40% dello scorrimento, massimo 80px, zero con "riduci animazioni". La copertina (`.detail-hero-art`) sporge 80px sopra il riquadro (`inset: -80px 0 0`), così spostandosi verso il basso non scopre mai un buco.
- `headerProgress(scrollY, coverHeight)`: numero da 0 a 1 che regola sfondo, bordo e titolo della barra tramite la variabile CSS `--p`.
- `useScrollY`: ascolta lo scorrimento ma aggiorna al massimo una volta per fotogramma (`requestAnimationFrame`), e pulisce l'ascoltatore quando la schermata si chiude.
- `BottomSheet`: finestra con `role="dialog"` e `aria-modal`, chiusura con Esc o toccando lo sfondo, il focus entra nella finestra. `ConfirmSheet` ci mette dentro testo e due pulsanti.
- `ActionBar`: usa lo stesso `useRunAction` di prima (pulsante occupato, errore, ricarica), più lo stato `confirming` per la finestra.
- `OrganizerSheet`: richieste con avatar e pulsanti Accetta/Rifiuta; "Annulla evento" apre una seconda conferma al posto della prima finestra.
- `EventAreaMap`: `L.map` con ogni interazione spenta, un `L.circle` di 400 m e un puntino. Il cerchio è nel posto approssimato (due decimali, circa 1 km): non si indovina l'indirizzo.
- `navState.ts`: `showsAppHeader` è falso per il dettaglio (ha la sua barra), nuova `showsTabBar` falsa per il dettaglio. Entrambe testate.

## Errori incontrati
1. **Il dettaglio si apriva già scorso a metà.** Il browser conservava lo scorrimento della lista. Soluzione: `window.scrollTo(0, 0)` quando cambia l'evento aperto.
2. **Emoji della copertina tagliata in alto.** La copertina sporge di 80px per la parallasse, quindi la posizione `top` dell'emoji va aumentata di 80.
3. **Il cerchio della mappa era troppo grande** (700 m a zoom 14 uscivano dal riquadro): 400 m.
4. **Un test di annullamento falliva:** per l'organizzatore la vista restava "organizzatore" anche a evento annullato e la frase di stato non compariva. `effectiveView` ora vale per tutti.
5. Chip degli interessi con emoji e testo troppo distanti (spazio non divisibile): ora `gap` in CSS.
6. Test aggiornati: dopo "Ritirati" serve toccare "Sì, ritirati"; il pannello organizzatore si apre da "Gestisci evento".

## Cosa ho visto negli screenshot (390x844)
Copertina a tutta larghezza con sfumatura scura, chip del tipo, titolo bianco grande e data; scheda crema con angoli alti che sale sopra la copertina; blocco informazioni con icone; "Chi c'è" con schede; barra fissa con posti a sinistra e pulsante grande a destra. Vista da tutti gli stati: libero, con approvazione, pieno (pulsante spento), annullato, organizzatore, richiesta inviata, partecipazione confermata, finestra di conferma e pannello organizzatore. Scorrendo la barra in alto si riempie e compare il titolo. **Difetti rimasti:** la copertina è ancora il segnaposto con gradiente ed emoji (le illustrazioni arrivano in 33a); la mappa senza tessere mostra solo cerchio e puntino; gli interessi hanno ancora un po' d'aria in più tra emoji e testo; tornando alla lista la posizione di scorrimento si perde; non c'è ancora la chat (task 34).

## Esercizio per Andrea
In `detailScroll.ts` cambia `PARALLAX_FACTOR` da 0.4 a 0.8 e guarda quale test in `detailLogic.test.ts` si rompe. Poi aggiungi tu un test per `headerProgress(100, 296)` che deve restare 0 (perché?).
