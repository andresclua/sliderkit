import type { SliderPlugin, SliderInstance, SliderInfo } from '@andresclua/sliderkit'

export type SmoothPreset = 'smooth' | 'snappy' | 'floaty' | 'free'

export interface SmoothSkewOptions {
  target?:    string   // CSS selector, looked up inside each slide. Default: the slide itself
  perSecond?: number   // degrees per slide/second of velocity (default 2.5)
  max?:       number   // max degrees either way (default 14)
  ease?:      number   // 0–1 smoothing per frame; how fast it returns to 0 (default 0.2)
}

export interface SmoothOptions {
  preset?:        SmoothPreset      // starting point; every other option overrides it (default 'smooth')
  lerp?:          number            // 0–1: fraction of the remaining distance covered per 60fps frame
  inertia?:       number            // ms of release velocity projected forward (0 = no fling)
  snap?:          boolean           // settle on a slide after a drag / wheel gesture
  maxFling?:      number            // max slides a single fling can travel (default: 2 × visible items)
  dragSpeed?:     number            // multiplier for pointer and wheel movement (default 1)
  wheel?:         boolean           // horizontal wheel / trackpad scroll (default true)
  wheelSpeed?:    number            // extra multiplier for the wheel only (default 1)
  snapDelay?:     number            // ms of wheel silence before it settles (default 140)
  dragThreshold?: number            // px of movement after which a drag no longer counts as a click (default 5)
  skew?:          boolean | SmoothSkewOptions   // lean the slides into the movement
  onUpdate?:      (plugin: SmoothPlugin) => void   // every frame the slider moves, plus once more when it comes to rest
  raf?:           boolean           // false = you call plugin.tick(now) from your own rAF loop (default true)
}

// Read-only state, for effects that follow the movement (skew, parallax, WebGL...)
export type SmoothPlugin = SliderPlugin & {
  tick(now: number): void
  readonly velocity:  number            // signed slides per second (positive = towards the next slide), eased, 0 at rest
  readonly position:  number            // where the slider is, in slides from the first one (wraps when looping)
  readonly progress:  number            // 0–1 along the slider
  readonly positions: readonly number[] // per real slide: 0 = at the start of the viewport, 1 = one slide further right, -1 = one before it
  readonly dragging:  boolean
}

export const smoothPresets: Record<SmoothPreset, SmoothOptions> = {
  smooth: { lerp: 0.1,  inertia: 350, snap: true },
  snappy: { lerp: 0.22, inertia: 120, snap: true, maxFling: 1 },
  floaty: { lerp: 0.05, inertia: 700, snap: true },
  free:   { lerp: 0.08, inertia: 900, snap: false, maxFling: 8 },
}

const mod = (a: number, m: number): number => ((a % m) + m) % m
const VEL_EASE = 0.2   // smoothing of `velocity`, per 60fps frame

// ponytail: horizontal axis only, no rubber-band at the edges when loop is off.
// Use with `touch: false, mouseDrag: false` — the plugin replaces the core's drag.
export function smooth(opts: SmoothOptions = {}): SmoothPlugin {
  // user options win over the preset; an explicit `undefined` does not count
  const defined = Object.fromEntries(Object.entries(opts).filter(([, v]) => v !== undefined)) as SmoothOptions
  const o = { ...smoothPresets[opts.preset ?? 'smooth'], ...defined }

  const lerp          = o.lerp          ?? 0.1
  const inertia       = o.inertia       ?? 350
  const snap          = o.snap          ?? true
  const dragSpeed     = o.dragSpeed     ?? 1
  const useWheel      = o.wheel         ?? true
  const wheelSpeed    = o.wheelSpeed    ?? 1
  const snapDelay     = o.snapDelay     ?? 140
  const dragThreshold = o.dragThreshold ?? 5
  const selfRaf       = o.raf           ?? true
  const skewOpt       = o.skew === true ? {} : o.skew || null
  const skewPerSec    = skewOpt?.perSecond ?? 2.5
  const skewMax       = skewOpt?.max       ?? 14
  const skewEase      = skewOpt?.ease      ?? 0.2

  let slider: SliderInstance
  let styleEl: HTMLStyleElement
  let cur = 0                 // displayed position, in slides (real-slide space, wrapped on write when looping)
  let tgt = 0                 // where cur is heading
  let last = 0
  let vel = 0                 // eased, signed slides/second: what effects read
  let skewDeg = 0
  let skewEls: HTMLElement[] = []
  const pos: number[] = []    // reused every frame, exposed as `positions`
  let rafId = 0
  let dragging = false
  let syncing = false         // true while we move the core ourselves, so its events don't retarget us
  let startX = 0, startTgt = 0, moved = 0
  const samples: { x: number; t: number }[] = []
  let wheelTimer: ReturnType<typeof setTimeout> | undefined

  const n      = () => slider.slideCount
  const loop   = () => slider.options.loop
  const active = () => n() > slider.currentItems
  const clones = () => (slider.slides.length - n()) / 2
  const clamp  = (v: number) => loop() ? v : Math.min(Math.max(v, 0), n() - slider.currentItems)
  const step   = () => {
    const a = slider.slides[clones()], b = slider.slides[clones() + 1]
    return a && b ? b.offsetLeft - a.offsetLeft : 0
  }

  function write(): void {
    const s = step()
    const first = slider.slides[clones()]
    if (!s || !first) return
    const base = first.offsetLeft - slider.container.offsetLeft
    const u = loop() ? mod(cur, n()) : clamp(cur)
    slider.container.style.transform = `translate3d(${-(base + u * s)}px, 0, 0)`
  }

  function lean(): void {
    if (!skewOpt) return
    const target = Math.max(-skewMax, Math.min(skewMax, vel * skewPerSec))
    skewDeg += (target - skewDeg) * skewEase
    if (Math.abs(skewDeg) < 0.01) skewDeg = 0
    const value = skewDeg ? `skewX(${skewDeg.toFixed(2)}deg)` : ''
    for (const el of skewEls) el.style.transform = value
  }

  function update(): void {
    if (!o.onUpdate) return
    // loop: wrap to [-1, n-1), so every slide that can be on screen (one before the start up to the last) is continuous
    for (let i = 0; i < n(); i++) pos[i] = loop() ? mod(i - cur + 1, n()) - 1 : i - cur
    o.onUpdate(api)
  }

  function tick(now: number): void {
    if (!active()) return
    const dt = last ? Math.min((now - last) / 1000, 0.1) : 1 / 60
    last = now
    const before = cur
    cur += (tgt - cur) * (1 - Math.pow(1 - lerp, dt * 60))
    if (Math.abs(tgt - cur) < 0.0005) cur = tgt
    // The raw speed jumps when the target does (a fling lands in one frame), so effects get an eased copy
    const raw = (cur - before) / dt
    vel += (raw - vel) * (1 - Math.pow(1 - VEL_EASE, dt * 60))
    if (cur === tgt && Math.abs(vel) < 0.001) vel = 0
    write()
    lean()
    update()
  }

  function frame(now: number): void {
    tick(now)
    if (dragging || cur !== tgt || vel !== 0 || skewDeg !== 0) { rafId = requestAnimationFrame(frame); return }
    rafId = 0
    update()       // one last call, so effects see it come to rest (vel is already 0 here)
  }

  // The core writes its own transform on every index change; one more frame puts ours back.
  function kick(): void {
    if (!selfRaf || rafId) return
    last = 0
    rafId = requestAnimationFrame(frame)
  }

  // Snap the target to a slide and tell the core, so arrows / dots / a11y follow.
  function settle(): void {
    const t = snap ? Math.round(tgt) : tgt
    tgt = clamp(t)
    syncing = true
    slider.goTo(mod(Math.round(tgt), n()))
    syncing = false
    kick()
  }

  // Core moved on its own (arrows, keyboard, dots): head there by the shortest way round.
  function onIndexChanged(info: SliderInfo): void {
    if (!syncing && !dragging) {
      const idx = info.displayIndex - 1
      tgt = loop() ? cur + (mod(idx - cur + n() / 2, n()) - n() / 2) : clamp(idx)
    }
    kick()
  }

  const onDown = (e: PointerEvent): void => {
    if (!active() || (e.pointerType === 'mouse' && e.button !== 0)) return
    dragging = true
    moved = 0
    startX = e.clientX
    startTgt = tgt = cur                       // grabbing stops any momentum
    samples.length = 0
    samples.push({ x: e.clientX, t: e.timeStamp })
    slider.container.setPointerCapture?.(e.pointerId)
    kick()
  }

  const onMove = (e: PointerEvent): void => {
    if (!dragging) return
    const dx = e.clientX - startX
    moved = Math.max(moved, Math.abs(dx))
    tgt = clamp(startTgt - (dx / (step() || 1)) * dragSpeed)
    samples.push({ x: e.clientX, t: e.timeStamp })
    while (samples.length > 2 && e.timeStamp - samples[0]!.t > 100) samples.shift()
    kick()
  }

  const onUp = (e: PointerEvent): void => {
    if (!dragging) return
    dragging = false
    const recent = samples.filter(p => e.timeStamp - p.t <= 100)            // pausing before letting go = no fling
    const a = recent[0], b = recent[recent.length - 1]
    const v = a && b && b.t > a.t ? (b.x - a.x) / (b.t - a.t) : 0          // px/ms
    const max = o.maxFling ?? slider.currentItems * 2
    const fling = Math.max(-max, Math.min(max, (v * inertia) / (step() || 1))) * dragSpeed
    tgt = clamp(tgt - fling)
    settle()
  }

  const onWheel = (e: WheelEvent): void => {
    if (!active() || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return      // let vertical scroll through
    e.preventDefault()
    tgt = clamp(tgt + (e.deltaX / (step() || 1)) * dragSpeed * wheelSpeed)
    clearTimeout(wheelTimer)
    wheelTimer = setTimeout(settle, snapDelay)
    kick()
  }

  // a drag must not end in a click on whatever link / button was under the pointer
  const onClick = (e: Event): void => {
    if (moved > dragThreshold) { e.preventDefault(); e.stopPropagation() }
  }
  const onDragStart = (e: Event): void => e.preventDefault()
  const onKick = (): void => kick()

  const api: SmoothPlugin = {
    name: 'smooth',
    tick,
    get velocity() { return vel },
    get position() { return loop() ? mod(cur, n()) : clamp(cur) },
    get progress() { return loop() ? mod(cur, n()) / n() : clamp(cur) / Math.max(n() - slider.currentItems, 1) },
    get positions() { return pos },
    get dragging() { return dragging },

    install(s: SliderInstance): void {
      slider = s
      const c = s.container

      // our transform must not be animated by the core's CSS transition
      styleEl = document.createElement('style')
      styleEl.textContent = `#${c.id}{transition:none!important}`
      document.head.appendChild(styleEl)

      // slides include the loop clones, so every visible one leans
      if (skewOpt) {
        const sel = skewOpt.target
        skewEls = s.slides
          .map(slide => (sel ? slide.querySelector<HTMLElement>(sel) : slide))
          .filter((el): el is HTMLElement => !!el)
      }

      c.addEventListener('pointerdown', onDown)
      c.addEventListener('pointermove', onMove)
      c.addEventListener('pointerup', onUp)
      c.addEventListener('pointercancel', onUp)
      c.addEventListener('click', onClick, true)
      c.addEventListener('dragstart', onDragStart)
      if (useWheel) s.outerWrapper.addEventListener('wheel', onWheel, { passive: false })

      s.on('indexChanged', onIndexChanged)
      s.on('resize', onKick)
      s.on('newBreakpointEnd', onKick)

      cur = tgt = s.activeIndex
      kick()
    },

    destroy(): void {
      const c = slider.container
      cancelAnimationFrame(rafId)
      clearTimeout(wheelTimer)
      styleEl?.remove()
      for (const el of skewEls) el.style.transform = ''
      skewEls = []
      c.removeEventListener('pointerdown', onDown)
      c.removeEventListener('pointermove', onMove)
      c.removeEventListener('pointerup', onUp)
      c.removeEventListener('pointercancel', onUp)
      c.removeEventListener('click', onClick, true)
      c.removeEventListener('dragstart', onDragStart)
      slider.outerWrapper.removeEventListener('wheel', onWheel)
      slider.off('indexChanged', onIndexChanged)
      slider.off('resize', onKick)
      slider.off('newBreakpointEnd', onKick)
    },
  }
  return api
}
