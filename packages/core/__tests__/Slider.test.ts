import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Slider } from '../src/Slider'

function createContainer(n = 5): HTMLElement {
  const el = document.createElement('div')
  el.id = 'test-slider'
  for (let i = 0; i < n; i++) {
    const s = document.createElement('div')
    s.textContent = String(i + 1)
    el.appendChild(s)
  }
  document.body.appendChild(el)
  return el
}

describe('Slider', () => {
  beforeEach(() => { document.body.innerHTML = '' })

  describe('init', () => {
    it('wraps container in outer / overflow / inner divs', () => {
      const el = createContainer()
      const s = new Slider(el, { loop: false })
      expect(el.parentElement?.classList.contains('sliderkit__inner')).toBe(true)
      s.destroy()
    })

    it('adds BEM class to container', () => {
      const el = createContainer()
      const s = new Slider(el, { loop: false })
      expect(el.classList.contains('sliderkit')).toBe(true)
      s.destroy()
    })

    it('marks original slides with item class', () => {
      const el = createContainer(3)
      const s = new Slider(el, { loop: false })
      expect(s.slides.every(sl => sl.classList.contains('sliderkit__item'))).toBe(true)
      s.destroy()
    })

    it('exposes correct slideCount', () => {
      const el = createContainer(4)
      const s = new Slider(el, { loop: false })
      expect(s.getInfo().slideCount).toBe(4)
      s.destroy()
    })
  })

  describe('getInfo()', () => {
    it('returns slideCount and initial index', () => {
      const el = createContainer(5)
      const s = new Slider(el, { loop: false, items: 1 })
      const info = s.getInfo()
      expect(info.slideCount).toBe(5)
      expect(info.displayIndex).toBe(1)
      s.destroy()
    })
  })

  describe('goTo()', () => {
    it('navigates to numeric index', () => {
      const el = createContainer(5)
      const s = new Slider(el, { loop: false, speed: 0 })
      s.goTo(3)
      expect(s.activeIndex).toBe(3)
      s.destroy()
    })

    it('navigates to first / last', () => {
      const el = createContainer(5)
      const s = new Slider(el, { loop: false, speed: 0 })
      s.goTo('last')
      expect(s.activeIndex).toBe(4)
      s.goTo('first')
      expect(s.activeIndex).toBe(0)
      s.destroy()
    })
  })

  describe('on() / off()', () => {
    it('fires indexChanged on goTo', () => {
      const el = createContainer(5)
      const s = new Slider(el, { loop: false, speed: 0 })
      const handler = vi.fn()
      s.on('indexChanged', handler)
      s.goTo(2)
      expect(handler).toHaveBeenCalled()
      s.destroy()
    })

    it('does not fire after off()', () => {
      const el = createContainer(5)
      const s = new Slider(el, { loop: false, speed: 0 })
      const handler = vi.fn()
      s.on('indexChanged', handler)
      s.off('indexChanged', handler)
      s.goTo(2)
      expect(handler).not.toHaveBeenCalled()
      s.destroy()
    })
  })

  describe('destroy()', () => {
    it('removes injected DOM wrappers', () => {
      const el = createContainer()
      const s = new Slider(el, { loop: false })
      s.destroy()
      expect(document.querySelector('.sliderkit__outer')).toBeNull()
    })

    it('removes BEM class from container', () => {
      const el = createContainer()
      const s = new Slider(el, { loop: false })
      s.destroy()
      expect(el.classList.contains('sliderkit')).toBe(false)
    })
  })

  describe('plugins', () => {
    it('calls install on each plugin', () => {
      const el = createContainer()
      const install = vi.fn()
      const p = { name: 'test', install, destroy: vi.fn() }
      const s = new Slider(el, { loop: false, plugins: [p] })
      expect(install).toHaveBeenCalledOnce()
      s.destroy()
    })

    it('calls destroy on plugin when slider is destroyed', () => {
      const el = createContainer()
      const pdestroy = vi.fn()
      const p = { name: 'test', install: vi.fn(), destroy: pdestroy }
      const s = new Slider(el, { loop: false, plugins: [p] })
      s.destroy()
      expect(pdestroy).toHaveBeenCalledOnce()
    })
  })
})
