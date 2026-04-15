import type { SliderPlugin } from '@acslider/core'
import type { SliderInstance } from '@acslider/core'

export interface ParallaxOptions {
  selector?: string
  depth?: number
}

export function parallax(options: ParallaxOptions = {}): SliderPlugin {
  const { selector = '[data-parallax]', depth = 0.3 } = options

  let slider: SliderInstance | null = null

  function applyParallax(): void {
    if (!slider) return
    slider.slides.forEach((slide: HTMLElement, i: number) => {
      const els = slide.querySelectorAll<HTMLElement>(selector)
      if (!els.length) return
      const slideWidth = slide.offsetWidth || 1
      const offset = (i - slider!.activeIndex) * slideWidth * depth
      els.forEach((el: HTMLElement) => {
        el.style.transform = `translate3d(${offset}px, 0, 0)`
      })
    })
  }

  return {
    name: 'parallax',

    install(sliderInstance: SliderInstance) {
      slider = sliderInstance
      applyParallax()
      slider.on('afterSlideChange', applyParallax as () => void)
      slider.on('progress', applyParallax as () => void)
    },

    destroy() {
      slider?.off('afterSlideChange', applyParallax as () => void)
      slider?.off('progress', applyParallax as () => void)
      slider = null
    },
  }
}
