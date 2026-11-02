# Giorno 33 – Movimento, identità e rifinitura

**Interpretazione scelta:** il task chiede quattro cose distinte: (1) icona e splash definitive, (2) barra di stato, (3) transizioni e feedback al tocco, (4) toast e vibrazione. Le ho fatte tutte; le illustrazioni complete restano al 33a.

## Perché queste scelte

**Un solo marchio, disegnato una volta.** Le forme (due fumetti che si sovrappongono: davanti quello con la F, dietro quello verde con i tre puntini "sta scrivendo", più una scintilla senape) stanno in `src/brand/logoPaths.ts`, un file di soli dati. Lo usano sia il componente React `LogoMark` sia lo script `scripts/brand/make-assets.ts`, così l'icona del telefono e il logo nell'app non possono divergere.

**Icona adattiva Android.** Android ritaglia l'icona con la forma scelta dal telefono (cerchio, goccia…) e tiene sicura solo la zona centrale. Per questo l'icona è fatta di tre strati: sfondo (un colore pieno terracotta, `values/ic_launcher_background.xml`), primo piano (il marchio chiaro, dentro il 61% centrale) e, da Android 13, un livello *monochrome* (sagoma a un colore con F e puntini ritagliati) per le icone "a tema". Per i telefoni vecchi ci sono anche le icone classiche quadrata e tonda.

**Splash.** `drawable/splash.xml` è una *layer-list*: colore terracotta + logo centrato (bitmap `splash_logo.png` in 5 densità). Prima i vecchi `splash.png` (uno per orientamento e densità) venivano stirati; ora un solo XML funziona ovunque. Android 12+ usa invece gli attributi `windowSplashScreen*` in `styles.xml` (sfondo + icona). Il nome "Frienzy" è scuro e non crema perché crema su terracotta ha contrasto 2,9:1 (sotto il 3:1 richiesto per testi grandi), il testo scuro 5,1:1.

**Barra di stato.** Plugin `@capacitor/status-bar`, configurato in `capacitor.config.ts` e applicato a runtime da `src/native/nativeBars.ts` (crema con icone scure, come la testata). Sul web non fa nulla.

**Toast e vibrazione.** `src/feedback/`: `ToastProvider` tiene un solo messaggio alla volta; `useToast().show(testo, tono)`. Con tono `success`/`warning` chiama anche `haptic()` (plugin Haptics). Fuori da un provider (nei test dei singoli schermi) `show` non fa nulla, così nessuna schermata dipende dal toast.

**Transizioni.** In `AppShell` il contenuto sta in un `div` con `key={screenKey(nav)}`: quando la chiave cambia React lo rimonta e l'animazione riparte. Cambio scheda = dissolvenza con piccolo salto verticale (200 ms); schermata aperta sopra (dettaglio, modifica) = scorre da destra (220 ms). Ho animato `top`/`left` (con `position: relative`) invece di `transform`: un `transform` su un antenato rende "relativi a lui" gli elementi `position: fixed` (barra azione, toast) e durante l'animazione salterebbero. Tutto è disattivato con `prefers-reduced-motion`.

## Codice, pezzo per pezzo
- `scripts/brand/svg.ts`: funzioni che restituiscono SVG (icona, primo piano, monocromatico, logo splash). Il monocromatico usa `<mask>` per "bucare" F e puntini.
- `scripts/brand/make-assets.ts` (`npm run brand`): apre Chromium con Playwright, disegna ogni SVG a ogni dimensione e salva i PNG con sfondo trasparente (`omitBackground`). Il font Nunito va incorporato come data URI, perché una pagina vuota non può leggere file locali.
- `src/nav/screenTransition.ts`: due funzioni pure (`screenKey`, `transitionKind`) con test.
- `useRunAction` ora restituisce `true/false`: chi lo usa mostra il toast solo se l'azione è riuscita.
- Toast mostrati: iscrizione, richiesta, ritiro, richiesta accettata/rifiutata, evento annullato, evento pubblicato, profilo aggiornato, condivisione.

## Errori incontrati
1. Il wordmark della splash usciva in un font serif: il `@font-face` puntava a un file locale. Risolto con data URI.
2. Il primo testo del toast "Richiesta inviata…" duplicava la frase già mostrata nella pagina e rompeva i test (`getByText` trovava due elementi): ho cambiato le frasi.
3. La splash web non si riesce a fotografare perché con i servizi in memoria l'accesso è istantaneo: l'ho controllata solo tramite i PNG generati (vedi sotto).

## Cosa ho visto negli screenshot
`docs/screenshots/35-icona-e-splash.png` mostra icona, primo piano, sagoma e logo splash: il marchio si legge anche piccolo e la F resta chiara. Nell'elenco eventi e nel benvenuto il nuovo logo compare nella testata. Nel dettaglio dopo l'iscrizione il toast scuro con segno di spunta senape sta sopra la barra azione e non copre il pulsante. Difetto noto (da 33c): nel benvenuto resta un vuoto tra testo e pulsanti. Non verificabile da qui: aspetto reale su OnePlus (forma dell'icona, splash di Android 12, barra di stato, vibrazione).

## Esercizio per Andrea
In `src/feedback/toastModel.ts` cambia `TOAST_MS` da 2600 a 5000 e guarda cosa succede quando premi due azioni di fila. Poi prova ad aggiungere un tono `'error'` con colore rosso (ricordati di aggiungerlo anche in `Toast.tsx` e `toast.css`).
