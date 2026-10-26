# Giorno 23 – Accesso, registrazione e profilo curati

Lettura scelta: "niente dipendenza da Storage" significa che l'interfaccia non carica più foto; al loro posto c'è un avatar con le iniziali. Il campo `fotoUrl` resta nei dati (sempre vuoto) e il servizio foto resta nel codice, ma nessuna schermata lo usa.

## Perché queste scelte
Storage di Firebase richiede il piano a pagamento, quindi la foto non può essere obbligatoria. Un cerchio colorato con l'iniziale è il compromesso usato da molte app: sempre disponibile, sempre diverso per persona. Gli interessi erano caselle da spuntare; come chip (pulsanti a pillola) si toccano meglio col pollice e si vedono subito.

## Il codice, pezzo per pezzo
- `src/people/initials.ts`: `initialsOf` prende la prima lettera di nome e ultima parola ("Maria Anna Rossi" → "MR"; nome vuoto → "?"). `avatarColorFor` calcola un numero dal testo (un hash semplice: `hash*31 + codice carattere`) e lo usa come posizione nella lista colori. Stesso nome, stesso colore, sempre. Funzioni pure, provate in `initials.test.ts`.
- `src/config/avatarColors.ts`: i sei sfondi possibili. Il testo scuro sopra è controllato da `check:contrast` (ho aggiunto una coppia per ogni colore, tutte sopra 4.5).
- `src/ui/Avatar.tsx`: un `<span>` rotondo, `aria-hidden` perché il nome è già scritto accanto. Tre misure: `sm`, `md`, `lg`.
- `src/screens/InterestPicker.tsx`: bottoni con `aria-pressed` (vero se scelto). Lo stile `.chip-toggle[aria-pressed='true']` colora di verde bosco quelli scelti.
- `src/ui/InterestChips.tsx`: stessi chip ma sola lettura, per la scheda Profilo.
- `src/screens/ProfileView.tsx`, `EventPeople.tsx`, `ProfileScreen.tsx`: usano avatar e chip; il badge "organizza" è quello giallo senape già esistente.
- `src/screens/AuthBrand.tsx` e `src/styles/auth.css`: logo, nome e frase di presentazione sopra accesso e registrazione, pulsante a tutta larghezza.
- `PhotoField.tsx` eliminato.

## Errori incontrati
Nessun errore di build. Due test usavano la casella "aperitivo" con `getByLabelText`: ora è un pulsante, quindi `getByRole('button', { name: /aperitivo/ })`.

## Cosa ho visto negli screenshot (390x844)
Accesso: logo, titolo verde, frase, scheda bianca con campi e pulsante terracotta a tutta larghezza: ordinato. Profilo: avatar senape con la "A", nome ed età, bio, chip degli interessi. Modifica: avatar che cambia con il nome, chip scelti in verde. Dettaglio evento: avatar colorati accanto a Giulia e Sara con badge "organizza". Il campo data mostra "mm/dd/yyyy" perché il browser di prova è in inglese: sul telefono in italiano sarà gg/mm/aaaa.

## Esercizio
Aggiungi in `avatarColors.ts` un settimo colore chiaro e lancia `npm run check:contrast`: passa? Poi scrivi un test che verifica che `initialsOf('élodie')` dia 'É'.
