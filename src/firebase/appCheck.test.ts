import { appCheckSiteKey } from './appCheck'

describe('App Check', () => {
  it('resta spento senza chiave (assente, vuota o solo spazi)', () => {
    expect(appCheckSiteKey({})).toBeNull()
    expect(appCheckSiteKey({ VITE_APPCHECK_SITE_KEY: '' })).toBeNull()
    expect(appCheckSiteKey({ VITE_APPCHECK_SITE_KEY: '   ' })).toBeNull()
  })
  it('con la chiave si attiva', () => {
    expect(appCheckSiteKey({ VITE_APPCHECK_SITE_KEY: ' abc123 ' })).toBe('abc123')
  })
})
