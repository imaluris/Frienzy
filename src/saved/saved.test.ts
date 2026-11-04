import type { FrienzyEvent } from '../domain/event'
import { MemorySavedRepository } from './memorySavedRepository'
import { savedEvents } from './savedEvents'
import { toggleId } from './savedState'

describe('salvati in memoria', () => {
  it('aggiunge, non duplica e restituisce l\'ultimo salvato per primo', async () => {
    const repo = new MemorySavedRepository()
    await repo.add('ada', 'e1')
    await repo.add('ada', 'e2')
    await repo.add('ada', 'e1') // già salvato: non cambia ordine né conta
    expect(await repo.listIds('ada')).toEqual(['e2', 'e1'])
  })

  it('toglie, e togliere ciò che non c\'è non è un errore', async () => {
    const repo = new MemorySavedRepository()
    await repo.add('ada', 'e1')
    await repo.remove('ada', 'e1')
    await expect(repo.remove('ada', 'e1')).resolves.toBeUndefined()
    await expect(repo.remove('nessuno', 'e1')).resolves.toBeUndefined()
    expect(await repo.listIds('ada')).toEqual([])
  })

  it('ogni utente ha i suoi salvati', async () => {
    const repo = new MemorySavedRepository()
    await repo.add('ada', 'e1')
    expect(await repo.listIds('bruno')).toEqual([])
  })
})

describe('toggleId', () => {
  it('aggiunge in testa o toglie, senza modificare l\'array', () => {
    const ids = ['a', 'b']
    expect(toggleId(ids, 'c')).toEqual(['c', 'a', 'b'])
    expect(toggleId(ids, 'a')).toEqual(['b'])
    expect(ids).toEqual(['a', 'b'])
  })
})

describe('savedEvents', () => {
  const e = (id: string) => ({ id }) as FrienzyEvent
  it('segue l\'ordine dei salvati e salta gli eventi che non ci sono più', () => {
    expect(savedEvents([e('a'), e('b'), e('c')], ['c', 'x', 'a']).map((x) => x.id)).toEqual(['c', 'a'])
  })
})
