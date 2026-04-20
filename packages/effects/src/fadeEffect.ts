import type { SliderPlugin, SliderInstance } from '@andresclua/sliderkit'

export interface FadeEffectOptions {
  crossFade?: boolean  // true = others fade out, false = others stay visible beneath (default: true)
  duration?:  number   // fade duration in ms — defaults to the slider's speed option
  easing?:    string   // CSS easing function (default: 'ease')
}

export function fadeEffect(opts: FadeEffectOptions = {}): SliderPlugin {
  const crossFade = opts.crossFade ?? true
  const easing    = opts.easing    ?? 'ease'

  let slider:  SliderInstance
  let styleEl: HTMLStyleElement

  return {
    name: 'fadeEffect',

    install(s: SliderInstance): void {
      slider = s

      // Build a unique CSS selector for this container
      const uid      = 'skit-f-' + Math.random().toString(36).slice(2, 7)
      const selector = s.container.id ? '#' + s.container.id : `[data-skit-fade="${uid}"]`
      if (!s.container.id) s.container.setAttribute('data-skit-fade', uid)

      const speed    = opts.duration ?? s.options.speed ?? 300
      const opacity0 = crossFade ? '0' : '1'

      // Inject CSS:
      //  - neutralise the slider's translate (it moves the container, fade doesn't need that)
      //  - stack slides with absolute positioning
      //  - use the existing --active class for the opacity toggle
      styleEl = document.createElement('style')
      styleEl.textContent = [
        `${selector}{transform:none!important;transition:none!important;}`,
        `${selector}>.sliderkit__item{`,
          `position:absolute;top:0;left:0;width:100%;`,
          `opacity:${opacity0};`,
          `transition:opacity ${speed}ms ${easing};`,
          `pointer-events:none;z-index:0;`,
        `}`,
        `${selector}>.sliderkit__item--active{`,
          `opacity:1;pointer-events:auto;z-index:1;`,
        `}`,
      ].join('')
      document.head.appendChild(styleEl)

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
      s.on('indexChanged', syncHeight)
    },

    destroy(): void {
      styleEl?.remove()
      slider.container.removeAttribute('data-skit-fade')
      slider.container.style.height    = ''
      slider.innerWrapper.style.height = ''
      const overflowEl = slider.innerWrapper.parentElement as HTMLElement
      if (overflowEl) overflowEl.style.height = ''
    },
  }
}
