import type { Mine } from '../mine/buildMine'

export interface ProfileStats {
  organized: number
  joined: number
}

/** Numeri della scheda Profilo: eventi organizzati e a cui partecipo davvero. Gli annullati e le richieste in sospeso non contano. */
export function profileStats(mine: Mine): ProfileStats {
  return {
    organized: mine.organized.filter((e) => e.stato !== 'annullato').length,
    joined: mine.joined.filter((j) => j.event.stato !== 'annullato' && j.participation.stato === 'confermato').length,
  }
}
