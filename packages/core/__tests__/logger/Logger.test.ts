import { describe, it, expect, vi, afterEach } from 'vitest'
import { logger } from '../../src/logger/Logger'

describe('logger', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('logger.error calls console.error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    logger.error('test error')
    expect(spy).toHaveBeenCalledOnce()
  })

  it('logger.warn calls console.warn', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    logger.warn('test warning')
    expect(spy).toHaveBeenCalledOnce()
  })

  it('logger.info calls console.log', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    logger.info('test info')
    expect(spy).toHaveBeenCalledOnce()
  })

  it('logger.error includes detail when provided', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const detail = { foo: 'bar' }
    logger.error('message', detail)
    const args = spy.mock.calls[0]
    expect(args).toContain(detail)
  })
})
