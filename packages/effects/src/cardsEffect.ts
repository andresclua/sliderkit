import type { SliderPlugin } from '@acslider/core'
import type { SliderInstance } from '@acslider/core'
import type { AfterSlideChangePayload } from '@acslider/core'

export interface CardsEffectOptions {
  slideShadows?: boolean
  rotate?: boolean
  perSlideOffset?: number
  perSlideRotate?: number
}

export function cardsEffect(options: CardsEffectOptions = {}): SliderPlugin {
  const { perSlideOffset = 8, perSlideRotate = 2 } = options

  let slider: SliderInstance | null = null

  function apply(activeIndex?: number): void {
    if (!slider) return
    const idx = activeIndex ?? slider.activeIndex
    slider.slides.forEach((slide, i) => {
      const offset = i - idx
      if (offset < 0) {
        slide.style.display = 'none'
        return
      }
      slide.style.display = ''
      slide.style.transform = `translateY(${offset * perSlideOffset}px) scale(${1 - offset * 0.05}) rotate(${offset * perSlideRotate}deg)`
      slide.style.zIndex = String(100 - offset)
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
    name: 'cardsEffect',

    install(sliderInstance: SliderInstance) {
      slider = sliderInstance
      sliderInstance.container.classList.add('c--slider-effect-cards')

      sliderInstance.wrapper.style.position = 'relative'
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
      slider?.container.classList.remove('c--slider-effect-cards')
      slider?.slides.forEach((slide) => {
        slide.style.transform = ''
        slide.style.zIndex = ''
        slide.style.display = ''
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
