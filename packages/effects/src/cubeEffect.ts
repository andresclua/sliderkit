// @ts-nocheck
import type { SliderPlugin } from '@andresclua/sliderkit'
import type { SliderInstance } from '@andresclua/sliderkit'

export interface CubeEffectOptions {
  shadow?: boolean
  slideShadows?: boolean
}

export function cubeEffect(_options: CubeEffectOptions = {}): SliderPlugin {
  let slider: SliderInstance | null = null

  return {
    name: 'cubeEffect',

    install(sliderInstance: SliderInstance) {
      slider = sliderInstance
      sliderInstance.container.classList.add('c--slider-effect-cube')
      sliderInstance.wrapper.style.transformStyle = 'preserve-3d'
      sliderInstance.wrapper.style.perspective = '1200px'
    },

    destroy() {
      slider?.container.classList.remove('c--slider-effect-cube')
      if (slider) {
        slider.wrapper.style.transformStyle = ''
        slider.wrapper.style.perspective = ''
      }
      slider = null
    },
  }
}
