import { describe, expect, it } from 'vitest'
import { configureStatusBar } from './nativeBars'

describe('barra di stato', () => {
  it('sul web non fa nulla e non dà errori', async () => {
    await expect(configureStatusBar()).resolves.toBeUndefined()
  })
})
