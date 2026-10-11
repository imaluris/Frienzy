import { validateEmail, validateLogin, validatePassword, validateRegistration } from './validation'

describe('validazione accesso', () => {
  it('accetta email valide e rifiuta quelle sbagliate', () => {
    expect(validateEmail('ada@example.com')).toBeNull()
    expect(validateEmail('  ada@example.com ')).toBeNull()
    expect(validateEmail('ada')).not.toBeNull()
    expect(validateEmail('ada@example')).not.toBeNull()
    expect(validateEmail('a b@example.com')).not.toBeNull()
  })

  it('richiede almeno 6 caratteri di password', () => {
    expect(validatePassword('12345')).not.toBeNull()
    expect(validatePassword('123456')).toBeNull()
  })

  it('il login richiede email valida e password non vuota', () => {
    expect(validateLogin('ada@example.com', '')).toBe('Inserisci la password.')
    expect(validateLogin('x', 'abc')).not.toBeNull()
    expect(validateLogin('ada@example.com', 'abc')).toBeNull()
  })

  it('la registrazione controlla anche la conferma', () => {
    expect(validateRegistration('ada@example.com', 'segreta1', 'segreta2')).toBe('Le due password non coincidono.')
    expect(validateRegistration('ada@example.com', 'segreta1', 'segreta1')).toBeNull()
  })
})
