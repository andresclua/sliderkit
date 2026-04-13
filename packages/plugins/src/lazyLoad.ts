import type { SliderPlugin } from '@acslider/core'
import type { SliderInstance } from '@acslider/core'

export interface LazyLoadOptions {
  selector?: string
  rootMargin?: string
}

export function lazyLoad(options: LazyLoadOptions = {}): SliderPlugin {
  const { selector = '[data-src]', rootMargin = '200px' } = options

  let observer: IntersectionObserver | null = null

  function loadElement(el: Element): void {
    const src = el.getAttribute('data-src')
    if (!src) return

    if (el.tagName === 'IMG') {
      ;(el as HTMLImageElement).src = src
    } else {
      ;(el as HTMLElement).style.backgroundImage = `url(${src})`
    }
    el.removeAttribute('data-src')
    el.classList.add('c--slider-a--loaded')
  }

  return {
    name: 'lazyLoad',

    install(slider: SliderInstance) {
      if (!('IntersectionObserver' in window)) {
        // Fallback: load all immediately
        slider.container.querySelectorAll(selector).forEach(loadElement)
        return
      }

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              loadElement(entry.target)
              observer?.unobserve(entry.target)
            }
          })
        },
        { rootMargin }
      )

      slider.container.querySelectorAll(selector).forEach((el: Element) => observer!.observe(el))

      // Observe newly visible slides on change
      slider.on('afterSlideChange', () => {
        slider.container.querySelectorAll(selector).forEach((el: Element) => observer!.observe(el))
      })
    },

    destroy() {
      observer?.disconnect()
      observer = null
    },
  }
}
