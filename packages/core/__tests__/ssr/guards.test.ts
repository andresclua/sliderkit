import { describe, it, expect } from 'vitest'
import { isBrowser, safeWindow, safeDocument, prefersReducedMotion } from '../../src/ssr/guards'

describe('SSR guards', () => {
  it('isBrowser() returns true in jsdom', () => {
    expect(isBrowser()).toBe(true)
  })

  it('safeWindow() returns window in jsdom', () => {
    expect(safeWindow()).toBe(window)
  })

  it('safeDocument() returns document in jsdom', () => {
    expect(safeDocument()).toBe(document)
  })

  it('prefersReducedMotion() returns boolean', () => {
    expect(typeof prefersReducedMotion()).toBe('boolean')
  })
})
