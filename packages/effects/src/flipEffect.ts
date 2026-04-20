import type { SliderPlugin, SliderInstance, SliderInfo } from '@andresclua/sliderkit'

export interface FlipEffectOptions {
  duration?:    number  // ms — defaults to slider speed
  easing?:      string  // CSS easing (default: 'ease-in-out')
  perspective?: number  // perspective distance in px (default: 800)
}

export function flipEffect(opts: FlipEffectOptions = {}): SliderPlugin {
  let slider:           SliderInstance
  let styleEl:          HTMLStyleElement
  let prevRawIdx:       number
  let clippingAncestors: { el: HTMLElement; overflow: string }[] = []

  const p = (deg: string, persp: number) => `perspective(${persp}px) rotateY(${deg})`

  const onIndexChanged = (info: SliderInfo) => {
    const nextRawIdx = info.index
    const forward    = nextRawIdx >= prevRawIdx
    const duration   = opts.duration   ?? slider.options.speed ?? 300
    const half       = duration / 2
    const easing     = opts.easing     ?? 'ease-in-out'
    const persp      = opts.perspective ?? 800

    const outgoing = slider.slides[prevRawIdx]
    const incoming = slider.slides[nextRawIdx]

    // Phase 1: outgoing rotates away (first half)
    if (outgoing && outgoing !== incoming) {
      outgoing.style.transition = `transform ${half}ms ${easing}`
      outgoing.style.transform  = p(forward ? '-90deg' : '90deg', persp)
      outgoing.style.zIndex     = '1'
    }

    // Phase 2: incoming rotates in (second half, after outgoing is gone)
    if (incoming) {
      incoming.style.transition = 'none'
      incoming.style.transform  = p(forward ? '90deg' : '-90deg', persp)
      incoming.style.zIndex     = '0'
      void incoming.offsetWidth

      setTimeout(() => {
        incoming.style.zIndex     = '1'
        incoming.style.transition = `transform ${half}ms ${easing}`
        incoming.style.transform  = p('0deg', persp)
        if (outgoing) outgoing.style.zIndex = '0'
      }, half)
    }

    prevRawIdx = nextRawIdx
  }

  return {
    name: 'flipEffect',

    install(s: SliderInstance): void {
      slider     = s
      prevRawIdx = s.getInfo().index

      const uid      = 'skit-flip-' + Math.random().toString(36).slice(2, 7)
      const selector = s.container.id ? '#' + s.container.id : `[data-skit-flip="${uid}"]`
      if (!s.container.id) s.container.setAttribute('data-skit-flip', uid)

      const persp = opts.perspective ?? 800

      styleEl = document.createElement('style')
      styleEl.textContent = [
        `${selector}{transform:none!important;transition:none!important;}`,
        `${selector}>.sliderkit__item{`,
          `position:absolute;top:0;left:0;width:100%;`,
          `backface-visibility:hidden;`,
          `transform:perspective(${persp}px) rotateY(90deg);`,
        `}`,
      ].join('')
      document.head.appendChild(styleEl)

      // will-change:transform on the container creates a compositing layer that
      // flattens 3D child transforms — must remove it for the flip to render in 3D
      s.container.style.willChange = 'auto'

      // Walk the DOM up and neutralise every ancestor with overflow clipping —
      // any overflow:hidden/auto/scroll ancestor flattens CSS 3D transforms.
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

      s.slides.forEach((slide, i) => {
        slide.style.transform = p(i === prevRawIdx ? '0deg' : '90deg', persp)
        slide.style.zIndex    = i === prevRawIdx ? '1' : '0'
      })

      s.on('indexChanged', onIndexChanged)
      s.on('indexChanged', syncHeight)
    },

    destroy(): void {
      slider.off('indexChanged', onIndexChanged)
      styleEl?.remove()
      slider.container.removeAttribute('data-skit-flip')
      slider.container.style.height    = ''
      slider.innerWrapper.style.height = ''
      slider.container.style.willChange = ''
      clippingAncestors.forEach(function(saved) {
        saved.el.style.overflow = saved.overflow
      })
      clippingAncestors = []
      slider.slides.forEach(slide => {
        slide.style.transform  = ''
        slide.style.transition = ''
        slide.style.zIndex     = ''
      })
    },
  }
}
