import { AVATAR_COLORS } from '../config/avatarColors'

// Iniziali da mostrare nell'avatar: prima lettera di nome e (se c'è) cognome, in maiuscolo.
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  const first = Array.from(words[0])[0]
  const last = words.length > 1 ? Array.from(words[words.length - 1])[0] : ''
  return (first + last).toLocaleUpperCase('it-IT')
}

// Stesso nome, stesso colore: la scelta dipende solo dal testo.
export function avatarColorFor(name: string): string {
  let hash = 0
  for (const ch of name.trim().toLowerCase()) hash = (hash * 31 + ch.codePointAt(0)!) >>> 0
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}
