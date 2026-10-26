import { avatarColorFor, initialsOf } from '../people/initials'

// Cerchio colorato con le iniziali. Nessuna foto: non dipende da Storage.
export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span className={`avatar avatar-${size}`} style={{ background: avatarColorFor(name) }} aria-hidden="true">
      {initialsOf(name)}
    </span>
  )
}
