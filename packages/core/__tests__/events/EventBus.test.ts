import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EventBus } from '../../src/events/EventBus'

type TestEventMap = {
  click: { x: number; y: number }
  change: { value: string }
  empty: Record<string, never>
}

describe('EventBus', () => {
  let bus: EventBus<TestEventMap>

  beforeEach(() => {
    bus = new EventBus()
  })

  it('calls handler when event is emitted', () => {
    const handler = vi.fn()
    bus.on('click', handler)
    bus.emit('click', { x: 10, y: 20 })
    expect(handler).toHaveBeenCalledOnce()
    expect(handler).toHaveBeenCalledWith({ x: 10, y: 20 })
  })

  it('does not call handler after off()', () => {
    const handler = vi.fn()
    bus.on('click', handler)
    bus.off('click', handler)
    bus.emit('click', { x: 0, y: 0 })
    expect(handler).not.toHaveBeenCalled()
  })

  it('calls multiple handlers for the same event', () => {
    const h1 = vi.fn()
    const h2 = vi.fn()
    bus.on('click', h1)
    bus.on('click', h2)
    bus.emit('click', { x: 0, y: 0 })
    expect(h1).toHaveBeenCalledOnce()
    expect(h2).toHaveBeenCalledOnce()
  })

  it('does not call handler for a different event', () => {
    const handler = vi.fn()
    bus.on('click', handler)
    bus.emit('change', { value: 'hello' })
    expect(handler).not.toHaveBeenCalled()
  })

  it('removeAll() clears all listeners', () => {
    const h1 = vi.fn()
    const h2 = vi.fn()
    bus.on('click', h1)
    bus.on('change', h2)
    bus.removeAll()
    bus.emit('click', { x: 0, y: 0 })
    bus.emit('change', { value: 'x' })
    expect(h1).not.toHaveBeenCalled()
    expect(h2).not.toHaveBeenCalled()
  })

  it('hasListeners() returns correct boolean', () => {
    expect(bus.hasListeners('click')).toBe(false)
    const handler = vi.fn()
    bus.on('click', handler)
    expect(bus.hasListeners('click')).toBe(true)
    bus.off('click', handler)
    expect(bus.hasListeners('click')).toBe(false)
  })

  it('the same handler added twice is only called once', () => {
    const handler = vi.fn()
    bus.on('click', handler)
    bus.on('click', handler) // duplicate
    bus.emit('click', { x: 0, y: 0 })
    expect(handler).toHaveBeenCalledOnce()
  })

  it('off() on non-registered handler does not throw', () => {
    const handler = vi.fn()
    expect(() => bus.off('click', handler)).not.toThrow()
  })

  it('emit on event with no listeners does not throw', () => {
    expect(() => bus.emit('click', { x: 0, y: 0 })).not.toThrow()
  })
})
