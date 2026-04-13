import type { SliderPlugin } from '@acslider/core'
import type { SliderInstance } from '@acslider/core'

export interface VariableWidthOptions {
  adaptiveHeight?: boolean
}

export function variableWidth(_options: VariableWidthOptions = {}): SliderPlugin {
  let slider: SliderInstance | null = null

  function init(): void {
    if (!slider) return
    // Slides keep their natural width — just ensure they don't shrink
    slider.slides.forEach((slide: HTMLElement) => {
      slide.style.width = ''
      slide.style.flexShrink = '0'
    })
    slider.wrapper.style.width = 'max-content'
  }

  return {
    name: 'variableWidth',

    install(sliderInstance: SliderInstance) {
      slider = sliderInstance
      init()
      slider.on('afterInit', init as () => void)
    },

    destroy() {
      slider?.off('afterInit', init as () => void)
      if (slider) {
        slider.slides.forEach((slide: HTMLElement) => {
          slide.style.flexShrink = ''
        })
        slider.wrapper.style.width = ''
      }
      slider = null
    },
  }
}
