import { describe, expect, it } from 'vitest'
import { MemoryEventRepository } from '../data/memory/memoryEventRepository'
import { MemoryParticipationRepository } from '../data/memory/memoryParticipationRepository'
import type { NewEvent } from '../domain/event'
import { editEvent } from './editEvent'
import { canEdit, describeChanges, diffEdit, toInputValue, validateEdit, type EditInput } from './editRules'

const now = new Date('2030-05-01T10:00:00')
const base: NewEvent = {
  organizzatoreId: 'org', tipo: 'cena', titolo: 'Cena in terrazza', descrizione: 'Portate da condividere',
  dataOra: new Date('2030-05-10T20:00:00'), zonaNome: 'Navigli', latApprossimata: 45.45, lngApprossimata: 9.18,
  geohash: 'u0nd9h', maxPartecipanti: 6, richiedeApprovazione: false,
}
const place = { indirizzo: 'Via Roma 1', lat: 45.4512, lng: 9.1823 }
const same = (): EditInput => ({ titolo: base.titolo, descrizione: base.descrizione, dataOra: toInputValue(base.dataOra), maxPartecipanti: '6' })

async function setup(confirmed = 0) {
  const participations = new MemoryParticipationRepository()
  const events = new MemoryEventRepository(() => 'e1', () => now)
  const event = await events.create(base, place)
  for (let i = 0; i < confirmed; i++) await participations.add(event.id, `u${i}`, 'confermato')
  return { events, participations, event }
}

describe('regole di modifica', () => {
  it('toInputValue e ritorno alla stessa data', () => expect(toInputValue(base.dataOra)).toBe('2030-05-10T20:00'))
  it('diff: niente cambiato, niente avviso', async () => {
    const { event } = await setup()
    expect(diffEdit(event, same()).changed).toEqual([])
  })
  it('diff: i secondi della data originale non contano come modifica', async () => {
    const { event } = await setup()
    const withSeconds = { ...event, dataOra: new Date('2030-05-10T20:00:37.512') }
    expect(diffEdit(withSeconds, same()).changed).toEqual([])
  })
  it('diff: elenca solo i campi toccati', async () => {
    const { event } = await setup()
    const { values, changed } = diffEdit(event, { ...same(), titolo: ' Cena in giardino ', maxPartecipanti: '8' })
    expect(changed).toEqual(['titolo', 'maxPartecipanti'])
    expect(values).toEqual({ titolo: 'Cena in giardino', maxPartecipanti: 8 })
  })
  it('i posti non scendono sotto i confermati', () => {
    expect(validateEdit({ ...same(), maxPartecipanti: '2' }, 3, now)).toMatch(/3 persone confermate/)
    expect(validateEdit({ ...same(), maxPartecipanti: '3' }, 3, now)).toBeNull()
  })
  it('titolo, data e posti sono controllati come alla creazione', () => {
    expect(validateEdit({ ...same(), titolo: 'ab' }, 0, now)).toMatch(/almeno/)
    expect(validateEdit({ ...same(), dataOra: '2029-01-01T10:00' }, 0, now)).toMatch(/futuro/)
    expect(validateEdit({ ...same(), maxPartecipanti: 'x' }, 0, now)).toMatch(/intero/)
  })
  it('descrizione dei cambiamenti in italiano', () => {
    expect(describeChanges(['dataOra'])).toBe('data e ora')
    expect(describeChanges(['titolo', 'maxPartecipanti'])).toBe('il titolo e i posti')
    expect(describeChanges(['titolo', 'dataOra', 'maxPartecipanti'])).toBe('il titolo, data e ora e i posti')
  })
  it('canEdit: solo organizzatore, evento non annullato e non iniziato', async () => {
    const { event } = await setup()
    expect(canEdit(event, 'org', now).ok).toBe(true)
    expect(canEdit(event, 'altro', now).ok).toBe(false)
    expect(canEdit({ ...event, stato: 'annullato' }, 'org', now).ok).toBe(false)
    expect(canEdit(event, 'org', new Date('2030-05-11T00:00:00')).ok).toBe(false)
  })
})

describe('editEvent', () => {
  it('salva i campi cambiati e segna quando e cosa', async () => {
    const ports = await setup()
    const updated = await editEvent(ports, 'e1', 'org', { ...same(), titolo: 'Cena in giardino', dataOra: '2030-05-12T21:00' }, now)
    expect(updated.titolo).toBe('Cena in giardino')
    expect(updated.dataOra).toEqual(new Date('2030-05-12T21:00:00'))
    expect(updated.modifiche).toEqual(['titolo', 'dataOra'])
    expect(updated.modificatoIl).toEqual(now)
  })
  it('senza cambiamenti non scrive nulla', async () => {
    const ports = await setup()
    const result = await editEvent(ports, 'e1', 'org', same(), now)
    expect(result.modificatoIl).toBeUndefined()
  })
  it('rifiuta posti sotto i confermati', async () => {
    const ports = await setup(3)
    await expect(editEvent(ports, 'e1', 'org', { ...same(), maxPartecipanti: '2' }, now)).rejects.toThrow(/3 persone/)
  })
  it('rifiuta chi non è organizzatore e gli eventi annullati', async () => {
    const ports = await setup()
    await expect(editEvent(ports, 'e1', 'altro', same(), now)).rejects.toThrow(/organizzatore/)
    await ports.events.update('e1', { stato: 'annullato' })
    await expect(editEvent(ports, 'e1', 'org', { ...same(), titolo: 'Altro titolo' }, now)).rejects.toThrow(/annullato/)
  })
  it('evento inesistente', async () => {
    const ports = await setup()
    await expect(editEvent(ports, 'zz', 'org', same(), now)).rejects.toThrow(/non trovato/)
  })
})
