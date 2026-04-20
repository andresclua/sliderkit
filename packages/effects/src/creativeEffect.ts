// @ts-nocheck
import type { SliderPlugin } from '@andresclua/sliderkit'
import type { SliderInstance } from '@andresclua/sliderkit'
import type { AfterSlideChangePayload } from '@andresclua/sliderkit'

export type CreativeTransform = {
  translate?: [number | string, number | string, number | string]
  rotate?: [number, number, number]
  scale?: number
  opacity?: number
}

export interface CreativeEffectOptions {
  prev?: CreativeTransform
  next?: CreativeTransform
  active?: CreativeTransform
  perspective?: boolean
  limitProgress?: number
}

const DEFAULT_PREV: CreativeTransform = { translate: ['-100%', 0, 0] }
const DEFAULT_NEXT: CreativeTransform = { translate: ['100%', 0, 0] }
const DEFAULT_ACTIVE: CreativeTransform = { translate: [0, 0, 0] }

function buildTransform(t: CreativeTransform): string {
  const parts: string[] = []
  if (t.translate) {
    const [x, y, z] = t.translate
    parts.push(`translate3d(${x}, ${y}, ${typeof z === 'number' ? z + 'px' : z})`)
  }
  if (t.rotate) {
    const [rx, ry, rz] = t.rotate
    if (rx) parts.push(`rotateX(${rx}deg)`)
    if (ry) parts.push(`rotateY(${ry}deg)`)
    if (rz) parts.push(`rotateZ(${rz}deg)`)
  }
  if (t.scale !== undefined) parts.push(`scale(${t.scale})`)
  return parts.join(' ')
}

export function creativeEffect(options: CreativeEffectOptions = {}): SliderPlugin {
  const {
    prev = DEFAULT_PREV,
    next = DEFAULT_NEXT,
    active = DEFAULT_ACTIVE,
    perspective = true,
  } = options

  let slider: SliderInstance | null = null

  function apply(activeIndex?: number): void {
    if (!slider) return
    const idx = activeIndex ?? slider.activeIndex
    slider.slides.forEach((slide, i) => {
      const offset = i - idx
      let transform: CreativeTransform
      if (offset === 0) transform = active
      else if (offset < 0) transform = prev
      else transform = next
      slide.style.transform = buildTransform(transform)
      slide.style.opacity = transform.opacity !== undefined ? String(transform.opacity) : '1'
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
    name: 'creativeEffect',

    install(sliderInstance: SliderInstance) {
      slider = sliderInstance
      sliderInstance.container.classList.add('c--slider-effect-creative')

      sliderInstance.wrapper.style.position = 'relative'
      sliderInstance.wrapper.style.transform = 'translate3d(0,0,0)'
      sliderInstance.wrapper.style.transition = 'none'

      if (perspective) {
        sliderInstance.wrapper.style.transformStyle = 'preserve-3d'
        sliderInstance.wrapper.style.perspective = '1200px'
      }

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
      slider?.container.classList.remove('c--slider-effect-creative')
      slider?.slides.forEach((slide) => {
        slide.style.transform = ''
        slide.style.opacity = ''
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
