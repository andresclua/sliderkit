import type { SliderPlugin } from '@acslider/core'
import type { SliderInstance } from '@acslider/core'

export interface ThumbnailsOptions {
  el?: string | HTMLElement
  clickable?: boolean
}

export function thumbnails(options: ThumbnailsOptions = {}): SliderPlugin {
  const { clickable = true } = options

  let slider: SliderInstance | null = null
  let container: HTMLElement | null = null
  let autoCreated = false

  function render(): void {
    if (!slider || !container) return
    const { slides, activeIndex } = slider
    container.innerHTML = ''

    slides.forEach((slide: HTMLElement, i: number) => {
      const thumb = document.createElement('div')
      thumb.className = 'c--slider-a__thumb'
      if (i === activeIndex) {
        thumb.classList.add('c--slider-a__thumb--active')
      }
      // Copy background image if data-src present
      const src = slide.getAttribute('data-src') ?? slide.querySelector('img')?.getAttribute('src')
      if (src) {
        thumb.style.backgroundImage = `url(${src})`
        thumb.style.backgroundSize = 'cover'
        thumb.style.backgroundPosition = 'center'
      }
      if (clickable) {
        thumb.setAttribute('role', 'button')
        thumb.setAttribute('tabindex', '0')
        thumb.setAttribute('aria-label', `Go to slide ${i + 1}`)
        thumb.addEventListener('click', () => slider?.goTo(i))
      }
      container!.appendChild(thumb)
    })
  }

  return {
    name: 'thumbnails',

    install(sliderInstance: SliderInstance) {
      slider = sliderInstance

      if (options.el) {
        const el =
          typeof options.el === 'string'
            ? document.querySelector<HTMLElement>(options.el)
            : options.el
        container = el
      }

      if (!container) {
        autoCreated = true
        container = document.createElement('div')
        container.className = 'c--slider-a__thumbs'
        sliderInstance.container.insertAdjacentElement('afterend', container)
      }

      render()
      slider.on('afterSlideChange', render as () => void)
    },

    destroy() {
      slider?.off('afterSlideChange', render as () => void)
      if (autoCreated) container?.remove()
      slider = null
      container = null
    },
  }
}
