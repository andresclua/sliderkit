import type { SliderPlugin } from '@acslider/core'
import type { SliderInstance } from '@acslider/core'

export interface AutoplayOptions {
  delay?: number
  pauseOnHover?: boolean
  pauseOnInteraction?: boolean
  disableOnInteraction?: boolean
  reverseDirection?: boolean
  resetOnVisibility?: boolean
}

export function autoplay(options: AutoplayOptions = {}): SliderPlugin & {
  start(): void
  stop(): void
} {
  const {
    delay = 3000,
    pauseOnHover = true,
    pauseOnInteraction = true,
    disableOnInteraction = false,
    reverseDirection = false,
    resetOnVisibility = true,
  } = options

  let intervalId: ReturnType<typeof setInterval> | null = null
  let slider: SliderInstance | null = null
  let paused = false
  let disabled = false

  let hoverEnterHandler: (() => void) | null = null
  let hoverLeaveHandler: (() => void) | null = null
  let visibilityHandler: (() => void) | null = null
  let interactionHandler: (() => void) | null = null

  function start(): void {
    if (disabled || paused) return
    stop()
    intervalId = setInterval(() => {
      if (!slider) return
      slider.goTo(reverseDirection ? 'prev' : 'next')
    }, delay)
  }

  function stop(): void {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  return {
    name: 'autoplay',

    install(sliderInstance: SliderInstance) {
      slider = sliderInstance

      start()

      if (pauseOnHover && slider.container) {
        hoverEnterHandler = () => {
          paused = true
          stop()
        }
        hoverLeaveHandler = () => {
          paused = false
          if (!disabled) start()
        }
        slider.container.addEventListener('mouseenter', hoverEnterHandler)
        slider.container.addEventListener('mouseleave', hoverLeaveHandler)
      }

      if (pauseOnInteraction || disableOnInteraction) {
        interactionHandler = () => {
          if (disableOnInteraction) {
            disabled = true
            stop()
          } else if (pauseOnInteraction) {
            paused = true
            stop()
            // Resume after the slide transition
            setTimeout(() => {
              if (!disabled) {
                paused = false
                start()
              }
            }, (slider?.getInfo() as Record<string, unknown>).speed as number || 300)
          }
        }

        slider.on('touchStart', interactionHandler as () => void)
        slider.on('dragStart', interactionHandler as () => void)
      }

      if (resetOnVisibility) {
        visibilityHandler = () => {
          if (document.hidden) {
            stop()
          } else if (!paused && !disabled) {
            start()
          }
        }
        document.addEventListener('visibilitychange', visibilityHandler)
      }
    },

    start,
    stop,

    destroy() {
      stop()
      if (hoverEnterHandler && slider?.container) {
        slider.container.removeEventListener('mouseenter', hoverEnterHandler)
        slider.container.removeEventListener('mouseleave', hoverLeaveHandler!)
      }
      if (visibilityHandler) {
        document.removeEventListener('visibilitychange', visibilityHandler)
      }
      slider = null
      hoverEnterHandler = null
      hoverLeaveHandler = null
      visibilityHandler = null
      interactionHandler = null
      intervalId = null
    },
  }
}
