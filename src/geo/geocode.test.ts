import { reversePlace, searchPlaces } from './geocode'

const ok = (body: unknown) => async () => ({ ok: true, json: async () => body })

describe('ricerca indirizzi', () => {
  it('trova gli indirizzi e scarta i risultati senza indirizzo utile', async () => {
    const places = await searchPlaces('via mentana 31 terni', ok([
      { lat: '42.56', lon: '12.64', address: { road: 'Via Mentana', house_number: '31', city: 'Terni' } },
      { lat: '1', lon: '2' },
    ]))
    expect(places).toHaveLength(1)
    expect(places[0].address).toBe('Via Mentana 31, Terni')
  })
  it('testo troppo corto: nessuna richiesta', async () => {
    const fetchFn = vi.fn()
    expect(await searchPlaces('vi', fetchFn)).toEqual([])
    expect(fetchFn).not.toHaveBeenCalled()
  })
  it('la richiesta è in italiano e solo per l\'Italia', async () => {
    const urls: string[] = []
    await searchPlaces('via roma', async (url) => { urls.push(url); return { ok: true, json: async () => [] } })
    expect(urls[0]).toContain('countrycodes=it')
    expect(urls[0]).toContain('accept-language=it')
  })
  it('rete che non risponde: errore', async () => {
    await expect(searchPlaces('via roma', async () => ({ ok: false, json: async () => ({}) }))).rejects.toThrow()
  })
  it('il punto toccato: indirizzo trovato, oppure null se lì non c\'è nulla', async () => {
    const found = await reversePlace({ lat: 45, lng: 9 }, ok({ lat: '45.0001', lon: '9.0001', address: { road: 'Via Roma', city: 'Milano' } }))
    expect(found).toMatchObject({ lat: 45, lng: 9, address: 'Via Roma, Milano' })
    expect(await reversePlace({ lat: 0, lng: 0 }, ok({ error: 'Unable to geocode' }))).toBeNull()
  })
})
