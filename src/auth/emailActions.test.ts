import { MemoryAuthService } from './memoryAuthService'
import { RESEND_COOLDOWN_MS, RESET_SENT_MESSAGE, requestPasswordReset, resendWaitSeconds } from './emailActions'

describe('requestPasswordReset', () => {
  it('con un indirizzo valido dà sempre lo stesso messaggio, che esista un account o no', async () => {
    const auth = new MemoryAuthService()
    await auth.register('ada@example.com', 'segreta1')
    expect(await requestPasswordReset(auth, 'ada@example.com')).toBe(RESET_SENT_MESSAGE)
    expect(await requestPasswordReset(auth, 'nessuno@example.com')).toBe(RESET_SENT_MESSAGE)
  })

  it('con un indirizzo non valido dà errore e non invia nulla', async () => {
    const auth = new MemoryAuthService()
    await expect(requestPasswordReset(auth, 'ciao')).rejects.toThrow('Inserisci un indirizzo email valido.')
    await expect(requestPasswordReset(auth, '')).rejects.toMatchObject({ code: 'auth/invalid-email' })
    expect(auth.sentEmails).toEqual([])
  })
})

describe('resendWaitSeconds', () => {
  it('mai inviato: si può subito', () => expect(resendWaitSeconds(null, 1000)).toBe(0))
  it('appena inviato: aspetta tutto il tempo, poi scende fino a zero', () => {
    expect(resendWaitSeconds(0, 0)).toBe(60)
    expect(resendWaitSeconds(0, 15_500)).toBe(45)
    expect(resendWaitSeconds(0, RESEND_COOLDOWN_MS)).toBe(0)
    expect(resendWaitSeconds(0, RESEND_COOLDOWN_MS + 5000)).toBe(0)
  })
})
