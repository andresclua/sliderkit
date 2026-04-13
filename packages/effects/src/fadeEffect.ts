import type { SliderPlugin } from '@acslider/core'
import type { SliderInstance } from '@acslider/core'
import type { AfterSlideChangePayload } from '@acslider/core'

export interface FadeEffectOptions {
  crossFade?: boolean
}

export function fadeEffect(options: FadeEffectOptions = {}): SliderPlugin {
  const { crossFade = true } = options

  let slider: SliderInstance | null = null

  function applyFade(activeIndex?: number): void {
    if (!slider) return
    const idx = activeIndex ?? slider.activeIndex
    slider.slides.forEach((slide, i) => {
      const isActive = i === idx
      slide.style.opacity = isActive || !crossFade ? '1' : '0'
      slide.style.zIndex = isActive ? '1' : '0'
      slide.style.pointerEvents = isActive ? 'auto' : 'none'
    })
  }

  function onSlideChange({ index }: AfterSlideChangePayload): void {
    applyFade(index)
    // Reset wrapper translate — slides are absolute, wrapper must stay at 0
    if (slider) {
      slider.wrapper.style.transform = 'translate3d(0,0,0)'
      slider.wrapper.style.transition = 'none'
    }
  }

  return {
    name: 'fadeEffect',

    install(sliderInstance: SliderInstance) {
      slider = sliderInstance
      sliderInstance.container.classList.add('c--slider-effect-fade')

      const speed = (sliderInstance.getInfo() as Record<string, unknown>).speed as number ?? 300

      sliderInstance.wrapper.style.position = 'relative'
      sliderInstance.wrapper.style.transform = 'translate3d(0,0,0)'
      sliderInstance.wrapper.style.transition = 'none'

      sliderInstance.slides.forEach((slide) => {
        slide.style.position = 'absolute'
        slide.style.top = '0'
        slide.style.left = '0'
        slide.style.width = '100%'
        slide.style.transition = `opacity ${speed}ms ease`
      })

      applyFade()
      slider.on('afterSlideChange', onSlideChange as (p: AfterSlideChangePayload) => void)
    },

    destroy() {
      slider?.container.classList.remove('c--slider-effect-fade')
      slider?.slides.forEach((slide) => {
        slide.style.position = ''
        slide.style.top = ''
        slide.style.left = ''
        slide.style.opacity = ''
        slide.style.zIndex = ''
        slide.style.pointerEvents = ''
        slide.style.transition = ''
      })
      slider?.wrapper.style && (slider.wrapper.style.position = '')
      slider?.off('afterSlideChange', onSlideChange as (p: AfterSlideChangePayload) => void)
      slider = null
    },
  }
}
