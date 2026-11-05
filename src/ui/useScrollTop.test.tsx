import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useScrollTop } from './useScrollTop'

function Probe({ k }: { k: string }) {
  useScrollTop(k)
  return null
}

describe('useScrollTop', () => {
  afterEach(() => vi.restoreAllMocks())
  it("porta la pagina in cima all'inizio e a ogni cambio di chiave, non agli altri render", () => {
    const spy = vi.fn()
    vi.stubGlobal('scrollTo', spy)
    const { rerender } = render(<Probe k="a" />)
    expect(spy).toHaveBeenCalledTimes(1)
    rerender(<Probe k="a" />)
    expect(spy).toHaveBeenCalledTimes(1)
    rerender(<Probe k="b" />)
    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy).toHaveBeenLastCalledWith(0, 0)
    vi.unstubAllGlobals()
  })
})
