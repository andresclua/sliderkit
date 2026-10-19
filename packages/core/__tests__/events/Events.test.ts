import { describe, it, expect, vi } from 'vitest'
import { Events } from '../../src/events'

describe('Events', () => {
  it('calls handlers with emitted args', () => {
    const e = new Events()
    const fn = vi.fn()
    e.on('x', fn)
    e.emit('x', 1, 2)
    expect(fn).toHaveBeenCalledWith(1, 2)
  })

  it('off() removes only that handler', () => {
    const e = new Events()
    const a = vi.fn(), b = vi.fn()
    e.on('x', a); e.on('x', b)
    e.off('x', a)
    e.emit('x')
    expect(a).not.toHaveBeenCalled()
    expect(b).toHaveBeenCalledOnce()
  })

  it('handler removing itself during emit does not skip others', () => {
    const e = new Events()
    const b = vi.fn()
    const a = () => e.off('x', a)
    e.on('x', a); e.on('x', b)
    e.emit('x')
    expect(b).toHaveBeenCalledOnce()
  })

  it('removeAll() clears everything', () => {
    const e = new Events()
    const fn = vi.fn()
    e.on('x', fn)
    e.removeAll()
    e.emit('x')
    expect(fn).not.toHaveBeenCalled()
  })
})
