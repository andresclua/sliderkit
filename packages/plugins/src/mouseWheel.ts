import type { SliderPlugin, SliderInstance } from '@andresclua/sliderkit'

export interface MouseWheelOptions {
  threshold?: number  // accumulated deltaY to trigger a slide (default 120)
  invert?:    boolean
}

export function mouseWheel(opts: MouseWheelOptions = {}): SliderPlugin {
  const threshold = opts.threshold ?? 120
  const invert    = opts.invert    ?? false

  let slider:       SliderInstance
  let accumulated:  number = 0
  let cooldown:     boolean = false
  let resetTimer:   ReturnType<typeof setTimeout>
  let unlockTimer:  ReturnType<typeof setTimeout>

  const onWheel = (e: Event): void => {
    const we = e as WheelEvent
    e.preventDefault()

    if (cooldown) return

    accumulated += we.deltaY

    clearTimeout(resetTimer)
    resetTimer = setTimeout(() => { accumulated = 0 }, 80)

    if (Math.abs(accumulated) < threshold) return

    const forward = invert ? accumulated < 0 : accumulated > 0
    accumulated = 0
    cooldown = true

    forward ? slider.next() : slider.prev()

    clearTimeout(unlockTimer)
    unlockTimer = setTimeout(
      () => { cooldown = false },
      (slider.options.speed ?? 300) + 200,
    )
  }

  return {
    name: 'mouseWheel',

    install(s: SliderInstance): void {
      slider = s
      s.container.addEventListener('wheel', onWheel, { passive: false })
    },

    destroy(): void {
      clearTimeout(resetTimer)
      clearTimeout(unlockTimer)
      slider.container.removeEventListener('wheel', onWheel)
    },
  }
}
