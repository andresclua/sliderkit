import type { SliderPlugin } from '@acslider/core'
import type { SliderInstance } from '@acslider/core'

export interface SlideCounterOptions {
  el?: string | HTMLElement
  template?: string
}

export function slideCounter(options: SlideCounterOptions = {}): SliderPlugin {
  const { template = '{{current}} / {{total}}' } = options

  let slider: SliderInstance | null = null
  let container: HTMLElement | null = null
  let autoCreated = false

  function update(): void {
    if (!slider || !container) return
    container.textContent = template
      .replace('{{current}}', String(slider.activeIndex + 1))
      .replace('{{total}}', String(slider.slideCount))
  }

  return {
    name: 'slideCounter',

    install(sliderInstance: SliderInstance) {
      slider = sliderInstance

      if (options.el) {
        container =
          typeof options.el === 'string'
            ? sliderInstance.container.querySelector<HTMLElement>(options.el)
            : options.el
      }

      if (!container) {
        autoCreated = true
        container = document.createElement('div')
        container.className = 'c--slider-a__counter'
        sliderInstance.container.appendChild(container)
      }

      update()
      slider.on('afterSlideChange', update as () => void)
    },

    destroy() {
      slider?.off('afterSlideChange', update as () => void)
      if (autoCreated) container?.remove()
      slider = null
      container = null
    },
  }
}
