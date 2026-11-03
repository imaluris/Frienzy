import type { Rng } from '../seed'

// Ogni scena riceve il generatore di numeri (già legato all'id dell'evento) e un prefisso per gli id interni dell'SVG.
export interface SceneProps {
  rng: Rng
  uid: string
}

/** Tutte le scene sono disegnate su una tela 400x240; il soggetto sta nella fascia centrale perché i bordi si tagliano. */
export const SCENE_W = 400
export const SCENE_H = 240
