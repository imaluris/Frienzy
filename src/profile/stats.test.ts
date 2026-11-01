import { describe, expect, it } from 'vitest'
import type { FrienzyEvent } from '../domain/event'
import type { Participation, ParticipationStatus } from '../domain/participation'
import { profileStats } from './stats'

const event = (id: string, stato: FrienzyEvent['stato']) => ({ id, stato }) as FrienzyEvent
const part = (eventId: string, stato: ParticipationStatus) => ({ eventId, uid: 'u', stato, creatoIl: new Date() }) as Participation

describe('profileStats', () => {
  it('conta solo eventi organizzati non annullati', () => {
    const mine = { organized: [event('a', 'aperto'), event('b', 'annullato')], joined: [] }
    expect(profileStats(mine)).toEqual({ organized: 1, joined: 0 })
  })

  it('conta solo le partecipazioni confermate di eventi non annullati', () => {
    const mine = {
      organized: [],
      joined: [
        { event: event('a', 'aperto'), participation: part('a', 'confermato') },
        { event: event('b', 'aperto'), participation: part('b', 'richiesta') },
        { event: event('c', 'annullato'), participation: part('c', 'confermato') },
      ],
    }
    expect(profileStats(mine)).toEqual({ organized: 0, joined: 1 })
  })

  it('con nessun evento dà zero', () => {
    expect(profileStats({ organized: [], joined: [] })).toEqual({ organized: 0, joined: 0 })
  })
})
