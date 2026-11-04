import type { FrienzyEvent } from '../domain/event'
import type { EventTypeId } from '../domain/eventTypes'
import type { LatLng } from '../events/geohashDecode'
import { nearbyEvents, type NearbyEvent } from './nearby'
import { rankForYou } from './forYou'
import { weekendEvents } from './weekend'

export interface DiscoverSections {
  perTe: FrienzyEvent[]
  vicino: NearbyEvent[]
  weekend: FrienzyEvent[]
}

export interface DiscoverInput {
  events: FrienzyEvent[]
  interessi: EventTypeId[]
  uid: string
  position: LatLng | null
  now: Date
}

/** Quanti eventi al massimo mostra ogni fila a scorrimento. */
export const RAIL_LIMIT = 8

/** Le tre file della scoperta. "Vicino a te" è vuota (quindi nascosta) se la posizione non c'è. */
export function buildDiscover({ events, interessi, uid, position, now }: DiscoverInput): DiscoverSections {
  return {
    perTe: rankForYou(events, interessi, uid).slice(0, RAIL_LIMIT),
    vicino: nearbyEvents(events, position).slice(0, RAIL_LIMIT),
    weekend: weekendEvents(events, now).slice(0, RAIL_LIMIT),
  }
}
