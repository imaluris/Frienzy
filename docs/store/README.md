# Materiale per la scheda Google Play

Cartella preparata nel task 43. Tutto è una BOZZA da far rivedere da Andrea (e, per i testi legali, da un professionista).

- `scheda.md` – titolo, descrizioni, categoria, indirizzi da inserire.
- `sicurezza-dati.md` – risposte per il modulo "Sicurezza dei dati".
- `classificazione-contenuti.md` – risposte per il questionario sulla classificazione dei contenuti.
- `screenshot.md` – quali screenshot caricare e in che ordine.
- `feature-graphic.svg` / `.png` – immagine in primo piano 1024×500 (si rigenera con `npm run store:graphic`).

Pagine web statiche (cartella `public/`, da pubblicare a un indirizzo web): `privacy.html`, `termini.html`, `eliminazione-account.html`.

## Da fare prima dell'invio (solo Andrea)

1. Pubblicare `public/` a un indirizzo web (ad esempio Firebase Hosting o GitHub Pages, entrambi gratuiti) e impostare `VITE_WEB_BASE_URL` con quell'indirizzo, così i link dell'app e della condivisione funzionano.
2. Sostituire in `public/privacy.html` e `public/termini.html` i campi tra parentesi quadre ([nome del titolare], [indirizzo email di assistenza]); lo stesso indirizzo va nella Play Console.
3. Far rivedere i testi legali. Se il contenuto cambia, alzare `TERMS_VERSION` in `src/legal/consent.ts` e la riga "Versione" nelle due pagine (un test controlla che coincidano).
4. Rifare gli screenshot dal telefono vero.
5. Creare un account di prova per la revisione di Google.
