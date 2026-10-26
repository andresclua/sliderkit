import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Slider } from '@andresclua/sliderkit'
import { marquee } from '../src/marquee'

// jsdom has no layout: every slide is 100px wide
Object.defineProperty(HTMLElement.prototype, 'offsetLeft', {
  configurable: true,
  get(this: HTMLElement) { return this.parentElement ? [...this.parentElement.children].indexOf(this) * 100 : 0 },
})

describe('marquee', () => {
  let frames: FrameRequestCallback[]
  beforeEach(() => {
    document.body.innerHTML = ''
    frames = []
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    vi.stubGlobal('IntersectionObserver', class { observe() {} disconnect() {} })
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => frames.push(cb))
    vi.stubGlobal('cancelAnimationFrame', () => {})
  })

  it('moves by speed × time and wraps around the loop', () => {
    const el = document.createElement('div')
    for (let i = 0; i < 5; i++) el.appendChild(document.createElement('div'))
    document.body.appendChild(el)
    const s = new Slider(el, { items: 1, loop: true, touch: false, mouseDrag: false, plugins: [marquee({ speed: 100 })] })
    const x = () => parseFloat(s.container.style.transform.match(/translate3d\((-?[\d.]+)px/)![1]!)
    frames.shift()!(1000)        // first frame only sets the clock
    const start = x()
    frames.shift()!(1500)        // 0.5s at 100px/s would be 50px, but dt is capped at 0.1s: 10px
    expect(x()).toBeCloseTo(start - 10)
    frames.shift()!(1550)        // 0.05s = 5px more
    expect(x()).toBeCloseTo(start - 15)
    for (let t = 1600; t < 1600 + 50 * 100; t += 50) frames.shift()!(t) // 5s more: wraps, never leaves the strip
    expect(x()).toBeLessThanOrEqual(start)
    expect(x()).toBeGreaterThan(start - 500)
    s.destroy()
  })

  const build = (o: Parameters<typeof marquee>[0]) => {
    const el = document.createElement('div')
    for (let i = 0; i < 5; i++) el.appendChild(document.createElement('div'))
    document.body.appendChild(el)
    const s = new Slider(el, { items: 1, loop: true, touch: false, mouseDrag: false, plugins: [marquee(o)] })
    const x = () => parseFloat(s.container.style.transform.match(/translate3d\((-?[\d.]+)px/)![1]!)
    return { s, x }
  }
  const run = (from: number, ms: number) => { for (let t = from; t <= from + ms; t += 16) frames.shift()?.(t) }

  it('hoverSpeed eases to the new speed, 0 stops it', () => {
    const { s, x } = build({ speed: 100, hoverSpeed: 0 })
    frames.shift()!(1000)
    s.outerWrapper.dispatchEvent(new MouseEvent('mouseenter'))
    run(1016, 2000)
    const stopped = x()
    expect(frames.length).toBe(0)       // loop ended once it came to rest
    s.outerWrapper.dispatchEvent(new MouseEvent('mouseleave'))
    run(4000, 300)
    expect(x()).toBeLessThan(stopped)   // moving again
    s.destroy()
  })

  it('dragging moves the strip with the pointer and it carries on after release', () => {
    const { s, x } = build({ speed: 0, draggable: true })
    frames.shift()!(1000)
    const ptr = (type: string, cx: number, t: number) => {
      const e = new MouseEvent(type, { clientX: cx, bubbles: true })
      Object.defineProperties(e, { pointerId: { value: 1 }, pointerType: { value: 'mouse' }, timeStamp: { value: t } })
      s.container.dispatchEvent(e)
    }
    const start = x()
    ptr('pointerdown', 300, 1000)
    ptr('pointermove', 200, 1016)       // finger left 100px: content left 100px
    expect(x()).toBeCloseTo(start - 100)
    ptr('pointermove', 100, 1032)
    ptr('pointerup', 100, 1040)
    run(1100, 200)
    expect(x()).toBeLessThan(start - 200) // fling keeps going, then eases to speed 0
    s.destroy()
  })
})
