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

  describe('overflow option', () => {
    it('is hidden by default and visible when asked', () => {
      const a = createContainer(3); const sa = new Slider(a, {})
      const b = createContainer(3); const sb = new Slider(b, { overflow: 'visible' })
      expect((a.closest('.sliderkit__overflow') as HTMLElement).style.overflow).toBe('')
      expect((b.closest('.sliderkit__overflow') as HTMLElement).style.overflow).toBe('visible')
      sa.destroy(); sb.destroy()
    })
  })

  describe('peek option', () => {
    it('narrows the outer, shows overflow, clips the wrapper, and undoes the wrapper on destroy', () => {
      const el = createContainer(3)
      const wrap = el.parentElement as HTMLElement
      wrap.style.overflow = 'auto'
      const s = new Slider(el, { items: 1, peek: '30%' })
      expect((el.closest('.sliderkit__outer') as HTMLElement).style.width).toContain('calc(')
      expect((el.closest('.sliderkit__overflow') as HTMLElement).style.overflow).toBe('visible')
      expect(wrap.style.overflow).toBe('hidden')
      s.destroy()
      expect(wrap.style.overflow).toBe('auto')
    })
  })

  describe('responsive loop', () => {
    const makeAt = (width: number, options: Record<string, unknown>, n = 6) => {
      Object.defineProperty(window, 'innerWidth', { value: width, configurable: true })
      document.body.innerHTML = ''
      const el = createContainer(n)
      const s = new Slider(el, options as never)
      return { el, s, clones: () => el.querySelectorAll('.sliderkit__item--clone').length }
    }

    it('loop: false in a breakpoint removes the clones at load', () => {
      const cfg = { items: 1, loop: true, responsive: { 1024: { items: 3, loop: false } } }
      const wide = makeAt(1200, cfg)
      expect(wide.clones()).toBe(0)
      wide.s.destroy()
      const narrow = makeAt(600, cfg)
      expect(narrow.clones()).toBeGreaterThan(0)
      narrow.s.destroy()
    })

    it('rewind in a breakpoint turns the loop off only there', () => {
      const cfg = { loop: true, responsive: { 1024: { rewind: true } } }
      const wide = makeAt(1200, cfg)
      expect(wide.clones()).toBe(0)
      wide.s.destroy()
      const narrow = makeAt(600, cfg)
      expect(narrow.clones()).toBeGreaterThan(0)
      narrow.s.destroy()
    })

    const resizeTo = async (width: number) => {
      Object.defineProperty(window, 'innerWidth', { value: width, configurable: true })
      window.dispatchEvent(new Event('resize'))
      await new Promise(r => setTimeout(r, 80))
    }
    const cfg = { items: 1, loop: true, responsive: { 1024: { items: 3, loop: false } } }

    it('crossing the breakpoint turns the loop off and on again', async () => {
      const { s, clones } = makeAt(600, cfg)
      const before = clones()
      expect(before).toBeGreaterThan(0)
      await resizeTo(1200)
      expect(clones()).toBe(0)
      await resizeTo(600)
      expect(clones()).toBe(before)
      s.destroy()
    })

    it('keeps the same real card across the crossing', async () => {
      const { s } = makeAt(600, { ...cfg, startIndex: 2 })
      expect(s.activeIndex).toBe(2)
      await resizeTo(1200)
      expect(s.activeIndex).toBe(2)
      await resizeTo(600)
      expect(s.activeIndex).toBe(2)
      s.destroy()
    })

    it('clamps and emits indexChanged when the card no longer exists', async () => {
      const { s } = makeAt(600, { ...cfg, startIndex: 5 })
      const spy = vi.fn()
      s.on('indexChanged', spy)
      await resizeTo(1200)
      expect(s.activeIndex).toBe(3)   // 6 slides, 3 visible: last valid start without loop
      expect(spy).toHaveBeenCalled()
      s.destroy()
    })

    it('repeated crossings do not accumulate clones or css rules', async () => {
      const { s, clones } = makeAt(600, cfg)
      const rules = () => (document.head.querySelector('style')!.sheet as CSSStyleSheet).cssRules.length
      const c0 = clones(), r0 = rules()
      for (let i = 0; i < 3; i++) { await resizeTo(1200); await resizeTo(600) }
      expect(clones()).toBe(c0)
      expect(rules()).toBe(r0)
      s.destroy()
    })

    it('ignores loop in the breakpoint when edgePadding is set', async () => {
      const { s, clones } = makeAt(600, { ...cfg, edgePadding: 20 })
      const before = clones()
      await resizeTo(1200)
      expect(clones()).toBe(before)
      s.destroy()
    })

    it('ignores loop in the breakpoint with an effect plugin and warns', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const fake = { name: 'fadeEffect', install() {}, destroy() {} }
      const { s, clones } = makeAt(600, { ...cfg, plugins: [fake] })
      const before = clones()
      await resizeTo(1200)
      expect(clones()).toBe(before)
      expect(warn).toHaveBeenCalled()
      warn.mockRestore()
      s.destroy()
    })

    it('crossing during a running transition leaves the slider usable', async () => {
      const { s } = makeAt(600, { ...cfg, startIndex: 1 })
      ;(s as unknown as { running: boolean }).running = true
      await resizeTo(1200)
      expect((s as unknown as { running: boolean }).running).toBe(false)
      s.destroy()
    })

    it('crossing to a width where every card fits does not throw', async () => {
      const { s, clones } = makeAt(600, cfg, 3)
      await expect(resizeTo(1200)).resolves.toBeUndefined()
      expect(clones()).toBe(0)
      s.destroy()
    })

    it('a vertical slider crossing the breakpoint keeps the same card', async () => {
      const { s } = makeAt(600, { ...cfg, axis: 'vertical', startIndex: 2 })
      await resizeTo(1200)
      expect(s.activeIndex).toBe(2)
      s.destroy()
    })

    it('does not move the card when the new breakpoint has room for it', async () => {
      // loaded wide (items 3, loop on), card 5; narrowing to items 1 / no loop keeps card 5
      const c = { items: 1, loop: false, startIndex: 5, responsive: { 1024: { items: 3, loop: true } } }
      const { s } = makeAt(1200, c)
      expect(s.activeIndex).toBe(5)
      await resizeTo(600)
      expect(s.activeIndex).toBe(5)
      s.destroy()
    })

    it('emits indexChanged when only the loop change clamps the card', async () => {
      const c = { items: 3, loop: true, startIndex: 5, responsive: { 1024: { loop: false } } }
      const { s } = makeAt(600, c)
      const spy = vi.fn()
      s.on('indexChanged', spy)
      await resizeTo(1200)
      expect(s.activeIndex).toBe(3)
      expect(spy).toHaveBeenCalled()
      s.destroy()
    })

    it('uses the new breakpoint slideBy for the clone count', async () => {
      const c = { items: 1, loop: false, responsive: { 1024: { items: 3, slideBy: 3, loop: true } } }
      const atLoad = makeAt(1200, c, 12)
      const expected = atLoad.clones()
      atLoad.s.destroy()
      const { s, clones } = makeAt(600, c, 12)
      await resizeTo(1200)
      expect(clones()).toBe(expected)
      s.destroy()
    })

    it('keeps the base transition speed in the stylesheet after crossings', async () => {
      const c = { items: 1, loop: true, speed: 300, responsive: { 1024: { loop: false, speed: 1000 } } }
      const { el, s } = makeAt(600, c)
      const base = () => {
        const sheet = [...document.styleSheets].pop()!
        return [...sheet.cssRules].filter(r => (r as CSSStyleRule).selectorText === '#' + el.id).map(r => r.cssText).join('')
      }
      const before = base()
      await resizeTo(1200)
      await resizeTo(600)
      expect(base()).toBe(before)
      expect(before).toContain('0.3s')
      s.destroy()
    })

    it('ignores a breakpoint loop at load with fixedWidth', () => {
      const { s, clones } = makeAt(1200, { loop: true, fixedWidth: 200, responsive: { 1024: { loop: false } } })
      expect(clones()).toBeGreaterThan(0)
      s.destroy()
    })

    it('ignores a breakpoint loop at load with an effect plugin and warns', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const fake = { name: 'fadeEffect', install() {}, destroy() {} }
      const { s, clones } = makeAt(1200, { ...cfg, plugins: [fake] })
      expect(clones()).toBeGreaterThan(0)
      expect(warn).toHaveBeenCalled()
      warn.mockRestore()
      s.destroy()
    })

    it('exposes the effective loop', async () => {
      const { s } = makeAt(600, { loop: true, responsive: { 1024: { rewind: true } } })
      expect(s.loop).toBe(true)
      await resizeTo(1200)
      expect(s.loop).toBe(false)
      s.destroy()
      const plain = makeAt(1200, { rewind: true })
      expect(plain.s.loop).toBe(false)
      plain.s.destroy()
    })

    it('destroy after a switch leaves no clones', async () => {
      const { el, s } = makeAt(600, cfg)
      await resizeTo(1200)
      await resizeTo(600)
      s.destroy()
      expect(el.querySelectorAll('.sliderkit__item--clone').length).toBe(0)
      expect(el.children.length).toBe(6)
    })
  })

  describe('loop clones', () => {
    it('keeps a neighbour beside a clone (2 clones per side with items: 1)', () => {
      const el = createContainer(4)
      const s = new Slider(el, { loop: true, items: 1 })
      const items = Array.from(el.children) as HTMLElement[]
      const clones = items.filter(i => i.classList.contains('sliderkit__item--clone'))
      expect(clones.length).toBe(4)  // 2 before + 2 after; with 1 per side the peeking card popped in at the loop jump
      s.destroy()
    })
  })

  describe('loop --active on clones', () => {
    it('a clone and its original share --active (no re-zoom on the loop jump)', () => {
      const el = createContainer(4)
      const s = new Slider(el, { loop: true, items: 1 })
      const items = Array.from(el.children) as HTMLElement[]
      const active = items.filter(i => i.classList.contains('sliderkit__item--active'))
      const texts = new Set(active.map(i => i.textContent))
      // every active card's twin is active too
      for (const t of texts) {
        const twins = items.filter(i => i.textContent === t)
        expect(twins.every(i => i.classList.contains('sliderkit__item--active'))).toBe(true)
      }
      expect(texts.size).toBe(1)
      s.destroy()
    })
  })
})
