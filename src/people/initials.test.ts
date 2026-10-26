import { avatarColorFor, initialsOf } from './initials'
import { AVATAR_COLORS } from '../config/avatarColors'

describe('iniziali e colore dell\'avatar', () => {
  it('prende nome e cognome in maiuscolo', () => {
    expect(initialsOf('ada lovelace')).toBe('AL')
    expect(initialsOf('  Giulia ')).toBe('G')
    expect(initialsOf('Maria Anna Rossi')).toBe('MR')
  })
  it('con un nome vuoto mostra un punto interrogativo', () => {
    expect(initialsOf('   ')).toBe('?')
  })
  it('il colore è sempre lo stesso per lo stesso nome e viene dalla lista', () => {
    expect(avatarColorFor('Ada')).toBe(avatarColorFor(' ada '))
    expect(AVATAR_COLORS).toContain(avatarColorFor('Giulia'))
  })
})
