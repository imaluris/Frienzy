# Giorno 1 – Setup del progetto

**Lettura scelta:** nessuna ambiguità vera; ho usato Vite + React + TypeScript (TypeScript perché i tipi aiutano a non sbagliare i dati nei task successivi).

## Perché queste scelte
- **Vite**: avvia l'app in un attimo e produce il build per web e, più avanti, per Android (Capacitor).
- **TypeScript**: ti avvisa quando passi un dato sbagliato, prima ancora di eseguire il codice.
- **Vitest + Testing Library**: Vitest si integra con Vite; Testing Library prova i componenti come li userebbe una persona.
- **ESLint**: controlla in automatico errori comuni.
- **Un solo file di config** (`src/config/app.ts`): nome, appId, palette, font e angoli stanno lì. Per cambiare un colore tocchi un file solo.

## Il codice, pezzo per pezzo
- `package.json` → gli script: `build` (controlla i tipi con `tsc -b` e poi costruisce con Vite), `lint`, `test`.
- `vite.config.ts` → registra il plugin React e dice a Vitest di usare `jsdom` (un finto browser) e il file `src/test/setup.ts`.
- `src/config/app.ts` → oggetto con i dati fissi. `as const` rende i valori non modificabili e ne preserva il tipo preciso.
- `src/config/theme.ts` → `themeVariables()` è una funzione pura (stessi input, stesso output: facile da testare) che trasforma la config in variabili CSS; `applyTheme()` le applica alla pagina.
- `src/styles.css` → usa le variabili (`var(--color-primary)`), mai colori scritti a mano.
- `src/main.tsx` → punto d'ingresso: applica il tema e disegna `<App />`.
- `src/App.tsx` → schermata minima con il nome dell'app.
- Test: `theme.test.ts` verifica le variabili; `App.test.tsx` verifica che compaia il titolo "Frienzy".
- `.gitignore` → esclude `.env` e `google-services.json`: i segreti non devono mai finire nel repo pubblico.

## Errori incontrati
Nessun errore bloccante: build, lint e test sono passati al primo giro.

## Esercizio
In `src/config/app.ts` cambia il colore `accent`, poi aggiungi in `theme.test.ts` un test che controlla `--color-accent`. Lancia `npm test` e osserva cosa succede se sbagli il valore atteso.
