import { Avatar } from './Avatar'

const MAX_SHOWN = 3

// Avatar sovrapposti con contatore "+N" per chi non entra. Senza nomi non disegna nulla.
export function AvatarStack({ names }: { names: string[] }) {
  if (names.length === 0) return null
  const extra = names.length - MAX_SHOWN
  return (
    <span className="avatar-stack" role="img" aria-label={`${names.length} ${names.length === 1 ? 'persona' : 'persone'} partecipano`}>
      {names.slice(0, MAX_SHOWN).map((name) => <Avatar key={name} name={name} size="xs" />)}
      {extra > 0 && <span className="avatar avatar-xs avatar-more">+{extra}</span>}
    </span>
  )
}
