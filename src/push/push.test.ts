import { initialPushState, pushReducer } from './pushState'

describe('pushReducer', () => {
  it('permesso concesso -> registrazione in corso', () => {
    expect(pushReducer(initialPushState, { type: 'permission', permission: 'granted' }).status).toBe('registering')
  })
  it('permesso negato o non deciso -> denied', () => {
    expect(pushReducer(initialPushState, { type: 'permission', permission: 'denied' }).status).toBe('denied')
    expect(pushReducer(initialPushState, { type: 'permission', permission: 'prompt' }).status).toBe('denied')
  })
  it('il token porta a registered e cancella l\'errore', () => {
    const failed = pushReducer(initialPushState, { type: 'error', message: 'boom' })
    const ok = pushReducer(failed, { type: 'token', token: 'abc' })
    expect(ok).toMatchObject({ status: 'registered', token: 'abc', error: '' })
  })
  it('una notifica si ricorda senza cambiare stato', () => {
    const s = pushReducer({ ...initialPushState, status: 'registered' }, { type: 'notification', info: { title: 'Ciao', body: 'x' } })
    expect(s.status).toBe('registered')
    expect(s.last?.title).toBe('Ciao')
  })
  it('non supportato', () => {
    expect(pushReducer(initialPushState, { type: 'unsupported' }).status).toBe('unsupported')
  })
})
