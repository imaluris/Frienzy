import { describe, expect, it, vi } from 'vitest'
import type { FrienzyEvent } from '../domain/event'
import { barModel, effectiveView, statusNote, WITHDRAW_COPY } from '../participation/actionBar'
import type { ParticipationView } from '../participation/participationView'
import { headerProgress, PARALLAX_MAX, parallaxOffset } from './detailScroll'
import { buildShareText, shareEvent } from './share'

const event = {
  id: 'e1', organizzatoreId: 'o', tipo: 'aperitivo', titolo: 'Aperitivo sul Naviglio', descrizione: '',
  dataOra: new Date('2026-11-07T18:30:00'), zonaNome: 'Navigli', latApprossimata: 45.45, lngApprossimata: 9.17,
  geohash: 'u0nd8k', maxPartecipanti: 6, richiedeApprovazione: false, stato: 'aperto', creatoIl: new Date(),
} as FrienzyEvent

describe('parallasse e barra in alto', () => {
  it('la copertina scorre più piano, fino a un massimo', () => {
    expect(parallaxOffset(0, false)).toBe(0)
    expect(parallaxOffset(100, false)).toBe(40)
    expect(parallaxOffset(5000, false)).toBe(PARALLAX_MAX)
  })
  it('con "riduci animazioni" non c\'è parallasse', () => expect(parallaxOffset(100, true)).toBe(0))
  it('overscroll negativo non sposta nulla', () => expect(parallaxOffset(-50, false)).toBe(0))
  it('la barra in alto compare piano piano', () => {
    expect(headerProgress(0, 296)).toBe(0)
    expect(headerProgress(296, 296)).toBe(1)
    const mid = headerProgress(200, 296)
    expect(mid).toBeGreaterThan(0)
    expect(mid).toBeLessThan(1)
  })
})

describe('barra azione', () => {
  it('ogni situazione ha un pulsante', () => {
    const views: ParticipationView[] = ['organizzatore', 'annullato', 'chiuso', 'confermato', 'richiesta', 'rifiutato', 'pieno', 'partecipa', 'chiedi']
    for (const v of views) expect(barModel(v).label.length).toBeGreaterThan(0)
  })
  it('ritiro e ritiro richiesta chiedono conferma, Partecipa no', () => {
    expect(barModel('confermato')).toMatchObject({ action: 'withdraw', confirm: true })
    expect(barModel('richiesta')).toMatchObject({ action: 'withdraw', confirm: true })
    expect(barModel('partecipa')).toMatchObject({ action: 'join', confirm: false })
    expect(barModel('chiedi').label).toBe('Chiedi di partecipare')
  })
  it('evento pieno, annullato, chiuso o rifiutato: pulsante spento', () => {
    for (const v of ['pieno', 'annullato', 'chiuso', 'rifiutato'] as const) expect(barModel(v).action).toBeNull()
  })
  it("l'organizzatore gestisce", () => expect(barModel('organizzatore').action).toBe('manage'))
  it('frasi di stato solo dove servono', () => {
    expect(statusNote('partecipa')).toBeNull()
    expect(statusNote('confermato')?.tone).toBe('ok')
    expect(statusNote('pieno')?.text).toMatch(/Posti esauriti/)
  })
  it('evento annullato: lo è per tutti, anche per chi aveva un posto', () => {
    expect(effectiveView('annullato', 'confermato')).toBe('annullato')
    expect(effectiveView('annullato', 'organizzatore')).toBe('annullato')
    expect(effectiveView('aperto', 'confermato')).toBe('confermato')
  })
  it('testi di conferma per i due ritiri', () => {
    expect(WITHDRAW_COPY.confermato.yes).toBe('Sì, ritirati')
    expect(WITHDRAW_COPY.richiesta.title).toMatch(/richiesta/)
  })
})

describe('condivisione', () => {
  it('il testo ha titolo, quando e zona ma niente indirizzo', () => {
    const text = buildShareText(event)
    expect(text).toContain('Aperitivo sul Naviglio')
    expect(text).toContain('Navigli')
    expect(text).not.toMatch(/Via |indirizzo/i)
  })
  it('usa il pannello del telefono se c\'è', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    expect(await shareEvent(event, { share } as unknown as Navigator)).toBe('shared')
    expect(share).toHaveBeenCalledOnce()
  })
  it('altrimenti copia negli appunti', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    expect(await shareEvent(event, { clipboard: { writeText } } as unknown as Navigator)).toBe('copied')
    expect(writeText).toHaveBeenCalledOnce()
  })
  it('se l\'utente chiude il pannello non è un errore', async () => {
    const share = vi.fn().mockRejectedValue(new DOMException('chiuso', 'AbortError'))
    expect(await shareEvent(event, { share } as unknown as Navigator)).toBe('unavailable')
  })
  it('senza nulla di disponibile lo dice', async () => expect(await shareEvent(event, {} as Navigator)).toBe('unavailable'))
})
