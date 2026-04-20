// @ts-nocheck
import type { SliderPlugin } from '@andresclua/sliderkit'
import type { SliderInstance } from '@andresclua/sliderkit'

export interface CoverflowEffectOptions {
  rotate?: number
  stretch?: number
  depth?: number
  modifier?: number
  slideShadows?: boolean
}

export function coverflowEffect(options: CoverflowEffectOptions = {}): SliderPlugin {
  const { rotate = 50, stretch = 0, depth = 100, modifier = 1 } = options

  let slider: SliderInstance | null = null

  function apply(): void {
    if (!slider) return
    slider.slides.forEach((slide, i) => {
      const offset = (i - slider!.activeIndex) * modifier
      const rotateY = offset * rotate
      const translateZ = depth - Math.abs(offset) * depth
      const scaleX = 1 - Math.abs(offset) * 0.1
      slide.style.transform = `rotateY(${rotateY}deg) translateZ(${translateZ - stretch * Math.abs(offset)}px) scaleX(${scaleX})`
      slide.style.zIndex = String(100 - Math.abs(i - slider!.activeIndex))
    })
  }

  return {
    name: 'coverflowEffect',

    install(sliderInstance: SliderInstance) {
      slider = sliderInstance
      sliderInstance.container.classList.add('c--slider-effect-coverflow')
      sliderInstance.wrapper.style.transformStyle = 'preserve-3d'
      sliderInstance.wrapper.style.perspective = '1200px'
      apply()
      slider.on('afterSlideChange', apply as () => void)
    },

    destroy() {
      slider?.container.classList.remove('c--slider-effect-coverflow')
      slider?.slides.forEach((slide) => { slide.style.transform = ''; slide.style.zIndex = '' })
      slider?.off('afterSlideChange', apply as () => void)
      slider = null
    },
  }
}
