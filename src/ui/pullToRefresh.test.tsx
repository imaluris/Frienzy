import '@testing-library/jest-dom/vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { PullToRefresh } from './PullToRefresh'
import { dampenPull, PULL_MAX, PULL_THRESHOLD, shouldRefresh } from './pullState'

describe('pullState', () => {
  it('frena il movimento del dito, non va sotto zero e si ferma al massimo', () => {
    expect(dampenPull(-20)).toBe(0)
    expect(dampenPull(100)).toBe(50)
    expect(dampenPull(10_000)).toBe(PULL_MAX)
  })

  it('aggiorna solo dalla soglia in su', () => {
    expect(shouldRefresh(PULL_THRESHOLD - 1)).toBe(false)
    expect(shouldRefresh(PULL_THRESHOLD)).toBe(true)
  })
})

const touch = (y: number) => ({ touches: [{ clientY: y }] })

describe('PullToRefresh', () => {
  it('tirando abbastanza e rilasciando chiama l\'aggiornamento', async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined)
    render(<PullToRefresh onRefresh={onRefresh}><p>Contenuto</p></PullToRefresh>)
    const area = screen.getByText('Contenuto').parentElement!.parentElement!
    fireEvent.touchStart(area, touch(100))
    fireEvent.touchMove(area, touch(300)) // 200 px di dito = 100 di tirata
    await act(async () => { fireEvent.touchEnd(area) })
    expect(onRefresh).toHaveBeenCalledTimes(1)
  })

  it('una tirata corta non aggiorna', async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined)
    render(<PullToRefresh onRefresh={onRefresh}><p>Contenuto</p></PullToRefresh>)
    const area = screen.getByText('Contenuto').parentElement!.parentElement!
    fireEvent.touchStart(area, touch(100))
    fireEvent.touchMove(area, touch(140))
    await act(async () => { fireEvent.touchEnd(area) })
    expect(onRefresh).not.toHaveBeenCalled()
  })

  it('se la pagina non è in cima non parte', async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined)
    render(<PullToRefresh onRefresh={onRefresh}><p>Contenuto</p></PullToRefresh>)
    const area = screen.getByText('Contenuto').parentElement!.parentElement!
    Object.defineProperty(window, 'scrollY', { value: 300, configurable: true })
    fireEvent.touchStart(area, touch(100))
    fireEvent.touchMove(area, touch(400))
    await act(async () => { fireEvent.touchEnd(area) })
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
    expect(onRefresh).not.toHaveBeenCalled()
  })
})
