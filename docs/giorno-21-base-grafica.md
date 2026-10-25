# Giorno 21 – Base grafica

**Lettura scelta:** il task chiede una base di stile coerente (font, variabili, pulsanti, card, campi, errori, caricamento) senza cambiare la struttura delle schermate. Ho quindi lavorato solo su CSS e su poche classi, mantenendo i nomi già usati dai test.

## Perché queste scelte
- **Font Nunito dal pacchetto `@fontsource-variable/nunito`**: prima il font arrivava da Google Fonts via internet. In un'app Android senza rete, o negli screenshot di notte, ricadeva su un font di sistema. Ora il file `.woff2` è dentro l'app: stesso aspetto ovunque, niente richieste esterne. Il nome da usare in CSS è `'Nunito Variable'`.
- **Stili divisi in `src/styles/`**: un file per argomento (`tokens`, `base`, `cards`, `buttons`, `forms`, `feedback`, `lists`, `map`). `src/styles.css` li importa con `@import`. Ogni file resta sotto le 60 righe.
- **Variabili CSS**: i colori vengono da `src/config/app.ts` (via `applyTheme`); spaziature, ombra, colore errore e altezza minima del tocco (44px) stanno in `tokens.css`.

## Codice, pezzo per pezzo
- `tokens.css`: `:root { --space-3: 12px; ... }` definisce i valori una volta; gli altri file usano `var(--space-3)`.
- `buttons.css`: `button` è il primario (terracotta). `button.secondary` ha bordo verde e fondo bianco. `button.link` sembra testo sottolineato. `:active` riduce di poco il pulsante per dare il "tocco"; `:disabled` lo sbiadisce.
- `forms.css`: campi alti almeno 44px con bordo che diventa verde al focus e rosso se `aria-invalid="true"` (lo useremo nel task 25).
- `feedback.css`: `.loading` mostra un cerchietto che gira (animazione `spin`, ridotta se l'utente ha `prefers-reduced-motion`); `.empty` per gli stati vuoti; `.field-error`, `.chip`, `.badge` pronti per i task successivi.
- `main.tsx`: `import '@fontsource-variable/nunito/wght.css'` carica il font. In `index.html` ho tolto i link a Google Fonts.
- Nelle schermate: `<p className="loading">` e `<p className="empty">` al posto di paragrafi semplici (stesso testo, i test non cambiano).
- `contrastPairs.ts`: aggiunte due coppie controllate (grigio caldo su sfondo, rosso errore su bianco).
- `styles.test.ts`: tre test: tutti i file CSS sono importati, nessun file supera 60 righe, il font è nelle variabili.

## Errori incontrati
- Nel primo screenshot i filtri per tipo erano tutti terracotta, come se fossero tutti attivi. Colpa del pulsante primario di base. Ho dato ai pulsanti dei filtri lo stile "secondario" e solo `aria-pressed="true"` diventa verde pieno.

## Cosa ho visto negli screenshot (390x844)
Elenco eventi: titoli in Nunito, card con bordo e angoli morbidi, filtri leggibili, campi data ampi. Accesso: scheda bianca con ombra leggera, campi alti, pulsante terracotta. Dettaglio organizzatore: gerarchia chiara. Restano difetti che i task successivi risolvono: nessuna barra a schede (22), pulsante di accesso non a tutta larghezza (23), elenco senza badge né posti (24), date in formato inglese del browser di prova (non un difetto dell'app).

## Esercizio
In `buttons.css` aggiungi una variante `button.danger` (fondo bianco, testo e bordo `var(--color-error)`) e provala su "Annulla evento" in `OrganizerActions.tsx`. Poi lancia `npm run check:contrast` e verifica che il rosso su bianco superi 4.5.
