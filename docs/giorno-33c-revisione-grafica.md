# Giorno 33c – Revisione grafica complessiva

## Lettura scelta
Il task chiede di passare TUTTE le schermate con la checklist "da app professionale", usando anche dati estremi, e di correggere i difetti. Ho scelto di: (1) rigenerare i 39 scenari di `npm run shots` (74 immagini in tutto, viewport 390x844) e guardarli uno per uno; (2) aggiungere uno scenario con dati al limite (`npm run shots:extreme`, 6 immagini `extreme-*.png`); (3) correggere solo difetti veri, con una causa precisa, non ritocchi di gusto. "Rete assente" non si può simulare con i servizi in memoria: resta tra i difetti non verificati.

## Difetti trovati e come li ho corretti
1. **Barra azione del dettaglio staccata dal fondo** (una striscia di 16 px lasciava vedere il contenuto sotto). Causa: una vecchia regola del primo MVP, `section[aria-label='Partecipazione'] { margin: 16px 0 }`, aveva specificità più alta di `.action-bar { margin: 0 }`, quindi il margine inferiore sollevava la barra fissa. L'ho trovata misurando con Playwright (`getComputedStyle(...).marginBottom` = 16px) e ho tolto quella regola (`src/styles/lists.css`).
2. **Schermate che restavano scorse a metà**: passando da un passo all'altro di "Crea evento", o aprendo "Modifica profilo", la pagina conservava lo scorrimento e il titolo finiva sotto l'intestazione. Nuovo hook `useScrollTop(chiave)` (`src/ui/useScrollTop.ts`): un `useEffect` che chiama `window.scrollTo(0, 0)` solo quando la chiave cambia. Usato in `AppShell` (chiave = schermata) e in `CreateEventScreen` (chiave = passo).
3. **"Salvati" vuoto con l'illustrazione del calendario**: nuova illustrazione `NoSavedArt` (cuore con segnalibro) in `src/art/empty/heartArt.tsx`, registrata in `EMPTY_ART` come `no-saved`.
4. **Pulsante "Salva" del profilo piccolo e a sinistra**: ora `className="wide"` e con spinner (`aria-busy`).
5. **Riga dei chip tagliata con un margine strano** (a Eventi e in Mappa i chip si fermavano a 16 px dal bordo, senza far capire che si scorre): il contenitore ora esce fino al bordo con margine negativo e padding uguale, come le file di schede.
6. **Filtri "Data e distanza"**: Dal e Al impilati occupavano molto spazio; ora affiancati in una griglia a due colonne, con `min-width: 0` e `width: 100%` sugli input (senza, uscivano dallo schermo: errore visto nello screenshot intermedio).
7. **Vuoto nel benvenuto** tra testo e pulsanti: lo spazio avanzato ora si divide sopra l'illustrazione e sotto il testo (`margin-top: auto` sull'illustrazione, `margin-bottom: auto` sul testo).
8. **30 partecipanti**: "Chi c'è" mostrava 28 schede enormi. Ora `visiblePeople` (funzione pura, `src/events/visiblePeople.ts`) mostra le prime 6 e un pulsante "Mostra tutti (28)".

## Dati estremi (scenario `shots:extreme`)
`src/demo/demoExtreme.ts` aggiunge, solo con `VITE_DEMO_EXTREME=1`, un evento con titolo di 66 caratteri, zona di 80 caratteri, 30 posti con 28 confermati, un nome lunghissimo e una bio lunga. Visto: nelle schede il titolo va a capo su due righe e finisce con "…" (corretto); nel dettaglio il titolo su tre righe sta nella copertina e nella barra in alto si riduce con "…"; la zona va a capo nel blocco informazioni senza rompere l'icona.

## Cosa ho visto, onestamente
Presentabili: Eventi, dettaglio (tutti gli stati), Miei eventi, Profilo, benvenuto, registrazione, Crea evento (6 passi), conferma ritiro, pannello organizzatore. Difetti rimasti, per gravità:
- **Media**: nel cloud lo sfondo della mappa non si carica (grigio) e la scritta "Sfondo non disponibile" copre un segnaposto; sul telefono con internet non succede, ma va guardato.
- **Bassa**: le emoji dei chip dei tipi sembrano un po' piccole accanto al testo; le date mostrano "mm/dd/yyyy" perché Chromium del cloud è in inglese (sul telefono italiano sarà gg/mm/aaaa).
- **Bassa**: il riepilogo di Crea evento con titolo di 66 caratteri non l'ho verificato con uno screenshot dedicato (la scheda usa lo stesso componente delle liste, già visto).
- **Non verificato**: stato "rete assente/errore" in screenshot (servizi in memoria).

## Esercizio per Andrea
Apri `src/events/visiblePeople.ts` e cambia `PEOPLE_PREVIEW` a 3: quale test fallisce, e perché? Poi riscrivi il test usando la costante invece di numeri fissi.
