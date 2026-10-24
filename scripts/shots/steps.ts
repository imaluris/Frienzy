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
  { name: '01-home', go: (p) => fromHome(p) },
  { name: '02-eventi', go: (p) => fromHome(p, 'Eventi') },
  { name: '03-dettaglio-libero', go: (p) => fromHome(p, 'Eventi', /Aperitivo sul Naviglio/) },
  { name: '04-dettaglio-approvazione', go: (p) => fromHome(p, 'Eventi', /pasta fatta/) },
  { name: '05-dettaglio-pieno', go: (p) => fromHome(p, 'Eventi', /Calcetto/) },
  { name: '06-dettaglio-annullato', go: (p) => fromHome(p, 'I miei eventi', /annullata/) },
  { name: '07-dettaglio-organizzatore', go: (p) => fromHome(p, 'I miei eventi', /Passeggiata/) },
  { name: '15-dopo-partecipa', go: async (p) => { await fromHome(p, 'Eventi', /Aperitivo sul Naviglio/, 'Partecipa'); await p.getByText(/confermata/).waitFor() } },
  { name: '16-richiesta-inviata', go: async (p) => { await fromHome(p, 'Eventi', /pasta fatta/, 'Chiedi di partecipare'); await p.getByText(/Richiesta inviata/).waitFor() } },
  { name: '17-organizzatore-richieste', go: (p) => fromHome(p, 'I miei eventi', /Brunch/) },
  { name: '08-miei-eventi', go: (p) => fromHome(p, 'I miei eventi') },
  { name: '09-mappa', go: (p) => fromHome(p, 'Mappa') },
  { name: '10-crea-evento', go: (p) => fromHome(p, 'Crea evento') },
  { name: '11-profilo', go: (p) => fromHome(p, 'Modifica profilo') },
  { name: '12-debug', go: (p) => fromHome(p, 'Debug') },
  { name: '13-accesso', go: (p) => fromHome(p, 'Esci') },
  { name: '14-registrazione', go: (p) => fromHome(p, 'Esci', 'Registrati') },
]
