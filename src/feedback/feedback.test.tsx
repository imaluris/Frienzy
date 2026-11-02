import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { haptic } from './haptics'
import { ToastProvider, useToast } from './ToastContext'
import { TOAST_MS } from './toastModel'

function Trigger() {
  const { show } = useToast()
  return (
    <>
      <button onClick={() => show('Sei dei nostri!', 'success')}>ok</button>
      <button onClick={() => show('Altro messaggio')}>altro</button>
    </>
  )
}

describe('toast', () => {
  afterEach(() => vi.useRealTimers())

  it('mostra il messaggio e lo toglie dopo il tempo previsto', () => {
    vi.useFakeTimers()
    render(<ToastProvider><Trigger /></ToastProvider>)
    fireEvent.click(screen.getByText('ok'))
    expect(screen.getByRole('status')).toHaveTextContent('Sei dei nostri!')
    act(() => { vi.advanceTimersByTime(TOAST_MS + 50) })
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('un messaggio nuovo sostituisce quello vecchio', () => {
    render(<ToastProvider><Trigger /></ToastProvider>)
    fireEvent.click(screen.getByText('ok'))
    fireEvent.click(screen.getByText('altro'))
    expect(screen.getAllByRole('status')).toHaveLength(1)
    expect(screen.getByRole('status')).toHaveTextContent('Altro messaggio')
  })

  it('senza provider chiamare show non rompe niente', () => {
    render(<Trigger />)
    fireEvent.click(screen.getByText('ok'))
    expect(screen.queryByRole('status')).toBeNull()
  })
})

describe('vibrazione', () => {
  it('sul web è ignorata senza errori', async () => {
    await expect(haptic('success')).resolves.toBeUndefined()
  })
})
