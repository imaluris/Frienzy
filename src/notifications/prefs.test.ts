import { MemoryNotificationRepository } from './memoryNotificationRepository'
import { DEFAULT_PREFS, normalizePrefs } from './prefs'

describe('preferenze di notifica', () => {
  it('senza nulla di salvato valgono i default (inviti spenti)', async () => {
    const repo = new MemoryNotificationRepository()
    expect(await repo.getPrefs('a')).toEqual(DEFAULT_PREFS)
    expect(DEFAULT_PREFS.inviti).toBe(false)
  })

  it('salva e rilegge, una copia per volta', async () => {
    const repo = new MemoryNotificationRepository()
    await repo.savePrefs('a', { ...DEFAULT_PREFS, promemoria: false })
    const read = await repo.getPrefs('a')
    read.richieste = false
    expect((await repo.getPrefs('a')).promemoria).toBe(false)
    expect((await repo.getPrefs('a')).richieste).toBe(true)
  })

  it('normalizePrefs ignora chiavi mancanti o con tipo sbagliato', () => {
    expect(normalizePrefs({ promemoria: false, inviti: 'sì', altro: true })).toEqual({ ...DEFAULT_PREFS, promemoria: false })
    expect(normalizePrefs(null)).toEqual(DEFAULT_PREFS)
  })

  it('clear cancella preferenze e dispositivo', async () => {
    const repo = new MemoryNotificationRepository()
    await repo.savePrefs('a', { ...DEFAULT_PREFS, risposte: false })
    await repo.saveDevice('a', { token: 't', zona: 'u0nd9' })
    await repo.clear('a')
    expect(await repo.getPrefs('a')).toEqual(DEFAULT_PREFS)
    expect(repo.deviceOf('a')).toBeUndefined()
  })
})
