import {
  ArrowLeft, CalendarDays, CalendarX, Check, Clock, Heart, House, LocateFixed, Map, MapPin, PartyPopper,
  Plus, Search, SearchX, Share2, SlidersHorizontal, Ticket, UserRound, UsersRound, X, type LucideIcon,
} from 'lucide-react'

// Set unico di icone vettoriali (libreria lucide-react, licenza ISC): stesso tratto e stessa griglia ovunque.
export const ICONS = {
  calendar: CalendarDays,
  'calendar-empty': CalendarX,
  map: Map,
  plus: Plus,
  ticket: Ticket,
  user: UserRound,
  back: ArrowLeft,
  pin: MapPin,
  home: House,
  users: UsersRound,
  search: Search,
  'search-empty': SearchX,
  clock: Clock,
  heart: Heart,
  share: Share2,
  check: Check,
  close: X,
  locate: LocateFixed,
  filters: SlidersHorizontal,
  party: PartyPopper,
} satisfies Record<string, LucideIcon>

export type IconName = keyof typeof ICONS

interface Props {
  name: IconName
  /** Lato in pixel (multipli di 4: 16, 20, 24, 32). */
  size?: number
  /** Versione piena (icona attiva) invece del contorno. */
  filled?: boolean
  /** Riempimento pieno al 100% (es. cuore salvato) invece del velo leggero dell'icona attiva. */
  solid?: boolean
  className?: string
}

// Icona decorativa: il significato lo dà sempre il testo accanto (o l'aria-label del pulsante).
export function Icon({ name, size = 24, filled = false, solid = false, className }: Props) {
  const Glyph = ICONS[name]
  return (
    <Glyph
      className={className}
      size={size}
      strokeWidth={filled ? 2.25 : 2}
      fill={filled || solid ? 'currentColor' : 'none'}
      fillOpacity={solid ? 1 : filled ? 0.22 : 0}
      aria-hidden="true"
      focusable="false"
    />
  )
}
