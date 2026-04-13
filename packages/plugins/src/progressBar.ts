import type { SliderPlugin } from '@acslider/core'
import type { SliderInstance } from '@acslider/core'

export interface ProgressBarOptions {
  el?: string | HTMLElement
}

export function progressBar(options: ProgressBarOptions = {}): SliderPlugin {
  let slider: SliderInstance | null = null
  let container: HTMLElement | null = null
  let fill: HTMLElement | null = null
  let autoCreated = false

  function update(): void {
    if (!slider || !fill) return
    fill.style.width = `${slider.progress * 100}%`
  }

  return {
    name: 'progressBar',

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
        container.className = 'c--slider-a__progress'
        sliderInstance.container.appendChild(container)
      }

      fill = document.createElement('div')
      fill.className = 'c--slider-a__progress-fill'
      container.appendChild(fill)

      update()
      slider.on('afterSlideChange', update as () => void)
    },

    destroy() {
      slider?.off('afterSlideChange', update as () => void)
      if (autoCreated) container?.remove()
      slider = null
      container = null
      fill = null
    },
  }
}
