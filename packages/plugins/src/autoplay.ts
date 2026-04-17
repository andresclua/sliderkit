import type { SliderPlugin, SliderInstance, SliderInfo } from '@andresclua/sliderkit'

export interface AutoplayOptions {
  delay?:        number
  pauseOnHover?: boolean
  pauseOnFocus?: boolean
  direction?:    'forward' | 'backward'
}

const CLS_PLAYING = 'c--slider-a--autoplay-playing'
const CLS_PAUSED  = 'c--slider-a--autoplay-paused'

export function autoplay(opts: AutoplayOptions = {}): SliderPlugin {
  const delay        = opts.delay        ?? 3000
  const pauseOnHover = opts.pauseOnHover ?? true
  const pauseOnFocus = opts.pauseOnFocus ?? true
  const direction    = opts.direction    ?? 'forward'

  let slider:    SliderInstance
  let timerId:   ReturnType<typeof setTimeout> | null = null
  let paused:    boolean = false
  let destroyed: boolean = false

  function schedule(): void {
    if (timerId) clearTimeout(timerId)
    timerId = setTimeout(() => {
      if (!paused && !destroyed) {
        direction === 'forward' ? slider.next() : slider.prev()
        schedule()
      }
    }, delay)
  }

  function pause(): void {
    if (paused) return
    paused = true
    if (timerId) { clearTimeout(timerId); timerId = null }
    slider.outerWrapper.classList.remove(CLS_PLAYING)
    slider.outerWrapper.classList.add(CLS_PAUSED)
  }

  function play(): void {
    if (!paused) return
    paused = false
    slider.outerWrapper.classList.remove(CLS_PAUSED)
    slider.outerWrapper.classList.add(CLS_PLAYING)
    schedule()
  }

  const onMouseEnter = () => { if (pauseOnHover) pause() }
  const onMouseLeave = () => { if (pauseOnHover) play() }
  const onFocusIn    = () => { if (pauseOnFocus) pause() }
  const onFocusOut   = () => { if (pauseOnFocus) play() }

  return {
    name: 'autoplay',

    install(s: SliderInstance): void {
      slider  = s
      paused  = false
      destroyed = false

      slider.outerWrapper.classList.add(CLS_PLAYING)

      if (pauseOnHover) {
        slider.outerWrapper.addEventListener('mouseenter', onMouseEnter)
        slider.outerWrapper.addEventListener('mouseleave', onMouseLeave)
      }
      if (pauseOnFocus) {
        slider.outerWrapper.addEventListener('focusin',  onFocusIn)
        slider.outerWrapper.addEventListener('focusout', onFocusOut)
      }

      // pause while user is touching/dragging
      s.on('touchStart', pause as (d: SliderInfo) => void)
      s.on('dragStart',  pause as (d: SliderInfo) => void)
      s.on('touchEnd',   play  as (d: SliderInfo) => void)
      s.on('dragEnd',    play  as (d: SliderInfo) => void)

      schedule()
    },

    destroy(): void {
      destroyed = true
      if (timerId) { clearTimeout(timerId); timerId = null }
      slider.outerWrapper.classList.remove(CLS_PLAYING, CLS_PAUSED)
      slider.outerWrapper.removeEventListener('mouseenter', onMouseEnter)
      slider.outerWrapper.removeEventListener('mouseleave', onMouseLeave)
      slider.outerWrapper.removeEventListener('focusin',  onFocusIn)
      slider.outerWrapper.removeEventListener('focusout', onFocusOut)
    },
  }
}
