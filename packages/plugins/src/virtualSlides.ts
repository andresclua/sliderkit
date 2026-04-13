import type { SliderPlugin } from '@acslider/core'
import type { SliderInstance } from '@acslider/core'

export interface VirtualSlidesOptions {
  preRender?: number
  cache?: boolean
  renderSlide?: (index: number) => HTMLElement
}

export function virtualSlides(options: VirtualSlidesOptions = {}): SliderPlugin {
  const { preRender = 2, cache = true } = options

  let slider: SliderInstance | null = null
  const rendered = new Set<number>()

  function renderRange(activeIndex: number, slideCount: number): void {
    if (!slider) return
    for (let i = Math.max(0, activeIndex - preRender); i <= Math.min(slideCount - 1, activeIndex + preRender); i++) {
      if (cache && rendered.has(i)) continue
      const slide = slider.slides[i]
      if (!slide) continue

      const src = slide.getAttribute('data-src')
      if (src) {
        const img = slide.querySelector('img')
        if (img && !img.src) img.src = src
        else if (!img) slide.style.backgroundImage = `url(${src})`
        slide.removeAttribute('data-src')
      }
      rendered.add(i)
    }
  }

  return {
    name: 'virtualSlides',

    install(sliderInstance: SliderInstance) {
      slider = sliderInstance
      renderRange(slider.activeIndex, slider.slideCount)
      slider.on('beforeSlideChange', ({ to }: { to: number; from: number; direction: 'next' | 'prev'; slider: unknown }) => {
        renderRange(to, slider!.slideCount)
      })
    },

    destroy() {
      rendered.clear()
      slider = null
    },
  }
}
