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
1. (Risolto) `.github/workflows/android.yml` ora è il workflow con AAB firmato, copiato da `docs/pubblicazione/android.workflow.yml`. Ha girato su GitHub con esito verde (esecuzioni 38 e 39): APK di debug compilato con Gradle; i passi di firma sono saltati perché i segreti non ci sono ancora.
2. Nessuna prova end-to-end su Firebase e telefono: eventuali errori di regole o di permessi Android sono sconosciuti.

**Media**
3. Gli inviti per zona usano una cella geohash di 4 caratteri: chi è in una cella vicina non viene trovato.
4. Nessuna notifica per i messaggi di chat né per chi sale dalla lista d'attesa (solo "risposte").
5. Un promemoria locale non segue un cambio d'orario finché l'app non si riapre; il controllo su GitHub si sospende dopo 60 giorni senza attività nel repo.

**Bassa (estetica)**
6. Spazio un po' ampio tra "Elimina account" e "Debug" nel Profilo.
7. L'avviso "Conferma la tua email" occupa spazio sopra le statistiche finché non si conferma.
8. Pacchetti JavaScript grandi (circa 600 kB l'uno): l'avvio su telefoni lenti può essere lento.

## Lista di controllo finale
Fatto dalla sessione cloud: controlli automatici, screenshot, workflow Android copiato.

Restano solo cose che dalla sessione cloud non si possono fare (servono credenziali, il telefono o un pagamento):
- [ ] Segreti di firma su GitHub (4 valori, guida `docs/pubblicazione.md`): servono le impostazioni del repo e la chiave, che non devono passare dal repo.
- [ ] Regole pubblicate su Firebase ed emulatore delle regole: serve l'accesso al progetto Firebase, bloccato dalla rete del cloud.
- [ ] Prova sul telefono con due account veri (APK dal workflow): GPS, notifiche, gesto indietro, tema scuro.
- [ ] Account Play Console: è a pagamento, decisione tua.

## Esercizio
Scegli il difetto 3: scrivi una funzione che, data una cella geohash di 4 caratteri, restituisca anche le 8 celle vicine, e un test che verifica che una cella al bordo trovi la vicina.
