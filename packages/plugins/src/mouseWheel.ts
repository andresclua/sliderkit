import type { SliderPlugin } from '@andresclua/sliderkit'
import type { SliderInstance } from '@andresclua/sliderkit'

export interface MouseWheelOptions {
  forceToAxis?: boolean
  releaseOnEdges?: boolean
  sensitivity?: number
  deltaThreshold?: number
}

export function mouseWheel(options: MouseWheelOptions = {}): SliderPlugin {
  const { forceToAxis = true, releaseOnEdges = false, sensitivity = 1, deltaThreshold = 50 } = options

  let slider: SliderInstance | null = null
  let lastEventTime = 0
  const minDelay = 300

  function onWheel(e: WheelEvent): void {
    if (!slider) return

    const info = slider.getInfo() as Record<string, unknown>
    const isHorizontal = info.direction !== 'vertical'
    const delta = isHorizontal ? e.deltaX || e.deltaY : e.deltaY

    if (Math.abs(delta) < deltaThreshold) return

    const now = Date.now()
    if (now - lastEventTime < minDelay) return
    lastEventTime = now

    if (forceToAxis) {
      const dominantAxis = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? 'x' : 'y'
      if (isHorizontal && dominantAxis !== 'x') return
      if (!isHorizontal && dominantAxis !== 'y') return
    }

    if (releaseOnEdges) {
      const index = info.index as number
      const total = info.slideCount as number
      const loop = info.loop as boolean
      if (!loop) {
        if (delta > 0 && index >= total - 1) return
        if (delta < 0 && index <= 0) return
      }
    }

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
