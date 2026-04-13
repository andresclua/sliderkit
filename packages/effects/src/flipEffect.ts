import type { SliderPlugin } from '@acslider/core'
import type { SliderInstance } from '@acslider/core'
import type { AfterSlideChangePayload } from '@acslider/core'

export interface FlipEffectOptions {
  slideShadows?: boolean
  limitRotation?: boolean
}

export function flipEffect(_options: FlipEffectOptions = {}): SliderPlugin {
  let slider: SliderInstance | null = null

  function apply(activeIndex?: number): void {
    if (!slider) return
    const idx = activeIndex ?? slider.activeIndex
    slider.slides.forEach((slide, i) => {
      const offset = i - idx
      slide.style.transform = `rotateY(${offset * 180}deg)`
      slide.style.zIndex = i === idx ? '1' : '0'
      slide.style.backfaceVisibility = 'hidden'
    })
  }

  function onSlideChange({ index }: AfterSlideChangePayload): void {
    apply(index)
    if (slider) {
      slider.wrapper.style.transform = 'translate3d(0,0,0)'
      slider.wrapper.style.transition = 'none'
    }
  }

  return {
    name: 'flipEffect',

    install(sliderInstance: SliderInstance) {
      slider = sliderInstance
      sliderInstance.container.classList.add('c--slider-effect-flip')
      sliderInstance.wrapper.style.transformStyle = 'preserve-3d'
      sliderInstance.wrapper.style.perspective = '1200px'
      sliderInstance.wrapper.style.transform = 'translate3d(0,0,0)'
      sliderInstance.wrapper.style.transition = 'none'

      sliderInstance.slides.forEach((slide) => {
        slide.style.position = 'absolute'
        slide.style.top = '0'
        slide.style.left = '0'
        slide.style.width = '100%'
      })

      apply()
      slider.on('afterSlideChange', onSlideChange as (p: AfterSlideChangePayload) => void)
    },

    destroy() {
      slider?.container.classList.remove('c--slider-effect-flip')
      slider?.slides.forEach((slide) => {
        slide.style.transform = ''
        slide.style.zIndex = ''
        slide.style.backfaceVisibility = ''
        slide.style.position = ''
        slide.style.top = ''
        slide.style.left = ''
        slide.style.width = ''
      })
      slider?.off('afterSlideChange', onSlideChange as (p: AfterSlideChangePayload) => void)
      slider = null
    },
  }
}
