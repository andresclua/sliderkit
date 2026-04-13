import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PluginManager } from '../../src/plugin/PluginManager'
import type { SliderPlugin } from '../../src/types/plugin'
import type { SliderInstance } from '../../src/types/events'

function makePlugin(name: string): SliderPlugin & { installCalled: boolean; destroyCalled: boolean } {
  return {
    name,
    installCalled: false,
    destroyCalled: false,
    install(_slider: SliderInstance) { this.installCalled = true },
    destroy() { this.destroyCalled = true },
  }
}

const mockSlider = {} as SliderInstance

describe('PluginManager', () => {
  let manager: PluginManager

  beforeEach(() => {
    manager = new PluginManager(mockSlider)
  })

  it('installs a plugin via use()', () => {
    const plugin = makePlugin('test')
    manager.use(plugin)
    expect(plugin.installCalled).toBe(true)
  })

  it('get() returns the registered plugin', () => {
    const plugin = makePlugin('myPlugin')
    manager.use(plugin)
    expect(manager.get('myPlugin')).toBe(plugin)
  })

  it('has() returns true for registered plugin', () => {
    const plugin = makePlugin('p1')
    manager.use(plugin)
    expect(manager.has('p1')).toBe(true)
  })

  it('has() returns false for unregistered plugin', () => {
    expect(manager.has('notRegistered')).toBe(false)
  })

  it('warns and skips duplicate plugin registration', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const p1 = makePlugin('dup')
    const p2 = makePlugin('dup')
    manager.use(p1)
    manager.use(p2)
    expect(warnSpy).toHaveBeenCalledOnce()
    expect(p2.installCalled).toBe(false)
  })

  it('destroyAll() calls destroy on all plugins', () => {
    const p1 = makePlugin('a')
    const p2 = makePlugin('b')
    manager.use(p1)
    manager.use(p2)
    manager.destroyAll()
    expect(p1.destroyCalled).toBe(true)
    expect(p2.destroyCalled).toBe(true)
  })

  it('getNames() returns list of plugin names', () => {
    manager.use(makePlugin('x'))
    manager.use(makePlugin('y'))
    expect(manager.getNames()).toEqual(['x', 'y'])
  })
})
