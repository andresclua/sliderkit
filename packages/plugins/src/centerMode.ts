import type { SliderPlugin } from '@acslider/core'
import type { SliderInstance } from '@acslider/core'

export interface CenterModeOptions {
  centerPadding?: string
}

export function centerMode(options: CenterModeOptions = {}): SliderPlugin {
  const { centerPadding = '50px' } = options

  let slider: SliderInstance | null = null

  function apply(): void {
    if (!slider) return
    slider.container.style.paddingLeft = centerPadding
    slider.container.style.paddingRight = centerPadding
    slider.container.style.overflow = 'visible'
  }

  return {
    name: 'centerMode',

    install(sliderInstance: SliderInstance) {
      slider = sliderInstance
      apply()
    },

    destroy() {
      if (slider) {
        slider.container.style.paddingLeft = ''
        slider.container.style.paddingRight = ''
        slider.container.style.overflow = ''
      }
      slider = null
    },
  }
}
