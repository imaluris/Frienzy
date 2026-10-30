# Task 28: sistema grafico e icone

**Lettura scelta:** il task chiede di "dare un sistema" (icone, scale, stati) e di applicarlo alle schermate esistenti. Non ho ridisegnato le schermate (elenco, dettaglio, mappa, crea hanno i loro task 29-32): qui si pone la base che quei task useranno.

## Perché queste scelte
- **Icone con `lucide-react`** (licenza ISC, inclusa nel bundle, niente CDN). Hanno tutte lo stesso tratto e la stessa griglia 24px, quindi l'app sembra disegnata da una mano sola. Le emoji restano solo per i tipi di evento.
- **Un solo punto d'ingresso, `src/ui/Icon.tsx`.** I file dell'app non importano mai lucide direttamente: usano `<Icon name="calendar" />`. Così, se un giorno cambia la libreria, si cambia un file solo.
- **Scale in `tokens.css`:** spaziature 4/8/12/16/24/32, tipografia (display, titolo, sottotitolo, corpo, didascalia), tre ombre (`--shadow-1/2/3`), tocco minimo `--tap: 48px`, durate dei movimenti.
- **Aree sicure:** `viewport-fit=cover` in `index.html` dice al telefono di far disegnare l'app a tutto schermo; `env(safe-area-inset-top/bottom)` aggiunge i margini per barra di stato e barra gesti.

## Il codice, pezzo per pezzo
- `Icon.tsx`: una mappa `ICONS` da nome italiano-semplice a componente lucide. `satisfies Record<string, LucideIcon>` fa controllare a TypeScript i tipi ma conserva i nomi esatti, da cui `IconName`. La versione "piena" è `fill="currentColor"` con opacità 0.22 e tratto un po' più spesso: lucide non ha varianti piene, questa è l'imitazione.
- `TabBar.tsx`: per ogni scheda un `.tab-pill` (la pillola) che contiene l'icona; se la scheda è attiva la pillola prende il verde chiaro e l'icona diventa piena. `aria-current="page"` resta il segnale per screen reader e test.
- `buttons.css`: stati del pulsante. Premuto: `:active` lo rimpicciolisce e scurisce. Disabilitato: opacità 0.55. In corso: `aria-busy="true"` nasconde il testo (`color: transparent`) e disegna con `::after` uno spinner. L'ho collegato a Partecipa/Ritirati.
- `EventInfo.tsx`: le righe Quando/Zona/Indirizzo/Posti usano icone dentro un quadrato verde chiaro; il testo ha `overflow-wrap: anywhere` per le zone lunghissime.
- `EmptyState`: ora riceve `icon` (non più `emoji`), disegnata in un cerchio rosato.
- `scripts/shots/run.ts`: lo screenshot è della sola viewport (prima `fullPage: true` mostrava la barra a schede a metà pagina). Per le pagine lunghe una seconda immagine `-scroll` dopo aver scorso in fondo.

## Errori incontrati
1. **Il contenuto delle schede evento era centrato**: ho reso i pulsanti `inline-flex` con testo centrato, e questo ha spostato anche i pulsanti-scheda. Soluzione: `justify-content: flex-start` su `.event-card-main`. Lo screenshot l'ha rivelato subito, i test no.
2. **L'attribuzione di Leaflet passava sopra la barra a schede**: Leaflet usa z-index fino a 800, la barra 10. Ora barra e intestazione hanno 1000.
3. **Il titolo senza freccia indietro era spostato** perché c'era uno spazio riservato: rimosso, e l'intestazione ha un'altezza minima fissa così non "salta" tra schermate.

## Cosa ho visto negli screenshot (390x844)
Barra con pillola verde e icone a contorno/piene: chiara e coerente. Righe del dettaglio con icone: ordinate. Profilo, Miei eventi, Accesso: puliti. Difetti che restano e sono previsti nei task seguenti: le schede evento sono ancora senza copertina e il dettaglio non ha barra azione fissa (29, 30); la mappa è ancora un riquadro, non a schermo intero (32); "passeggiata" nel selettore tipo è stretta ma non tagliata (32).

## Esercizio per Andrea
In `Icon.tsx` aggiungi l'icona `bell` (importa `Bell` da lucide-react e aggiungila a `ICONS`), poi in `Icon.test.tsx` lancia i test: il terzo controlla da solo che la nuova icona si disegni. Poi prova a cambiare `strokeWidth` da 2 a 1.5 e guarda come cambia il carattere della barra a schede.
