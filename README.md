# Frienzy

App per organizzare eventi dal vivo (aperitivi, cene, mostre, trekking, passeggiate, sport) e fare nuove amicizie. Android (Capacitor) con interfaccia web React + Firebase.

## Cosa fa
Si crea un evento (tipo, data, zona, punto sulla mappa, massimo partecipanti, approvazione facoltativa), si sfoglia l'elenco o la mappa con i filtri, si partecipa o si chiede di partecipare. Si vedono solo i profili di organizzatore e partecipanti; l'indirizzo esatto lo vedono solo l'organizzatore e i confermati. Solo maggiorenni.

## Anteprima senza Firebase
```
npm ci
VITE_DEMO=1 npm run dev     # app con dati d'esempio, tutto in memoria
npm run shots               # screenshot 390x844 in docs/screenshots/ (serve Chromium)
```

## Controlli
```
npm run build && npm run lint && npm test && npm run check:contrast
```
Con Firebase vero: copia `.env.example` in `.env` e metti i valori del tuo progetto. Il file `google-services.json` non va mai nel repository.

## Struttura
`src/domain` modelli, `src/data` interfacce dei repository (con versione in memoria), `src/firebase` versione Firebase, `src/screens` e `src/ui` schermate, `src/map` mappa, `src/styles` stili. Le note di studio sono in `docs/` (una per giorno).

## Stato
MVP e Fase 2 completati. Cosa è stato provato e cosa no: vedi `docs/giorno-27-verifica-finale.md`.
