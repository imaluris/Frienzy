import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import type { Trust } from '../attendance/useTrust'
import { ProfileTrust } from './ProfileTrust'

const trust = (over: Partial<Trust> = {}): Trust => ({ loading: false, reliability: { done: 0, marked: 0, percent: null }, stars: { count: 0, average: null }, ...over })

describe('riepilogo di affidabilità nel profilo', () => {
  it('con pochi dati non mostra la percentuale e spiega perché', () => {
    render(<ProfileTrust trust={trust({ reliability: { done: 1, marked: 2, percent: null } })} />)
    expect(screen.getByText('Presto')).toBeInTheDocument()
    expect(screen.getByText(/almeno 3 presenze/)).toBeInTheDocument()
    expect(screen.queryByText(/voti? ricevut/)).not.toBeInTheDocument()
  })
  it('con i dati mostra eventi fatti, percentuale e voto medio con la virgola', () => {
    render(<ProfileTrust trust={trust({ reliability: { done: 2, marked: 3, percent: 67 }, stars: { count: 2, average: 4.5 } })} />)
    expect(screen.getByText('67%')).toBeInTheDocument()
    expect(screen.getByText('4,5')).toBeInTheDocument()
    expect(screen.getByText('2 voti ricevuti')).toBeInTheDocument()
  })
  it('in caricamento mostra i trattini', () => {
    render(<ProfileTrust trust={trust({ loading: true })} />)
    expect(screen.getAllByText('–')).toHaveLength(2)
  })
})
