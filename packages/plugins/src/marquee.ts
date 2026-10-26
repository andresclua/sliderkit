import type { SliderPlugin, SliderInstance } from '@andresclua/sliderkit'

export interface MarqueeOptions {
  speed?:        number                 // px per second (default 60)
  direction?:    'left' | 'right'       // which way the content travels (default 'left')
  pauseOnHover?: boolean                // stop under the cursor (default true)
  hoverSpeed?:   number                 // px per second under the cursor, eased: faster, slower or 0. Overrides pauseOnHover
  pauseOnFocus?: boolean                // stop while something inside has focus (default true)
  draggable?:    boolean                // drag it sideways; it eases back to `speed` on release (default false)
}

const mod = (a: number, m: number): number => ((a % m) + m) % m
const EASE = 0.06          // how fast the speed catches up with its target, per 60fps frame
const MAX_FLING = 4000     // px/s

// A continuous, never-ending strip. Needs `loop: true` and more slides than `items`;
// use with `touch: false, mouseDrag: false`. Respects prefers-reduced-motion (stays still).
// Slides can be any width (use `autoWidth: true`): it measures the real distance the strip travels per loop.
// ponytail: horizontal only; the slides plus the clones must be wider than the viewport (repeat them, or raise `items`).
export function marquee(opts: MarqueeOptions = {}): SliderPlugin {
  const speed     = opts.speed ?? 60
  const sign      = opts.direction === 'right' ? -1 : 1
  const hoverTo   = opts.hoverSpeed ?? (opts.pauseOnHover ?? true ? 0 : speed)
  const onFocus   = opts.pauseOnFocus ?? true
  const draggable = opts.draggable ?? false

  let slider: SliderInstance
  let styleEl: HTMLStyleElement
  let io: IntersectionObserver | undefined
  let cur = 0                  // px travelled, wraps in [0, loop length)
  let vel = 0                  // px/s, signed: positive moves the content left
  let last = 0
  let rafId = 0
  let hovering = false, focused = false, dragging = false, visible = true
  let startX = 0, lastX = 0, lastT = 0, moved = 0

  const clones = () => (slider.slides.length - slider.slideCount) / 2
  // width of one full turn: from the first real slide to its first clone at the end
  const loopLength = (): number => {
    const a = slider.slides[clones()], b = slider.slides[clones() + slider.slideCount]
    return a && b ? b.offsetLeft - a.offsetLeft : 0
  }
  const target = () => sign * (focused ? 0 : hovering ? hoverTo : speed)

  function write(): void {
    const first = slider.slides[clones()]!
    const base = first.offsetLeft - slider.container.offsetLeft
    slider.container.style.transform = `translate3d(${-(base + cur)}px, 0, 0)`
  }

  function frame(now: number): void {
    rafId = 0
    const dt = last ? Math.min((now - last) / 1000, 0.1) : 0
    last = now
    const len = loopLength()
    if (!dragging && len) {
      vel += (target() - vel) * (1 - Math.pow(1 - EASE, dt * 60))
      if (Math.abs(vel) < 0.5 && target() === 0) vel = 0
      cur = mod(cur + vel * dt, len)
      write()
    }
    if (visible && (dragging || vel !== 0 || target() !== 0)) rafId = requestAnimationFrame(frame)
    else last = 0
  }

  const run = (): void => { if (!rafId && visible) rafId = requestAnimationFrame(frame) }
  const hover = (h: boolean) => () => { hovering = h; run() }
  const focus = (f: boolean) => () => { focused = f; run() }
  const enter = hover(true), leave = hover(false), focusIn = focus(onFocus), focusOut = focus(false)

  const onDown = (e: PointerEvent): void => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    dragging = true
    moved = 0
    startX = lastX = e.clientX
    lastT = e.timeStamp
    vel = 0
    slider.container.setPointerCapture?.(e.pointerId)
  }
  const onMove = (e: PointerEvent): void => {
    const len = loopLength()
    if (!dragging || !len) return
    const dx = e.clientX - lastX
    cur = mod(cur - dx, len)
    moved = Math.max(moved, Math.abs(e.clientX - startX))
    const dt = (e.timeStamp - lastT) / 1000
    if (dt > 0) vel += ((-dx / dt) - vel) * 0.5      // release velocity, lightly smoothed
    lastX = e.clientX
    lastT = e.timeStamp
    write()
  }
  const onUp = (e: PointerEvent): void => {
    if (!dragging) return
    dragging = false
    if (e.timeStamp - lastT > 100) vel = 0            // paused before letting go: no fling
    vel = Math.max(-MAX_FLING, Math.min(MAX_FLING, vel))
    last = 0
    run()
  }
  const onClick = (e: Event): void => { if (moved > 5) { e.preventDefault(); e.stopPropagation() } }
  const onDragStart = (e: Event): void => e.preventDefault()

  return {
    name: 'marquee',

    install(s: SliderInstance): void {
      slider = s
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

      styleEl = document.createElement('style')
      styleEl.textContent = `#${s.container.id}{transition:none!important}`
      document.head.appendChild(styleEl)

      // the core hides every slide but the first `items` from keyboard / screen readers; here they all scroll past
      s.slides.forEach(el => {
        if (el.classList.contains('sliderkit__item--clone')) return
        el.removeAttribute('aria-hidden'); el.removeAttribute('inert'); el.removeAttribute('tabindex')
      })

      const w = s.outerWrapper, c = s.container
      w.addEventListener('mouseenter', enter); w.addEventListener('mouseleave', leave)
      if (onFocus) { w.addEventListener('focusin', focusIn); w.addEventListener('focusout', focusOut) }
      if (draggable) {
        c.style.touchAction = 'pan-y'
        c.addEventListener('pointerdown', onDown); c.addEventListener('pointermove', onMove)
        c.addEventListener('pointerup', onUp);     c.addEventListener('pointercancel', onUp)
        c.addEventListener('click', onClick, true); c.addEventListener('dragstart', onDragStart)
      }
      io = new IntersectionObserver(([e]) => { visible = !!e?.isIntersecting; run() })
      io.observe(w)
      s.on('resize', run)
      vel = target()
      run()
    },

    destroy(): void {
      cancelAnimationFrame(rafId)
      io?.disconnect()
      styleEl?.remove()
      const w = slider.outerWrapper, c = slider.container
      w.removeEventListener('mouseenter', enter); w.removeEventListener('mouseleave', leave)
      w.removeEventListener('focusin', focusIn);  w.removeEventListener('focusout', focusOut)
      c.removeEventListener('pointerdown', onDown); c.removeEventListener('pointermove', onMove)
      c.removeEventListener('pointerup', onUp);     c.removeEventListener('pointercancel', onUp)
      c.removeEventListener('click', onClick, true); c.removeEventListener('dragstart', onDragStart)
      slider.off('resize', run)
    },
  }
}
