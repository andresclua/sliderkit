import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Slider } from '../src/Slider'

function createContainer(slideCount = 3): HTMLElement {
  const container = document.createElement('div')
  container.className = 'c--slider-a'
  const wrapper = document.createElement('div')
  wrapper.className = 'c--slider-a__wrapper'
  for (let i = 0; i < slideCount; i++) {
    const slide = document.createElement('div')
    slide.className = 'c--slider-a__item'
    slide.setAttribute('data-slide', '')
    slide.textContent = String(i + 1)
    wrapper.appendChild(slide)
  }
  container.appendChild(wrapper)
  document.body.appendChild(container)
  return container
}

describe('Slider', () => {
  let container: HTMLElement

  beforeEach(() => {
    document.body.innerHTML = ''
    container = createContainer(5)
  })

  // ── getInfo ──
  describe('getInfo()', () => {
    it('returns correct snapshot after init', () => {
      const slider = new Slider(container, { slidesPerPage: 2, gutter: 16 })
      const info = slider.getInfo() as Record<string, unknown>
      expect(info.slideCount).toBe(5)
      expect(info.slidesPerPage).toBe(2)
      expect(info.activeIndex).toBe(0)
      expect(info.isBeginning).toBe(true)
      expect(info.isEnd).toBe(false)
      expect(info.isDestroyed).toBe(false)
      expect(info.version).toBe('0.1.0')
      slider.destroy()
    })

    it('updates after goTo()', () => {
      const slider = new Slider(container)
      slider.goTo(2)
      const info = slider.getInfo() as Record<string, unknown>
      expect(info.activeIndex).toBe(2)
      expect(info.previousIndex).toBe(0)
      slider.destroy()
    })
  })

  // ── destroy ──
  describe('destroy()', () => {
    it('sets isDestroyed to true', () => {
      const slider = new Slider(container)
      slider.destroy()
      expect(slider.isDestroyed).toBe(true)
    })

    it('guards all methods after destroy', () => {
      const slider = new Slider(container)
      slider.destroy()
      // Should not throw, but log errors
      expect(() => slider.goTo('next')).not.toThrow()
      expect(() => slider.next()).not.toThrow()
      expect(() => slider.prev()).not.toThrow()
      expect(() => slider.update()).not.toThrow()
    })

    it('calling destroy twice logs a warning', () => {
      const warnSpy = vi.spyOn(console, 'warn')
      const slider = new Slider(container)
      slider.destroy()
      slider.destroy()
      expect(warnSpy).toHaveBeenCalled()
    })

    it('removes init CSS class on destroy', () => {
      const slider = new Slider(container)
      expect(container.classList.contains('c--slider-a--initialized')).toBe(true)
      slider.destroy()
      expect(container.classList.contains('c--slider-a--initialized')).toBe(false)
    })
  })

  // ── rebuild ──
  describe('rebuild()', () => {
    it('returns a new Slider instance', () => {
      const slider = new Slider(container)
      const rebuilt = slider.rebuild()
      expect(rebuilt).not.toBe(slider)
      expect(rebuilt.isDestroyed).toBe(false)
      rebuilt.destroy()
    })

    it('merges options override', () => {
      const slider = new Slider(container, { slidesPerPage: 1 })
      const rebuilt = slider.rebuild({ slidesPerPage: 2 })
      expect((rebuilt.getInfo() as Record<string, unknown>).slidesPerPage).toBe(2)
      rebuilt.destroy()
    })

    it('original slider is destroyed after rebuild', () => {
      const slider = new Slider(container)
      slider.rebuild()
      expect(slider.isDestroyed).toBe(true)
    })
  })

  // ── play / pause ──
  describe('play() / pause()', () => {
    it('warn when no autoplay plugin registered', () => {
      const warnSpy = vi.spyOn(console, 'warn')
      const slider = new Slider(container)
      slider.play()
      slider.pause()
      expect(warnSpy).toHaveBeenCalledTimes(2)
      slider.destroy()
    })
  })

  // ── on / off post-init ──
  describe('on() / off()', () => {
    it('fires handler registered post-init', () => {
      const slider = new Slider(container)
      const handler = vi.fn()
      slider.on('afterSlideChange', handler)
      slider.goTo(1)
      expect(handler).toHaveBeenCalledOnce()
      slider.destroy()
    })

    it('does not fire handler after off()', () => {
      const slider = new Slider(container)
      const handler = vi.fn()
      slider.on('afterSlideChange', handler)
      slider.off('afterSlideChange', handler)
      slider.goTo(1)
      expect(handler).not.toHaveBeenCalled()
      slider.destroy()
    })
  })

  // ── enable / disable ──
  describe('enable() / disable()', () => {
    it('disable prevents navigation', () => {
      const slider = new Slider(container)
      slider.disable()
      slider.goTo(2)
      expect(slider.activeIndex).toBe(0) // Should not change
      slider.destroy()
    })

    it('enable restores navigation', () => {
      const slider = new Slider(container)
      slider.disable()
      slider.enable()
      slider.goTo(2)
      expect(slider.activeIndex).toBe(2)
      slider.destroy()
    })
  })
})
