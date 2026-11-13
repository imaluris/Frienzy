# Scheda Play Store – testi

Tutti i testi sono in italiano (lingua predefinita). Ogni blocco tra tre apici inversi è il testo da incollare nella Play Console; i limiti di caratteri sono quelli di Google Play e li controlla un test (`src/legal/storeListing.test.ts`).

## Titolo (massimo 30 caratteri)

```titolo
Frienzy: eventi e amici
```

## Descrizione breve (massimo 80 caratteri)

```breve
Organizza eventi dal vivo e fai nuove amicizie: aperitivi, cene, mostre e altro.
```

## Descrizione completa (massimo 4000 caratteri)

```lunga
Frienzy è l'app per trasformare "ci vediamo un giorno" in un evento vero, con persone nuove.

Crei un aperitivo, una cena, una passeggiata, una mostra, un'uscita in montagna o una partita; oppure trovi sulla mappa quello che ti piace e ti iscrivi. Niente chat infinite con sconosciuti: ci si conosce di persona, in un posto pubblico, con un motivo per stare insieme.

COSA PUOI FARE
• Scoprire eventi vicino a te, sulla mappa o in elenco, con filtri per tipo, data e distanza.
• Creare un evento in pochi passi: tipo, titolo, quando, dove, quanti posti e se vuoi approvare tu chi partecipa.
• Iscriverti subito agli eventi liberi o chiedere di partecipare a quelli su approvazione.
• Metterti in lista d'attesa se l'evento è pieno: se si libera un posto sale il primo.
• Parlare con gli altri nella chat dell'evento, riservata a organizzatore e partecipanti confermati.
• Salvare gli eventi che ti interessano e ricevere promemoria prima che inizino.
• Modificare il tuo evento e avvisare chi si è iscritto; condividerlo con i tuoi amici.
• Lasciare un voto dopo l'evento e vedere l'affidabilità di chi organizza.
• Usare l'app in tema chiaro, scuro o automatico.

PENSATA PER LA TUA SICUREZZA
• Solo maggiorenni (18+).
• Non ci sono ricerche di persone vicine: vedi solo i profili di chi organizza e di chi partecipa agli eventi.
• Dell'età si vede il numero, mai la data di nascita.
• La posizione esatta dell'evento la vedono solo l'organizzatore e i partecipanti confermati.
• Puoi segnalare un evento o una persona e bloccare chi ti dà fastidio.
• Puoi eliminare il tuo account e i tuoi dati in qualsiasi momento, direttamente dall'app.

Nessuna pubblicità. Nessun abbonamento.

Frienzy: eventi dal vivo, nuove amicizie.
```

## Categoria e dati di contatto

- **Tipo**: App.
- **Categoria**: Social (alternativa: Eventi; la scelta di fondo è l'amicizia, quindi Social).
- **Tag suggeriti**: Social, Eventi, Incontri tra amici (non scegliere tag "Dating").
- **Email di assistenza**: da inserire (obbligatoria; la stessa va nelle pagine `public/privacy.html`, `public/termini.html`, `public/eliminazione-account.html`).
- **Sito web**: indirizzo dove si pubblica `public/` (facoltativo ma consigliato).
- **Norme sulla privacy (URL)**: `https://<tuo-indirizzo>/privacy.html`
- **URL per l'eliminazione dell'account**: `https://<tuo-indirizzo>/eliminazione-account.html`

## Immagini

| Elemento | File | Misura |
|---|---|---|
| Icona dell'app | `public/icon-512.png` | 512×512 |
| Immagine in primo piano | `docs/store/feature-graphic.png` (sorgente `.svg`, rigenerabile con `npm run store:graphic`) | 1024×500 |
| Screenshot del telefono | vedi `screenshot.md` | 390×844 (rapporto 9:19,5; Google Play accetta 9:16 e simili) |
