# Giorno 46 – Verifica finale della Fase 3

**Lettura scelta:** è una verifica, non un task di nuove funzioni. Ho rieseguito tutti i controlli automatici e gli screenshot, aggiornato la sezione Stato del README e scritto questo elenco onesto. Non ho cambiato codice dell'app.

## Cosa ho eseguito (cloud, Chromium 390x844)
| Comando | Risultato |
|---|---|
| `npm ci` | ok |
| `npm run build` | ok, nessun avviso di TypeScript |
| `npm run lint` | ok, zero errori |
| `npm test` | 93 file, **565 test** verdi |
| `npm run check:contrast` | tutte le coppie sopra il minimo (chiaro e scuro) |
| `npm run shots` | 75 schermate ok |
| `SHOTS_THEME=scuro npm run shots` | 75 schermate ok |
| `npm run audit` | "Nessun testo sotto il minimo" |

Gli screenshot rifatti differivano dai precedenti solo per le date dei dati d'esempio (calcolate da oggi): li ho rimessi come erano con `git checkout`. Ne ho guardato uno (`02-eventi`) per controllare che non ci fossero rotture.

## Verificato
- Compilazione, stile del codice, logica (565 test), contrasto dei colori calcolato e misurato a schermo.
- Tutte le schermate con dati in memoria, tema chiaro e scuro: elenco, scoperta, dettaglio, partecipazione e lista d'attesa, chat, segnala/blocca, elimina account, recupero password, presenza e voti, avvisi, modifica e condivisione, consenso e pagine legali.
- Superficie della pubblicazione (test su Gradle, workflow e `.gitignore`), limiti di frequenza allineati tra app e regole.

## NON verificato (mai eseguito)
- **Firebase vero**: accesso, letture/scritture, regole pubblicate, email reali, cancellazione account, App Check. La rete del cloud blocca i servizi Google.
- **Telefono Android**: installazione, GPS, tastiera, gesto indietro, notifiche locali e push, area sicura.
- **Emulatore delle regole**: `npm run test:rules` (chat, blocchi, lista d'attesa, limiti) è scritto ma mai lanciato.
- **Gradle**: né `assembleDebug` né `bundleRelease`; il nuovo workflow Android non ha mai girato su GitHub.
- Sfondo reale della mappa, uso con più persone insieme, workflow delle notifiche su GitHub con dati veri.

## Difetti per gravità
**Alta (blocca la pubblicazione finché non si prova)**
1. `.github/workflows/android.yml` è ancora la versione vecchia: il workflow con AAB firmato sta in `docs/pubblicazione/android.workflow.yml` e va copiato (serve il permesso `workflow`).
2. Nessuna prova end-to-end su Firebase e telefono: eventuali errori di regole o di permessi Android sono sconosciuti.

**Media**
3. Gli inviti per zona usano una cella geohash di 4 caratteri: chi è in una cella vicina non viene trovato.
4. Nessuna notifica per i messaggi di chat né per chi sale dalla lista d'attesa (solo "risposte").
5. Un promemoria locale non segue un cambio d'orario finché l'app non si riapre; il controllo su GitHub si sospende dopo 60 giorni senza attività nel repo.

**Bassa (estetica)**
6. Spazio un po' ampio tra "Elimina account" e "Debug" nel Profilo.
7. L'avviso "Conferma la tua email" occupa spazio sopra le statistiche finché non si conferma.
8. Pacchetti JavaScript grandi (circa 600 kB l'uno): l'avvio su telefoni lenti può essere lento.

## Lista di controllo finale (per Andrea)
- [ ] Copiare `docs/pubblicazione/android.workflow.yml` in `.github/workflows/android.yml` (da PC o dal sito GitHub).
- [ ] Lanciare `npm run test:rules` sul PC (serve Java per l'emulatore).
- [ ] Pubblicare le regole: `npx firebase-tools deploy --only firestore:rules`.
- [ ] Installare l'APK sul telefono e fare un giro completo con due account veri.
- [ ] Creare la chiave di firma e i 4 segreti (guida `docs/pubblicazione.md`), far girare il workflow, controllare l'AAB.
- [ ] Provare notifiche, GPS, gesto indietro e tema scuro sul telefono.
- [ ] Rileggere `docs/store/` prima di aprire la scheda Play Console.

## Esercizio
Scegli il difetto 3: scrivi una funzione che, data una cella geohash di 4 caratteri, restituisca anche le 8 celle vicine, e un test che verifica che una cella al bordo trovi la vicina.
