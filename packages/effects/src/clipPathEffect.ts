import type { SliderPlugin, SliderInstance, SliderInfo } from '@andresclua/sliderkit'

export type ClipPathPreset =
  | 'wipe-right'
  | 'wipe-left'
  | 'wipe-down'
  | 'wipe-up'
  | 'circle'
  | 'diamond'

export interface ClipPathCustom {
  hidden:          string   // clip-path value when slide is not visible
  visible:         string   // clip-path value when slide is fully revealed
  hiddenReverse?:  string   // optional: different start when navigating backward
}

export interface ClipPathDirectional {
  forward:  ClipPathPreset | ClipPathCustom
  backward: ClipPathPreset | ClipPathCustom
}

export interface ClipPathEffectOptions {
  shape?:          ClipPathPreset | ClipPathCustom | ClipPathDirectional
  duration?:       number
  easing?:         string
  directionAware?: boolean
}

const CLIPS: Record<ClipPathPreset, ClipPathCustom> = {
  'wipe-right':  { hidden: 'inset(0 100% 0 0)',   hiddenReverse: 'inset(0 0 0 100%)',   visible: 'inset(0 0% 0 0%)' },
  'wipe-left':   { hidden: 'inset(0 0 0 100%)',   hiddenReverse: 'inset(0 100% 0 0)',   visible: 'inset(0 0% 0 0%)' },
  'wipe-down':   { hidden: 'inset(0 0 100% 0)',   hiddenReverse: 'inset(100% 0 0 0)',   visible: 'inset(0 0% 0 0%)' },
  'wipe-up':     { hidden: 'inset(100% 0 0 0)',   hiddenReverse: 'inset(0 0 100% 0)',   visible: 'inset(0 0% 0 0%)' },
  'circle':      { hidden: 'circle(0% at 50% 50%)',                                      visible: 'circle(150% at 50% 50%)' },
  'diamond':     { hidden: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',                visible: 'polygon(50% -60%, 160% 50%, 50% 160%, -60% 50%)' },
}

export function clipPathEffect(opts: ClipPathEffectOptions = {}): SliderPlugin {
  let slider:           SliderInstance
  let styleEl:          HTMLStyleElement
  let prevRawIdx:       number
  let clippingAncestors: { el: HTMLElement; overflow: string }[] = []

  const onIndexChanged = (info: SliderInfo) => {
    const nextRawIdx    = info.index
    const forward       = nextRawIdx >= prevRawIdx
    const duration      = opts.duration      ?? slider.options.speed ?? 300
    const easing        = opts.easing        ?? 'ease-in-out'
    const dirAware      = opts.directionAware ?? true
    const shapeDef = opts.shape ?? 'wipe-right'
    const isDirectional = (s: typeof shapeDef): s is ClipPathDirectional =>
      typeof s === 'object' && 'forward' in s && 'backward' in s
    const resolvedShape = isDirectional(shapeDef)
      ? (forward ? shapeDef.forward : shapeDef.backward)
      : shapeDef
    const clip = (typeof resolvedShape === 'string'
      ? CLIPS[resolvedShape as ClipPathPreset]
      : resolvedShape) as ClipPathCustom

    const outgoing = slider.slides[prevRawIdx]
    const incoming = slider.slides[nextRawIdx]

    if (!incoming || incoming === outgoing) { prevRawIdx = nextRawIdx; return }

    // Choose hidden start position (direction-aware for wipes)
    const hiddenStart = dirAware && !forward && clip.hiddenReverse
      ? clip.hiddenReverse
      : clip.hidden

    // Stack: incoming on top, outgoing beneath
    if (outgoing) {
      outgoing.style.zIndex    = '1'
      outgoing.style.clipPath  = ''
      outgoing.style.transition = ''
    }

    incoming.style.zIndex     = '2'
    incoming.style.transition = 'none'
    incoming.style.clipPath   = hiddenStart
    void incoming.offsetWidth  // reflow

    incoming.style.transition = `clip-path ${duration}ms ${easing}`
    incoming.style.clipPath   = clip.visible

    // After animation: clean up
    const cleanup = () => {
      incoming.style.transition = ''
      incoming.style.clipPath   = ''
      if (outgoing) outgoing.style.zIndex = '0'
      incoming.removeEventListener('transitionend', cleanup)
    }
    incoming.addEventListener('transitionend', cleanup)

    prevRawIdx = nextRawIdx
  }

  return {
    name: 'clipPathEffect',

    install(s: SliderInstance): void {
      slider     = s
      prevRawIdx = s.getInfo().index

      const uid      = 'skit-clip-' + Math.random().toString(36).slice(2, 7)
      const selector = s.container.id ? '#' + s.container.id : `[data-skit-clip="${uid}"]`
      if (!s.container.id) s.container.setAttribute('data-skit-clip', uid)

      styleEl = document.createElement('style')
      styleEl.textContent = [
        `${selector}{transform:none!important;transition:none!important;}`,
        `${selector}>.sliderkit__item{`,
          `position:absolute;top:0;left:0;width:100%;`,
        `}`,
      ].join('')
      document.head.appendChild(styleEl)

      // Remove will-change so it doesn't interfere with clip-path compositing
      s.container.style.willChange = 'auto'

      // Neutralise overflow:hidden ancestors
      clippingAncestors = []
      let ancestor = s.outerWrapper.parentElement as HTMLElement | null
      while (ancestor && ancestor !== document.body) {
        const ov = getComputedStyle(ancestor).overflow
        if (ov === 'hidden' || ov === 'auto' || ov === 'scroll') {
          clippingAncestors.push({ el: ancestor, overflow: ancestor.style.overflow })
          ancestor.style.overflow = 'visible'
        }
        ancestor = ancestor.parentElement
      }

      // Height sync
      const syncHeight = () => {
        const activeSlide = s.slides[s.activeIndex]
        const h = activeSlide?.offsetHeight || 0
        if (!h) return
        s.container.style.height    = h + 'px'
        s.innerWrapper.style.height = h + 'px'
        const overflowEl = s.innerWrapper.parentElement as HTMLElement
        if (overflowEl) overflowEl.style.height = h + 'px'
      }
      requestAnimationFrame(syncHeight)

      // Initial state: active slide on top, rest below
      s.slides.forEach((slide, i) => {
        slide.style.zIndex = i === prevRawIdx ? '2' : '0'
      })

      s.on('indexChanged', onIndexChanged)
      s.on('indexChanged', syncHeight)
    },

    destroy(): void {
      slider.off('indexChanged', onIndexChanged)
      styleEl?.remove()
      slider.container.removeAttribute('data-skit-clip')
      slider.container.style.willChange  = ''
      slider.container.style.height      = ''
      slider.innerWrapper.style.height   = ''
      const overflowEl = slider.innerWrapper.parentElement as HTMLElement
      if (overflowEl) overflowEl.style.height = ''
      clippingAncestors.forEach(saved => { saved.el.style.overflow = saved.overflow })
      clippingAncestors = []
      slider.slides.forEach(slide => {
        slide.style.zIndex    = ''
        slide.style.clipPath  = ''
        slide.style.transition = ''
      })
    },
  }
}
