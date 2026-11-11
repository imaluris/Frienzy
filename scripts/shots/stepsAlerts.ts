import type { Page } from 'playwright-core'
import type { Step } from './steps.ts'

// Passi per la campanella e la schermata Avvisi (task 40b).
const click = (page: Page, name: string | RegExp) => page.getByRole('button', { name }).first().click()

async function home(page: Page) {
  await page.reload()
  await page.getByRole('heading').first().waitFor()
}

const bell = (page: Page) => page.getByRole('button', { name: /^Avvisi/ })

export const ALERT_STEPS: Step[] = [
  { name: '70-campanella-contatore', go: async (p) => { await home(p); await p.getByRole('button', { name: /^Avvisi, \d+ nuovi$/ }).waitFor() } },
  { name: '71-avvisi', go: async (p) => { await home(p); await bell(p).click(); await p.locator('.alert-row').first().waitFor() } },
  { name: '72-avvisi-visti', go: async (p) => { await home(p); await bell(p).click(); await p.locator('.alert-row').first().waitFor(); await click(p, 'Indietro'); await p.getByRole('button', { name: 'Avvisi', exact: true }).waitFor() } },
  {
    name: '73-avvisi-vuoto',
    go: async (p) => {
      await home(p)
      await click(p, 'Profilo')
      for (const name of ['Richieste di partecipazione', 'Risposte alle tue richieste', 'Inviti vicino a te']) {
        const sw = p.getByRole('switch', { name })
        if ((await sw.getAttribute('aria-checked')) === 'true') await sw.click()
      }
      await click(p, 'Eventi')
      await bell(p).click()
      await p.getByText(/Nessun avviso per ora/).waitFor()
    },
  },
]
