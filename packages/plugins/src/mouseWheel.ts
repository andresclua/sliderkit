import type { SliderPlugin } from '@acslider/core'
import type { SliderInstance } from '@acslider/core'

export interface MouseWheelOptions {
  forceToAxis?: boolean
  releaseOnEdges?: boolean
  sensitivity?: number
}

export function mouseWheel(options: MouseWheelOptions = {}): SliderPlugin {
  const { forceToAxis = true, sensitivity = 1 } = options

  let slider: SliderInstance | null = null
  let lastEventTime = 0
  const minDelay = 300

  function onWheel(e: WheelEvent): void {
    if (!slider) return
    const now = Date.now()
    if (now - lastEventTime < minDelay) return
    lastEventTime = now

    if (forceToAxis) {
      const isHorizontal = (slider.getInfo() as Record<string, unknown>).direction !== 'vertical'
      const dominantAxis = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? 'x' : 'y'
      if (isHorizontal && dominantAxis !== 'x') return
      if (!isHorizontal && dominantAxis !== 'y') return
    }

    const delta =
      (slider.getInfo() as Record<string, unknown>).direction !== 'vertical' ? e.deltaX || e.deltaY : e.deltaY

    if (delta * sensitivity > 0) {
      slider.next()
    } else {
      slider.prev()
    }

    e.preventDefault()
  }

  return {
    name: 'mouseWheel',

    install(sliderInstance: SliderInstance) {
      slider = sliderInstance
      slider.container.addEventListener('wheel', onWheel, { passive: false })
    },

    destroy() {
      slider?.container.removeEventListener('wheel', onWheel)
      slider = null
    },
  }
}
