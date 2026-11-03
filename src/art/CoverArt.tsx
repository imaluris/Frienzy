import { useId } from 'react'
import type { EventTypeId } from '../domain/eventTypes'
import { rngFor } from './seed'
import { Altro } from './scenes/Altro'
import { Aperitivo } from './scenes/Aperitivo'
import { Cena } from './scenes/Cena'
import { Mostra } from './scenes/Mostra'
import { Passeggiata } from './scenes/Passeggiata'
import { Sport } from './scenes/Sport'
import { Trekking } from './scenes/Trekking'
import { SCENE_H, SCENE_W, type SceneProps } from './scenes/types'

const SCENES: Record<EventTypeId, (props: SceneProps) => React.JSX.Element> = {
  aperitivo: Aperitivo,
  cena: Cena,
  mostra: Mostra,
  trekking: Trekking,
  passeggiata: Passeggiata,
  sport: Sport,
  altro: Altro,
}

/**
 * Copertina illustrata di un evento. Il tipo sceglie la scena, l'id sceglie la variante:
 * stesso id = stessa copertina, id diversi dello stesso tipo = varianti (colori, posizioni, dettagli).
 * Riempie il contenitore ("slice"): il soggetto sta al centro, i bordi possono tagliarsi.
 */
export function CoverArt({ tipo, seedId }: { tipo: EventTypeId; seedId: string }) {
  const Scene = SCENES[tipo]
  const uid = `cv${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  return (
    <svg className="cover-art" viewBox={`0 0 ${SCENE_W} ${SCENE_H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <Scene rng={rngFor(`${tipo}:${seedId}`)} uid={uid} />
    </svg>
  )
}
