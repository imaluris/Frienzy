import { EVENT_TYPE_EMOJI, EVENT_TYPE_IDS, isEventTypeId } from './eventTypes'

describe('eventTypes', () => {
  it('ogni tipo ha una emoji', () => {
    for (const id of EVENT_TYPE_IDS) expect(EVENT_TYPE_EMOJI[id]).toBeTruthy()
  })

  it('riconosce solo id validi', () => {
    expect(isEventTypeId('cena')).toBe(true)
    expect(isEventTypeId('karaoke')).toBe(false)
  })
})
