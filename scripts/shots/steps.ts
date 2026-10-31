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

export const STEPS: Step[] = [
  { name: '02-eventi', go: (p) => fromHome(p) },
  { name: '22-filtri-aperti', go: async (p) => { await fromHome(p); await p.getByText('Data e distanza').click() } },
  { name: '03-dettaglio-libero', go: (p) => fromHome(p, /Aperitivo sul Naviglio/) },
  { name: '04-dettaglio-approvazione', go: (p) => fromHome(p, /pasta fatta/) },
  { name: '05-dettaglio-pieno', go: (p) => fromHome(p, /Calcetto/) },
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
      await p.locator('.emoji-marker').first().waitFor()
      await p.locator('.emoji-marker', { hasText: '🥾' }).click()
      await p.getByRole('button', { name: 'Apri evento' }).waitFor()
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
  { name: '10-crea-evento', go: (p) => fromHome(p, 'Crea') },
  { name: '19-crea-errori', go: async (p) => { await fromHome(p, 'Crea', 'Crea evento'); await p.getByText(/almeno 3 caratteri/).waitFor() } },
  {
    name: '20-crea-compilato',
    go: async (p) => {
      await fromHome(p, 'Crea')
      await p.getByRole('radio', { name: /cena/ }).click()
      await p.getByLabel(/^Titolo/).fill('Cena in terrazza')
      await p.locator('.point-picker').click({ position: { x: 190, y: 110 } })
      await p.getByLabel(/^Zona/).fill('Navigli')
      await p.getByText(/Punto scelto/).waitFor()
    },
  },
  { name: '18-profilo-scheda', go: (p) => fromHome(p, 'Profilo') },
  { name: '11-profilo', go: (p) => fromHome(p, 'Profilo', 'Modifica profilo') },
  { name: '12-debug', go: (p) => fromHome(p, 'Profilo', 'Debug') },
  { name: '13-accesso', go: (p) => fromHome(p, 'Profilo', 'Esci') },
  { name: '14-registrazione', go: (p) => fromHome(p, 'Profilo', 'Esci', 'Registrati') },
]
