import type { SliderPlugin, SliderInstance } from '@andresclua/sliderkit'

export interface ThumbsOptions {
  container:   string | HTMLElement  // element whose children are the thumb items
  activeClass?: string               // class added to the active thumb (default: 'sliderkit__thumb--active')
}

export function thumbs(opts: ThumbsOptions): SliderPlugin {
  const activeClass = opts.activeClass ?? 'sliderkit__thumb--active'

  let slider:    SliderInstance
  let thumbEls:  HTMLElement[]
  let handlers:  Array<() => void> = []

  const setActive = () => {
    thumbEls.forEach((el, i) => {
      el.classList.toggle(activeClass, i === slider.activeIndex)
    })
  }

  return {
    name: 'thumbs',

    install(s: SliderInstance): void {
      slider = s

      const container = typeof opts.container === 'string'
        ? document.querySelector<HTMLElement>(opts.container)
        : opts.container

      if (!container) {
        console.warn('SliderKit thumbs: container not found')
        return
      }

      thumbEls = Array.from(container.children) as HTMLElement[]

      thumbEls.forEach((el, i) => {
        el.style.cursor = 'pointer'
        const handler = () => s.goTo(i)
        handlers.push(handler)
        el.addEventListener('click', handler)
      })

      setActive()
      s.on('indexChanged', setActive)
    },

    destroy(): void {
      slider.off('indexChanged', setActive)
      thumbEls.forEach((el, i) => {
        el.removeEventListener('click', handlers[i]!)
        el.style.cursor = ''
        el.classList.remove(activeClass)
      })
      handlers = []
    },
  }
}
