import type { Page } from 'playwright-core'

// Un passo = un nome di file e le azioni per arrivare a quella schermata.
export interface Step {
  name: string
  go: (page: Page) => Promise<void>
}

const click = (page: Page, name: string | RegExp) => page.getByRole('button', { name }).first().click()

// Ogni schermata riparte dalla home (la pagina si ricarica e i dati demo si ricreano): i passi sono indipendenti.
async function fromHome(page: Page, ...clicks: (string | RegExp)[]) {
  await page.reload()
  await page.getByRole('heading').first().waitFor()
  for (const name of clicks) await click(page, name)
}

// Registra un nuovo account e arriva al passo 2 (il profilo).
async function onboarding(page: Page) {
  await fromHome(page, 'Profilo', 'Esci', 'Crea il tuo account')
  await page.getByLabel('Email').fill('nuova@example.com')
  await page.getByLabel('Password', { exact: true }).fill('segreta12')
  await page.getByLabel('Ripeti la password').fill('segreta12')
  await click(page, 'Continua')
}

// Compila i passi di Crea evento fino a quello indicato (0 = tipo, 3 = dove, 4 = posti, 5 = riepilogo).
async function toStep(page: Page, target: number) {
  await fromHome(page, 'Crea')
  await page.getByRole('radio', { name: /cena/ }).click()
  await click(page, 'Continua')
  await page.getByLabel(/^Titolo/).fill('Cena in terrazza')
  await click(page, 'Continua')
  const d = new Date(Date.now() + 5 * 24 * 3600 * 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  await page.getByLabel(/^Data e ora/).fill(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T20:00`)
  await click(page, 'Continua')
  if (target <= 3) return
  await page.locator('.point-picker').click({ position: { x: 190, y: 110 } })
  await page.getByLabel(/^Zona/).fill('Navigli')
  await page.getByLabel(/^Indirizzo esatto/).fill('Via Roma 1')
  await click(page, 'Continua')
  if (target <= 4) return
  await click(page, 'Continua')
}

export const STEPS: Step[] = [
  { name: '02-eventi', go: (p) => fromHome(p) },
  { name: '36-scoperta', go: async (p) => { await fromHome(p); await p.getByRole('region', { name: 'Vicino a te' }).waitFor() } },
  { name: '40-scoperta-weekend', go: async (p) => { await fromHome(p); const r = p.getByRole('region', { name: 'Questo weekend' }); await r.scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, -120)) } },
  {
    name: '37-salvati',
    go: async (p) => {
      await fromHome(p)
      const perTe = p.getByRole('region', { name: 'Per te' })
      await perTe.getByRole('button', { name: 'Salva evento' }).first().click()
      await perTe.getByRole('button', { name: 'Salva evento' }).first().click()
      await click(p, 'I miei eventi')
      await p.getByRole('tab', { name: /Salvati/ }).click()
      await p.getByRole('heading').first().waitFor()
    },
  },
  { name: '38-salvati-vuoto', go: async (p) => { await fromHome(p, 'I miei eventi'); await p.getByRole('tab', { name: /Salvati/ }).click(); await p.getByText(/Non hai ancora salvato/).waitFor() } },
  {
    name: '39-tira-per-aggiornare',
    go: async (p) => {
      await fromHome(p)
      // Simula un dito che tira verso il basso a metà strada (senza rilasciare).
      await p.evaluate(() => {
        const target = document.querySelector('.pull') as HTMLElement
        const t = (y: number) => new Touch({ identifier: 1, target, clientX: 100, clientY: y })
        target.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [t(200)] }))
        target.dispatchEvent(new TouchEvent('touchmove', { bubbles: true, touches: [t(330)] }))
      })
    },
  },
  { name: '34-eventi-nessun-risultato', go: async (p) => { await fromHome(p); await p.getByRole('searchbox').fill('zzzzqq'); await p.getByText(/Nessun risultato/).waitFor() } },
  { name: '35-coriandoli', go: async (p) => { await fromHome(p, /Aperitivo sul Naviglio/, 'Partecipa'); await p.getByText(/confermata/).waitFor(); await p.waitForTimeout(450) } },
  { name: '22-filtri-aperti', go: async (p) => { await fromHome(p); await p.getByText('Data e distanza').click() } },
  { name: '03-dettaglio-libero', go: (p) => fromHome(p, /Aperitivo sul Naviglio/) },
  { name: '04-dettaglio-approvazione', go: (p) => fromHome(p, /pasta fatta/) },
  { name: '05-dettaglio-pieno', go: (p) => fromHome(p, /Calcetto/) },
  { name: '55-lista-attesa-iscritto', go: async (p) => { await fromHome(p, /Calcetto/, "Mettiti in lista d'attesa"); await p.getByText(/2° in lista/).waitFor() } },
  { name: '56-lista-attesa-uscita', go: async (p) => { await fromHome(p, /Calcetto/, "Mettiti in lista d'attesa"); await p.getByText(/2° in lista/).waitFor(); await p.getByText(/ti avvisiamo se si libera/).waitFor({ state: 'hidden' }); await click(p, 'Esci dalla lista'); await p.getByRole('dialog').waitFor() } },
  { name: '06-dettaglio-annullato', go: (p) => fromHome(p, 'I miei eventi', /annullata/) },
  { name: '07-dettaglio-organizzatore', go: (p) => fromHome(p, 'I miei eventi', /Passeggiata/) },
  { name: '15-dopo-partecipa', go: async (p) => { await fromHome(p, /Aperitivo sul Naviglio/, 'Partecipa'); await p.getByText(/confermata/).waitFor() } },
  { name: '16-richiesta-inviata', go: async (p) => { await fromHome(p, /pasta fatta/, 'Chiedi di partecipare'); await p.getByText(/Richiesta inviata/).waitFor() } },
  { name: '17-organizzatore-richieste', go: (p) => fromHome(p, 'I miei eventi', /Brunch/) },
  { name: '24-organizzatore-gestisci', go: async (p) => { await fromHome(p, 'I miei eventi', /Brunch/, /Gestisci evento/); await p.getByRole('dialog').waitFor() } },
  { name: '25-conferma-ritiro', go: async (p) => { await fromHome(p, /Aperitivo sul Naviglio/, 'Partecipa'); await p.getByText(/confermata/).waitFor(); await click(p, 'Ritirati'); await p.getByRole('dialog').waitFor() } },
  { name: '08-miei-eventi', go: (p) => fromHome(p, 'I miei eventi') },
  { name: '09-mappa', go: (p) => fromHome(p, 'Mappa') },
  {
    name: '21-mappa-popup',
    go: async (p) => {
      await fromHome(p, 'Mappa')
      await p.locator('.event-pin').first().waitFor()
      await p.locator('.event-pin', { hasText: '🥾' }).click()
      await p.getByRole('button', { name: 'Vedi evento' }).waitFor()
    },
  },
  {
    name: '23-mappa-cluster-aperto',
    go: async (p) => {
      await fromHome(p, 'Mappa')
      await p.locator('.cluster-marker').waitFor()
      await p.locator('.cluster-marker').click()
      await p.waitForTimeout(800)
    },
  },
  {
    name: '30-mappa-scheda-estesa',
    go: async (p) => {
      await fromHome(p, 'Mappa')
      await p.getByRole('button', { name: /Apri o chiudi/ }).click()
      await p.getByRole('button', { name: /Apri o chiudi/ }).click()
      await p.locator('.event-row').first().waitFor()
    },
  },
  { name: '10-crea-evento', go: (p) => fromHome(p, 'Crea') },
  { name: '19-crea-errori', go: async (p) => { await fromHome(p, 'Crea', 'Continua', 'Continua', 'Continua'); await p.getByText(/almeno 3 caratteri/).waitFor() } },
  { name: '20-crea-testo', go: async (p) => { await fromHome(p, 'Crea'); await p.getByRole('radio', { name: /cena/ }).click(); await click(p, 'Continua'); await p.getByLabel(/^Titolo/).fill('Cena in terrazza con vista sui tetti di Milano') } },
  { name: '31-crea-dove', go: async (p) => { await toStep(p, 3); await p.locator('.point-picker').click({ position: { x: 190, y: 110 } }); await p.getByLabel(/^Zona/).fill('Navigli'); await p.getByText(/Punto scelto/).waitFor() } },
  { name: '32-crea-posti', go: async (p) => { await toStep(p, 4); await click(p, 'Un posto in più') } },
  { name: '33-crea-riepilogo', go: async (p) => { await toStep(p, 5); await p.getByRole('heading', { name: 'Tutto pronto?' }).waitFor() } },
  { name: '18-profilo-scheda', go: (p) => fromHome(p, 'Profilo') },
  { name: '11-profilo', go: (p) => fromHome(p, 'Profilo', 'Modifica profilo') },
  { name: '12-debug', go: (p) => fromHome(p, 'Profilo', 'Debug') },
  { name: '26-benvenuto', go: (p) => fromHome(p, 'Profilo', 'Esci') },
  { name: '13-accesso', go: (p) => fromHome(p, 'Profilo', 'Esci', 'Accedi') },
  { name: '27-registrazione-passo2', go: async (p) => { await onboarding(p); await p.getByRole('heading', { name: 'Come ti chiami?' }).waitFor() } },
  { name: '28-registrazione-passo3', go: async (p) => { await onboarding(p); await p.getByLabel('Nome').fill('Marta Rossi'); await p.getByLabel('Data di nascita').fill('1994-03-12'); await click(p, 'Continua'); await click(p, /aperitivo/); await click(p, /passeggiata/) } },
  { name: '29-registrazione-passo4', go: async (p) => { await onboarding(p); await p.getByLabel('Nome').fill('Marta Rossi'); await p.getByLabel('Data di nascita').fill('1994-03-12'); await click(p, 'Continua'); await click(p, 'Salta per ora') } },
  { name: '41-chat-confermato', go: async (p) => { await fromHome(p, /Trekking al lago/, /Chat dell'evento/); await p.getByText(/parcheggio di Onno/).waitFor() } },
  { name: '42-chat-organizzatore', go: async (p) => { await fromHome(p, 'I miei eventi', /Passeggiata/, /Chat dell'evento/); await p.getByText(/più siamo meglio/).waitFor() } },
  { name: '43-chat-segnaposto', go: async (p) => { await fromHome(p, /pasta fatta/); await p.getByText('La chat si apre quando sei confermato.').waitFor() } },
  { name: '44-chat-cancella', go: async (p) => { await fromHome(p, 'I miei eventi', /Passeggiata/, /Chat dell'evento/); await click(p, /Cancella il messaggio di Giulia/); await p.getByRole('dialog').waitFor() } },
  { name: '45-chat-vuota', go: async (p) => { await fromHome(p, 'I miei eventi', /Brunch/, /Chat dell'evento/); await p.getByText(/Ancora nessun messaggio/).waitFor() } },
  { name: '46-chat-scrittura', go: async (p) => { await fromHome(p, /Trekking al lago/, /Chat dell'evento/); await p.getByLabel('Scrivi un messaggio').fill('Ci sono anch\'io, porto i panini per tutti! Qualcuno vuole qualcosa di particolare?') } },
  { name: '47-menu-azioni', go: async (p) => { await fromHome(p, /pasta fatta/, 'Altre azioni'); await p.getByRole('dialog').waitFor() } },
  { name: '48-segnala-evento', go: async (p) => { await fromHome(p, /pasta fatta/, 'Altre azioni', 'Segnala questo evento'); await p.getByLabel('Truffa o richiesta di soldi').check() } },
  { name: '49-segnala-altro', go: async (p) => { await fromHome(p, /pasta fatta/, 'Altre azioni', /Segnala /); await p.getByLabel('Altro', { exact: true }).check(); await p.getByLabel('Racconta cosa è successo').fill('Mi ha scritto più volte fuori dall\'evento anche dopo che avevo detto di no.') } },
  { name: '50-blocca-conferma', go: async (p) => { await fromHome(p, /pasta fatta/, 'Altre azioni', /Blocca /); await p.getByRole('dialog', { name: /Bloccare/ }).waitFor() } },
  { name: '51-persone-menu', go: async (p) => { await fromHome(p, /Trekking al lago/); await p.getByRole('button', { name: /Altre azioni per/ }).first().click(); await p.getByRole('dialog').waitFor() } },
  { name: '52-profilo-bloccati', go: async (p) => { await fromHome(p, /pasta fatta/, 'Altre azioni', /Blocca /, 'Blocca'); await p.getByRole('dialog').waitFor({ state: 'detached' }); await p.getByText(/Hai bloccato/).waitFor({ state: 'detached' }); await click(p, 'Profilo'); await click(p, /Utenti bloccati/); await p.getByRole('dialog').waitFor() } },
  { name: '53-elimina-account-avviso', go: async (p) => { await fromHome(p, 'Profilo', 'Elimina account'); await p.getByRole('dialog').waitFor(); await p.getByText(/Verranno annullati/).waitFor() } },
  { name: '54-elimina-account-password', go: async (p) => { await fromHome(p, 'Profilo', 'Elimina account', 'Continua'); await p.getByLabel('Password', { exact: true }).fill('sbagliata1'); await click(p, 'Elimina definitivamente'); await p.getByRole('alert').waitFor() } },
  { name: '14-registrazione', go: (p) => fromHome(p, 'Profilo', 'Esci', 'Crea il tuo account') },
]
