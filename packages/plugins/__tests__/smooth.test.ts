import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Slider } from '@andresclua/sliderkit'
import { smooth, smoothPresets } from '../src/smooth'

// jsdom has no layout: every slide is 100px wide, positioned by its index among siblings
Object.defineProperty(HTMLElement.prototype, 'offsetLeft', {
  configurable: true,
  get(this: HTMLElement) { return this.parentElement ? [...this.parentElement.children].indexOf(this) * 100 : 0 },
})

function make(opts: Parameters<typeof smooth>[0] = {}) {
  const el = document.createElement('div')
  for (let i = 0; i < 5; i++) el.appendChild(document.createElement('div')).appendChild(document.createElement('i'))
  document.body.appendChild(el)
  const sm = smooth({ raf: false, ...opts })
  const s = new Slider(el, { items: 1, loop: true, touch: false, mouseDrag: false, plugins: [sm] })
  return { s, sm, el }
}

const tx = (el: HTMLElement) => parseFloat(el.style.transform.match(/translate3d\((-?[\d.]+)px/)![1]!)

function pointer(el: HTMLElement, type: string, x: number, t: number) {
  const e = new MouseEvent(type, { clientX: x, bubbles: true })
  Object.defineProperties(e, { pointerId: { value: 1 }, pointerType: { value: 'mouse' }, timeStamp: { value: t } })
  el.dispatchEvent(e)
}

describe('smooth', () => {
  beforeEach(() => { document.body.innerHTML = '' })
  afterEach(() => { vi.useRealTimers() })

  it('eases toward the target instead of jumping', () => {
    const { s, sm, el } = make()
    s.next()
    sm.tick(0)
    expect(tx(el)).toBeCloseTo(-110)          // base 100 + 10% of the first slide
    expect(sm.velocity).toBeGreaterThan(0)    // moving forward
    for (let t = 16; t < 3000; t += 16) sm.tick(t)
    expect(tx(el)).toBeCloseTo(-200)          // settled exactly on slide 1
    expect(sm.velocity).toBe(0)
    s.destroy()
  })

  it('self-driven loop: velocity is 0 again once it settles', () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] })
    const el = document.createElement('div')
    for (let i = 0; i < 5; i++) el.appendChild(document.createElement('div'))
    document.body.appendChild(el)
    const sm = smooth()
    const s = new Slider(el, { items: 1, loop: true, touch: false, mouseDrag: false, plugins: [sm] })
    s.next()
    vi.advanceTimersByTime(200)
    expect(sm.velocity).toBeGreaterThan(0)
    vi.advanceTimersByTime(4000)
    expect(sm.velocity).toBe(0)
    s.destroy()
  })

  it('slow drag snaps to the next slide, a fast flick carries on (inertia)', () => {
    const { s, el } = make()
    pointer(el, 'pointerdown', 300, 0)
    pointer(el, 'pointermove', 200, 50)
    pointer(el, 'pointermove', 200, 400)       // held still: no release velocity
    pointer(el, 'pointerup', 200, 400)
    expect(s.activeIndex).toBe(1)

    pointer(el, 'pointerdown', 300, 1000)
    pointer(el, 'pointermove', 250, 1030)
    pointer(el, 'pointerup', 250, 1030)        // -50px in 30ms
    expect(s.activeIndex).toBe(3)              // 1 + clamp(fling) of 2 slides
    s.destroy()
  })

  const flick = (el: HTMLElement) => {        // -50px in 30ms, released straight away
    pointer(el, 'pointerdown', 300, 0)
    pointer(el, 'pointermove', 250, 30)
    pointer(el, 'pointerup', 250, 30)
  }

  it('presets: snappy caps a fling at 1 slide, free does not snap', () => {
    const a = make({ preset: 'snappy' })
    flick(a.el)
    expect(a.s.activeIndex).toBe(2)            // default 'smooth' travels 3 here, 'snappy' only 1 (half a slide of drag + a fling capped at 1)
    a.s.destroy()
    expect(smoothPresets.free.snap).toBe(false)
    expect(smoothPresets.smooth.snap).toBe(true)
  })

  it('options override the preset, undefined does not', () => {
    const a = make({ preset: 'snappy', maxFling: 2, inertia: undefined })
    flick(a.el)
    expect(a.s.activeIndex).toBe(3)            // maxFling 2 wins over the preset's 1; inertia keeps the preset's 120
    a.s.destroy()
  })

  it('wheelSpeed multiplies the wheel only', () => {
    vi.useFakeTimers()
    const { s } = make({ wheelSpeed: 2 })
    s.outerWrapper.dispatchEvent(new WheelEvent('wheel', { deltaX: 100, deltaY: 0, bubbles: true, cancelable: true }))
    vi.advanceTimersByTime(150)
    expect(s.activeIndex).toBe(2)              // 100px = 1 slide, × 2
    s.destroy()
  })

  it('snapDelay controls how long the wheel waits before settling', () => {
    vi.useFakeTimers()
    const { s } = make({ snapDelay: 500 })
    s.outerWrapper.dispatchEvent(new WheelEvent('wheel', { deltaX: 100, deltaY: 0, bubbles: true, cancelable: true }))
    vi.advanceTimersByTime(300)
    expect(s.activeIndex).toBe(0)
    vi.advanceTimersByTime(250)
    expect(s.activeIndex).toBe(1)
    s.destroy()
  })

  it('dragThreshold: a small drag keeps the click, a big one eats it', () => {
    const { s, el } = make({ dragThreshold: 50 })
    const link = el.querySelector('i') as HTMLElement
    const clicked = vi.fn()
    link.addEventListener('click', clicked)
    pointer(el, 'pointerdown', 300, 0); pointer(el, 'pointermove', 270, 20); pointer(el, 'pointerup', 270, 20)
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    expect(clicked).toHaveBeenCalledTimes(1)   // 30px < 50
    pointer(el, 'pointerdown', 300, 100); pointer(el, 'pointermove', 200, 120); pointer(el, 'pointerup', 200, 120)
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    expect(clicked).toHaveBeenCalledTimes(1)   // 100px > 50: swallowed
    s.destroy()
  })

  it('skew leans the target with the velocity and clears at rest and on destroy', () => {
    const { s, sm, el } = make({ skew: { target: 'i', max: 10, perSecond: 100 } })
    const target = el.querySelectorAll('i')[0] as HTMLElement
    s.next()
    sm.tick(0); sm.tick(16)
    expect(target.style.transform).toMatch(/skewX\(/)
    expect(parseFloat(target.style.transform.match(/skewX\(([\d.]+)deg/)![1]!)).toBeLessThanOrEqual(10)
    for (let t = 32; t < 4000; t += 16) sm.tick(t)
    expect(target.style.transform).toBe('')    // eased back to 0
    s.next(); sm.tick(5000); sm.tick(5016)
    s.destroy()
    expect(target.style.transform).toBe('')
  })

  it('onUpdate gets the live state: velocity, position, progress and per-slide positions', () => {
    const seen: { v: number; pos: number; progress: number; positions: number[] }[] = []
    const { s, sm } = make({ onUpdate: p => seen.push({ v: p.velocity, pos: p.position, progress: p.progress, positions: [...p.positions] }) })
    s.next()
    sm.tick(0); sm.tick(16)
    expect(seen).toHaveLength(2)
    expect(seen[1]!.v).toBeGreaterThan(0)
    expect(seen[1]!.pos).toBeGreaterThan(0)
    for (let t = 32; t < 4000; t += 16) sm.tick(t)
    const end = seen[seen.length - 1]!
    expect(end.pos).toBe(1)
    expect(end.progress).toBeCloseTo(0.2)                     // slide 1 of 5
    expect(end.positions).toEqual([-1, 0, 1, 2, 3])           // 0 = at the start of the viewport; wraps in [-1, n-1)
    s.destroy()
  })

  it('self-driven loop: onUpdate fires once more, at rest, with velocity 0', () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] })
    const el = document.createElement('div')
    for (let i = 0; i < 5; i++) el.appendChild(document.createElement('div'))
    document.body.appendChild(el)
    const vels: number[] = []
    const s = new Slider(el, { items: 1, loop: true, touch: false, mouseDrag: false, plugins: [smooth({ onUpdate: p => vels.push(p.velocity) })] })
    s.next()
    vi.advanceTimersByTime(4000)
    expect(vels.some(v => v > 0)).toBe(true)
    expect(vels[vels.length - 1]).toBe(0)
    s.destroy()
  })

  it('holding still before letting go does not fling', () => {
    const { s, el } = make()
    pointer(el, 'pointerdown', 300, 0)
    pointer(el, 'pointermove', 250, 20)
    pointer(el, 'pointermove', 200, 40)        // fast...
    pointer(el, 'pointerup', 200, 600)         // ...then 560ms of nothing
    expect(s.activeIndex).toBe(1)              // plain snap of the 100px dragged, no fling
    s.destroy()
  })

  it('velocity is eased: it does not jump when a fling lands, and it decays to 0', () => {
    const { s, sm, el } = make()
    pointer(el, 'pointerdown', 300, 0)
    pointer(el, 'pointermove', 250, 30)
    sm.tick(0); sm.tick(16)
    pointer(el, 'pointerup', 250, 30)          // the fling lands here: the target jumps
    sm.tick(32)
    const first = sm.velocity                  // the raw speed this frame is ~18 slides/second
    expect(first).toBeGreaterThan(0)
    expect(first).toBeLessThan(8)
    let peak = 0
    for (let t = 48; t < 5000; t += 16) { sm.tick(t); peak = Math.max(peak, Math.abs(sm.velocity)) }
    expect(peak).toBeGreaterThan(first)        // it ramps up to its peak instead of starting there
    expect(sm.velocity).toBe(0)                // and decays all the way to rest
    s.destroy()
  })

  it('horizontal wheel moves the slider and snaps when it stops', () => {
    vi.useFakeTimers()
    const { s } = make()
    s.outerWrapper.dispatchEvent(new WheelEvent('wheel', { deltaX: 100, deltaY: 0, bubbles: true, cancelable: true }))
    expect(s.activeIndex).toBe(0)
    vi.advanceTimersByTime(150)
    expect(s.activeIndex).toBe(1)
    s.destroy()
  })

  it('ignores vertical wheel so the page still scrolls', () => {
    const { s } = make()
    const e = new WheelEvent('wheel', { deltaX: 0, deltaY: 100, bubbles: true, cancelable: true })
    s.outerWrapper.dispatchEvent(e)
    expect(e.defaultPrevented).toBe(false)
    s.destroy()
  })
})
