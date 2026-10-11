import { authErrorMessage } from './errorMessages'
import { MemoryAuthService } from './memoryAuthService'

describe('MemoryAuthService', () => {
  it('registra, entra subito e permette il logout', async () => {
    const auth = new MemoryAuthService()
    const uid = await auth.register('ada@example.com', 'segreta1')
    expect(auth.currentUid()).toBe(uid)
    await auth.logout()
    expect(auth.currentUid()).toBeNull()
  })

  it('rifiuta una seconda registrazione con la stessa email (maiuscole comprese)', async () => {
    const auth = new MemoryAuthService()
    await auth.register('ada@example.com', 'segreta1')
    await expect(auth.register('ADA@example.com', 'altra123')).rejects.toMatchObject({
      code: 'auth/email-already-in-use',
    })
  })

  it('rifiuta password deboli', async () => {
    await expect(new MemoryAuthService().register('ada@example.com', '123')).rejects.toMatchObject({
      code: 'auth/weak-password',
    })
  })

  it('il login funziona con la password giusta e fallisce con quella sbagliata', async () => {
    const auth = new MemoryAuthService()
    const uid = await auth.register('ada@example.com', 'segreta1')
    await auth.logout()
    await expect(auth.login('ada@example.com', 'sbagliata')).rejects.toMatchObject({
      code: 'auth/invalid-credential',
    })
    expect(await auth.login('ada@example.com', 'segreta1')).toBe(uid)
  })

  it('avvisa chi ascolta e smette dopo l\'annullamento', async () => {
    const auth = new MemoryAuthService()
    const seen: Array<string | null> = []
    const stop = auth.onChange((uid) => seen.push(uid))
    const uid = await auth.register('ada@example.com', 'segreta1')
    stop()
    await auth.logout()
    expect(seen).toEqual([null, uid])
  })
})

describe('authErrorMessage', () => {
  it('traduce i codici noti e usa un testo generico per il resto', () => {
    expect(authErrorMessage({ code: 'auth/email-already-in-use' })).toContain('già')
    expect(authErrorMessage(new Error('boh'))).toBe('Qualcosa è andato storto. Riprova.')
    expect(authErrorMessage(null)).toBe('Qualcosa è andato storto. Riprova.')
  })
})
