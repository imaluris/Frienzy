# Giorno 31 – Accesso, registrazione a passi, profilo

**Lettura scelta:** la registrazione ha 4 passi. Il passo 1 (account: email e password) crea subito l'account; i passi 2-4 (profilo, interessi, posizione) vivono nella schermata che si apre quando l'account esiste ma il profilo no. Il profilo si salva solo alla fine del passo 4: chi esce a metà non lascia un profilo incompleto e, rientrando, ricomincia dal passo 2.

## Perché questa struttura
Dopo `auth.register` l'app considera l'utente collegato e cambia schermata da sola (`useSession`). Provare a tenere tutto il wizard dentro la schermata "da scollegato" avrebbe significato registrare l'account alla fine con una gara tra "sessione cambiata" e "profilo salvato". Dividere il percorso lungo il confine naturale (account esiste / profilo no) evita il problema e riusa `ProfileGate`, che già faceva questo controllo.

## Il codice, pezzo per pezzo
- `src/onboarding/steps.ts`: funzioni pure. `STEPS` è l'elenco ordinato; `stepLabel` produce "Passo 2 di 4"; `nextStep`/`previousStep` si fermano ai bordi restituendo `null`; `validateProfileStep` controlla solo nome, data (18+) e bio riusando le funzioni di `profile/validation.ts`; `interestsActionLabel` cambia il pulsante in "Salta per ora" se non si è scelto nulla (gli interessi sono facoltativi). Tutto testato in `steps.test.ts`.
- `StepProgress.tsx`: quattro barrette, quelle fatte sono piene. Ha `role="progressbar"` con `aria-valuenow` così anche i lettori di schermo capiscono il passo.
- `StepProfile`, `StepInterests`, `StepLocation`: un componente per passo, senza logica di salvataggio. Gli interessi sono "chip grandi" in griglia a due colonne, con `aria-pressed` per lo stato.
- `OnboardingFlow.tsx`: tiene lo stato (passo, dati, errore, occupato). `goNext` valida solo nel passo profilo. Nel passo posizione, "Attiva la posizione" chiama `useMyPosition().ask()`: un `useEffect` aspetta la risposta del telefono (sì, no o non disponibile) e a quel punto chiama `finish()`, che salva il profilo. Un `useRef` impedisce il doppio salvataggio. "Non ora" salva senza chiedere nulla.
- `WelcomeScreen.tsx` + `WelcomeArt.tsx`: logo grande, illustrazione SVG originale (tre amici a un tavolino sotto le lucine, solo forme e colori del progetto), frase, due pulsanti e la nota "18 anni". `App.tsx` ora ha tre modalità: benvenuto, accesso, registrazione, con freccia indietro.
- `profile/stats.ts` + `ProfileStats.tsx`: due numeri (organizzati, partecipati). Contano solo eventi non annullati e, per le iscrizioni, solo quelle confermate. `ProfileView` li carica con `useMine`.
- `ProfileScreen` ora serve solo per modificare: ho tolto i rami "prima volta".
- Demo: il primo account è quello demo, i successivi (negli screenshot) ricevono un uid nuovo senza profilo, altrimenti la registrazione ricadeva sul profilo demo.

## Errori incontrati
- Gli screenshot dei passi 2-4 fallivano: la registrazione nella demo restituiva sempre l'uid demo, quindi il profilo esisteva già e il wizard non compariva. Risolto con il contatore in `createDemoServices`.
- Nel passo 2 lo spazio vuoto lasciato al posto della freccia indietro rendeva l'indicatore storto: ora la freccia c'è solo dove serve.
- Nell'illustrazione i corpi dei personaggi sbucavano sotto il tavolo: ho accorciato l'altezza dei corpi.

## Cosa si vede negli screenshot (390x844)
Benvenuto, accesso, registrazione passo 1-4 e scheda Profilo sono ordinati, con una sola azione principale per schermata, tocchi da 48px o più e testi senza tagli. Difetti rimasti: l'illustrazione è semplice (verrà sostituita dal set del task 33a) e nel passo 4 resta molto spazio vuoto tra testo e pulsanti.

## Esercizio
In `steps.ts` aggiungi `isLastStep(step)` e scrivi il test; poi usalo in `OnboardingFlow` al posto del confronto `step === 'posizione'`.
